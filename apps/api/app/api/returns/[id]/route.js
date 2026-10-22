import { getCustomer, getStaff, unauthorized, forbidden } from "@/lib/auth";
import { CustomerProfile } from "@/app/models/customer-profile-model";
import { Order } from "@/app/models/order-model";
import Product from "@/app/models/product-model";
import ReturnRequest from "@/app/models/ReturnRequest";
import StockMovement from "@/app/models/StockMovement";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connectMongo();
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid return ID" },
      { status: 400 }
    );
  }

  const staff = await getStaff(request);
  const customer = await getCustomer(request);

  if (!staff && !customer) {
    return unauthorized();
  }

  try {
    const returnDoc = await ReturnRequest.findById(id)
      .populate({
        path: "customer",
        model: CustomerProfile,
        select: "customer_name phone_number email",
      })
      .populate({
        path: "order",
        model: Order,
      })
      .populate({
        path: "items.productId",
        model: Product,
        select: "name slug images regular_price discount_price",
      });

    if (!returnDoc) {
      return NextResponse.json(
        { success: false, message: "Return request not found" },
        { status: 404 }
      );
    }

    // Customer can only view their own
    if (customer && !staff && String(returnDoc.customer._id) !== String(customer.id)) {
      return forbidden();
    }

    return NextResponse.json({
      success: true,
      returnRequest: returnDoc,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/returns/[id]
 * Staff endpoint to update return status: approve, reject, receive, refund, close.
 * If status is 'received' and restock is true: writes StockMovement and increments Product.stock.
 */
export async function PUT(request, { params }) {
  await connectMongo();
  const { id } = await params;

  const staff = await getStaff(request);
  if (!staff) {
    return unauthorized("Staff access required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid return ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { status, refund, note, restock = true } = body;

    const returnDoc = await ReturnRequest.findById(id);
    if (!returnDoc) {
      return NextResponse.json(
        { success: false, message: "Return request not found" },
        { status: 404 }
      );
    }

    const validStatuses = [
      "requested",
      "approved",
      "rejected",
      "received",
      "refunded",
      "closed",
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Status must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const previousStatus = returnDoc.status;
    if (status) {
      returnDoc.status = status;
    }

    // Handle restocking when transition into 'received' or explicit restock flag
    if (
      (status === "received" && previousStatus !== "received" && restock) ||
      (body.action === "restock" && !returnDoc.restocked)
    ) {
      for (const item of returnDoc.items) {
        const prod = await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: {
              stock: item.quantity,
              sold_out: -item.quantity,
            },
          },
          { new: true }
        );

        if (prod) {
          await StockMovement.create({
            product: prod._id,
            variantSku: item.variantSku || null,
            delta: item.quantity,
            reason: "return",
            reference: `Return #${returnDoc._id} (Order #${returnDoc.order})`,
            balanceAfter: prod.stock,
            by: staff.id,
            at: new Date(),
          });
        }
      }
      returnDoc.restocked = true;
    }

    // Handle refund record
    if (refund && typeof refund === "object") {
      returnDoc.refund = {
        method: refund.method || returnDoc.refund?.method || "",
        amount: Number(refund.amount) || returnDoc.refund?.amount || 0,
        reference: refund.reference || returnDoc.refund?.reference || "",
        processedBy: staff.id,
        processedAt: new Date(),
      };

      // Also update order payment status if status is refunded
      if (status === "refunded") {
        await Order.findByIdAndUpdate(returnDoc.order, {
          "payment_info.status": "refunded",
          status: "returned",
        });
      }
    }

    // Append to audit history
    returnDoc.history.push({
      status: returnDoc.status,
      note: note || `Status updated to ${returnDoc.status} by staff`,
      by: staff.id,
      at: new Date(),
    });

    await returnDoc.save();

    return NextResponse.json({
      success: true,
      message: `Return request updated to ${returnDoc.status}`,
      returnRequest: returnDoc,
    });
  } catch (error) {
    console.error("PUT /api/returns/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
