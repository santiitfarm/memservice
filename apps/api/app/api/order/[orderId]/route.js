import { CustomerProfile } from "@/app/models/customer-profile-model";
import { Order } from "@/app/models/order-model";
import { SAFE_CUSTOMER_FIELDS } from "@/lib/customer";
import { cancelOrder } from "@/lib/orders";
import connectMongo from "@/services/mongo";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectMongo();
  const id = (await params).orderId;
  try {
    const order = await Order.findById(id).populate({
      path: "customer",
      model: CustomerProfile,
      select: SAFE_CUSTOMER_FIELDS,
    });
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order.toObject(),
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectMongo();
    const orderId = (await params).orderId;
    const { status, payment_info } = await req.json();

    const order = await Order.findById(orderId).populate({
      path: "customer",
      model: CustomerProfile,
      select: SAFE_CUSTOMER_FIELDS,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status === "cancelled") {
      if (order.status === "cancelled") {
        return NextResponse.json(
          { error: "Order is already cancelled" },
          { status: 400 }
        );
      }

      await cancelOrder(order, payment_info);

      return NextResponse.json({
        success: true,
        order: order.toObject(),
      });
    }

    // Handle non-cancel status updates
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status, payment_info },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order update failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder.toObject(),
    });
  } catch (error) {
    console.error("Error in PUT /api/orders/[orderId]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
