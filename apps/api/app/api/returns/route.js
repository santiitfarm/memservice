import { getCustomer, getStaff, unauthorized, forbidden } from "@/lib/auth";
import { CustomerProfile } from "@/app/models/customer-profile-model";
import { Order } from "@/app/models/order-model";
import Product from "@/app/models/product-model";
import ReturnRequest from "@/app/models/ReturnRequest";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const DEFAULT_RETURN_WINDOW_DAYS = 7;

/**
 * GET /api/returns
 * - Staff: returns paginated list of all return requests with filters
 * - Customer: returns customer's own return requests
 */
export async function GET(request) {
  await connectMongo();

  const staff = await getStaff(request);
  const customer = await getCustomer(request);

  if (!staff && !customer) {
    return unauthorized("Authentication required");
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const query = {};

  if (customer && !staff) {
    query.customer = customer.id;
  }

  if (status) {
    query.status = status;
  }

  try {
    const [items, total] = await Promise.all([
      ReturnRequest.find(query)
        .populate({
          path: "customer",
          model: CustomerProfile,
          select: "customer_name phone_number email",
        })
        .populate({
          path: "order",
          model: Order,
          select: "order_number total_amount status payment_info delivery_date createdAt",
        })
        .populate({
          path: "items.productId",
          model: Product,
          select: "name slug images regular_price discount_price",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReturnRequest.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("GET /api/returns error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/returns
 * - Customer bearer auth required
 * - Checks order exists, belongs to customer, is delivered, and is within 7-day return window
 */
export async function POST(request) {
  await connectMongo();

  const customer = await getCustomer(request);
  if (!customer) {
    return unauthorized("Customer login required to request a return");
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { orderId, items, reason, notes, images } = body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, message: "Valid orderId is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one item must be specified for return" },
        { status: 400 }
      );
    }

    const validReasons = [
      "damaged",
      "wrong_item",
      "not_as_described",
      "expired",
      "other",
    ];
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json(
        {
          success: false,
          message: `Reason must be one of: ${validReasons.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Lookup order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (String(order.customer) !== String(customer.id)) {
      return forbidden("You can only request returns for your own orders");
    }

    // Verify order is delivered
    if (order.status !== "delivered") {
      return NextResponse.json(
        {
          success: false,
          message: `Returns can only be requested for delivered orders. Current order status is "${order.status}".`,
        },
        { status: 400 }
      );
    }

    // Verify return window
    const deliveredAt = order.delivery_date || order.updatedAt || order.createdAt;
    const windowMs = DEFAULT_RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - new Date(deliveredAt).getTime();
    if (elapsed > windowMs) {
      return NextResponse.json(
        {
          success: false,
          message: `The ${DEFAULT_RETURN_WINDOW_DAYS}-day return window for this order has expired.`,
        },
        { status: 400 }
      );
    }

    // Validate returned items exist in the order
    const sanitizedItems = [];
    for (const item of items) {
      const prodId = item.productId || item.id;
      if (!prodId || !mongoose.Types.ObjectId.isValid(prodId)) {
        return NextResponse.json(
          { success: false, message: `Invalid product ID in return items` },
          { status: 400 }
        );
      }
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);

      // Verify item was in the order
      const orderItem = order.items.find((i) => String(i.id) === String(prodId));
      if (!orderItem) {
        return NextResponse.json(
          {
            success: false,
            message: `Product ${prodId} was not part of order ${order.order_number}`,
          },
          { status: 400 }
        );
      }

      if (qty > orderItem.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Return quantity (${qty}) exceeds ordered quantity (${orderItem.quantity}) for "${orderItem.title}"`,
          },
          { status: 400 }
        );
      }

      sanitizedItems.push({
        productId: prodId,
        variantSku: item.variantSku || null,
        quantity: qty,
        reason: item.reason || reason,
      });
    }

    const returnDoc = await ReturnRequest.create({
      order: order._id,
      customer: customer.id,
      items: sanitizedItems,
      reason,
      notes: notes || "",
      images: Array.isArray(images) ? images : [],
      status: "requested",
      history: [
        {
          status: "requested",
          note: notes || "Return requested by customer",
          at: new Date(),
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Return request submitted successfully",
        returnRequest: returnDoc,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/returns error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
