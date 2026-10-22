import { NextResponse } from "next/server";
import crypto from "crypto";
import connectMongo from "@/services/mongo";
import WebhookEvent from "@/app/models/WebhookEvent";
import { Order } from "@/app/models/order-model";
import { getCourierAdapter } from "@/lib/integrations/couriers";

export async function POST(request, context) {
  await connectMongo();

  const params = await context.params;
  const providerKey = (params.provider || "").toLowerCase();
  const adapter = getCourierAdapter(providerKey);

  if (!adapter) {
    return NextResponse.json(
      { success: false, error: `Unknown courier provider: ${providerKey}` },
      { status: 400 }
    );
  }

  try {
    const rawBody = await request.text();
    let payload = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      const searchParams = new URLSearchParams(rawBody);
      payload = Object.fromEntries(searchParams.entries());
    }

    const { consignmentId, status } = await adapter.handleWebhook(payload);

    const eventId =
      consignmentId && status
        ? `${consignmentId}_${status}`
        : crypto.createHash("sha256").update(rawBody).digest("hex").slice(0, 32);

    // Idempotency check
    const existing = await WebhookEvent.findOne({ provider: providerKey, eventId });
    if (existing && existing.status === "processed") {
      return NextResponse.json(
        { success: true, message: "Duplicate courier webhook already processed" },
        { status: 200 }
      );
    }

    const eventRecord =
      existing ||
      (await WebhookEvent.create({
        provider: providerKey,
        eventId,
        payload,
        status: "received",
      }));

    if (consignmentId) {
      const order = await Order.findOne({
        $or: [
          { "shipment.consignmentId": consignmentId },
          { "shipment.trackingCode": consignmentId },
          { order_number: consignmentId },
        ],
      });

      if (order && order.shipment) {
        eventRecord.orderId = order._id;
        const prevStatus = order.shipment.status;

        if (status && prevStatus !== status) {
          order.shipment.status = status;
          order.shipment.history.push({
            status,
            message: `Courier webhook update: ${status}`,
            timestamp: new Date(),
          });

          if (status === "delivered") {
            order.status = "delivered";
            order.delivery_date = new Date();
            if (order.payment_info?.method === "cod") {
              order.payment_info.status = "paid";
              order.payment_info.transaction_status = "Completed";
            }
          } else if (status === "returned") {
            order.status = "cancelled";
          }

          await order.save();
        }
      }
    }

    eventRecord.status = "processed";
    eventRecord.processedAt = new Date();
    await eventRecord.save();

    return NextResponse.json({ success: true, message: "Courier webhook processed" });
  } catch (error) {
    console.error(`Error in /api/couriers/${providerKey}/webhook:`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process courier webhook" },
      { status: 500 }
    );
  }
}
