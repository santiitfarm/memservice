import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongo from "@/services/mongo";
import { Order } from "@/app/models/order-model";
import { getCourierAdapter } from "@/lib/integrations/couriers";

export async function GET(request, context) {
  try {
    await connectMongo();

    const params = await context.params;
    const orderId = params.orderId;

    const isMongoId = mongoose.Types.ObjectId.isValid(orderId);
    const order = await Order.findOne({
      $or: [
        { _id: isMongoId ? orderId : null },
        { order_number: orderId },
      ],
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (!order.shipment || !order.shipment.consignmentId) {
      return NextResponse.json(
        { success: false, error: "No shipment booked for this order yet" },
        { status: 400 }
      );
    }

    const providerKey = order.shipment.provider;
    const adapter = getCourierAdapter(providerKey);

    if (!adapter) {
      return NextResponse.json(
        { success: false, error: `Unsupported courier provider: ${providerKey}` },
        { status: 400 }
      );
    }

    // Refresh live status from courier gateway
    const statusResult = await adapter.getStatus(order.shipment.consignmentId);
    const previousStatus = order.shipment.status;
    const newStatus = statusResult.status;

    if (previousStatus !== newStatus) {
      order.shipment.status = newStatus;
      order.shipment.history.push({
        status: newStatus,
        message: `Live status updated from courier: ${statusResult.rawStatus || newStatus}`,
        timestamp: new Date(),
      });

      if (newStatus === "delivered") {
        order.status = "delivered";
        order.delivery_date = new Date();
        if (order.payment_info?.method === "cod") {
          order.payment_info.status = "paid";
          order.payment_info.transaction_status = "Completed";
        }
      } else if (newStatus === "returned") {
        order.status = "cancelled";
      }

      await order.save();
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      rawStatus: statusResult.rawStatus,
      shipment: order.shipment,
      order,
    });
  } catch (error) {
    console.error("GET /api/order/[orderId]/shipment/status error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to refresh shipment status" },
      { status: 500 }
    );
  }
}
