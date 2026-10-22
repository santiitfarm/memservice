import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongo from "@/services/mongo";
import { Order } from "@/app/models/order-model";
import { CustomerProfile } from "@/app/models/customer-profile-model";
import { getStaff, rankOf } from "@/lib/auth";
import { getCourierAdapter } from "@/lib/integrations/couriers";
import { sendOrderShippedEmail } from "@/lib/mailer";

export async function POST(request, context) {
  try {
    await connectMongo();

    const staff = await getStaff(request);
    if (!staff || rankOf(staff.role) < 1) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Staff privileges required." },
        { status: 403 }
      );
    }

    const params = await context.params;
    const orderId = params.orderId;

    const isMongoId = mongoose.Types.ObjectId.isValid(orderId);
    const order = await Order.findOne({
      $or: [
        { _id: isMongoId ? orderId : null },
        { order_number: orderId },
      ],
    }).populate({
      path: "customer",
      model: CustomerProfile,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const providerKey = (body.provider || order.shipping_details?.courier || "steadfast").toLowerCase();
    const adapter = getCourierAdapter(providerKey);

    if (!adapter) {
      return NextResponse.json(
        { success: false, error: `Unsupported courier provider: ${providerKey}` },
        { status: 400 }
      );
    }

    // Call courier adapter to book shipment
    const booking = await adapter.createShipment(order, body);

    const shipmentInfo = {
      provider: providerKey,
      consignmentId: booking.consignmentId,
      trackingCode: booking.trackingCode,
      trackingUrl: booking.trackingUrl,
      status: booking.status || "pending",
      fee: booking.fee || 0,
      bookedAt: new Date(),
      bookedBy: staff.id || null,
      history: [
        {
          status: booking.status || "pending",
          message: `Consignment booked with ${adapter.meta.name}. Tracking: ${booking.trackingCode}`,
          timestamp: new Date(),
        },
      ],
    };

    order.shipment = shipmentInfo;
    order.tracking_number = booking.trackingCode;
    order.status = "shipped";
    order.shipping_date = new Date();
    await order.save();

    // Trigger transactional orderShipped email asynchronously
    sendOrderShippedEmail(order, {
      courierName: adapter.meta.name,
      consignmentId: booking.consignmentId,
      trackingUrl: booking.trackingUrl,
    }).catch((err) =>
      console.error("[shipment] Failed to send orderShipped email:", err.message)
    );

    return NextResponse.json({
      success: true,
      message: `Shipment booked successfully with ${adapter.meta.name}`,
      shipment: order.shipment,
      order,
    });
  } catch (error) {
    console.error("POST /api/order/[orderId]/shipment error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to book shipment" },
      { status: 500 }
    );
  }
}
