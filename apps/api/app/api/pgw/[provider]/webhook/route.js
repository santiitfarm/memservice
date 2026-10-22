import { NextResponse } from "next/server";
import crypto from "crypto";
import connectMongo from "@/services/mongo";
import WebhookEvent from "@/app/models/WebhookEvent";
import { Order } from "@/app/models/order-model";
import { getPaymentAdapter } from "@/lib/integrations/payments";
import { sendOrderConfirmationEmail } from "@/lib/mailer";
import { sendMetaPurchaseEvent } from "@/lib/integrations/tracking/meta";

export async function POST(request, context) {
  await connectMongo();

  const params = await context.params;
  const provider = params.provider.toLowerCase();
  const adapter = getPaymentAdapter(provider);

  if (!adapter) {
    return NextResponse.json(
      { success: false, error: "Unknown gateway provider" },
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

    // Determine unique eventId for idempotency
    const eventId =
      payload.val_id ||
      payload.paymentID ||
      payload.trxID ||
      payload.mer_txnid ||
      payload.tran_id ||
      crypto.createHash("sha256").update(rawBody).digest("hex").slice(0, 32);

    // Idempotency check: prevent duplicate execution
    const existingEvent = await WebhookEvent.findOne({ provider, eventId });
    if (existingEvent && existingEvent.status === "processed") {
      return NextResponse.json(
        { success: true, message: "Duplicate webhook already processed" },
        { status: 200 }
      );
    }

    const webhookRecord =
      existingEvent ||
      (await WebhookEvent.create({
        provider,
        eventId,
        payload,
        status: "received",
      }));

    // Verify transaction
    const verification = await adapter.executeOrVerify(payload);

    const searchKeys = [
      payload.paymentID,
      payload.tran_id,
      payload.order_id,
      payload.mer_txnid,
      verification.paymentID,
      verification.merchantInvoiceNumber,
    ].filter(Boolean);

    let order = null;
    if (searchKeys.length > 0) {
      order = await Order.findOne({
        $or: [
          { paymentID: { $in: searchKeys } },
          { order_number: { $in: searchKeys } },
          { _id: searchKeys.find((k) => /^[a-f0-9]{24}$/i.test(k)) || null },
        ],
      });
    }

    if (order && verification.success && verification.status === "paid") {
      webhookRecord.orderId = order._id;

      if (order.payment_info?.status !== "paid") {
        order.payment_info = {
          ...(order.payment_info || {}),
          status: "paid",
          provider,
          transaction_amount: verification.amount || order.total_amount,
          transaction_id: verification.trxID || verification.paymentID,
          transaction_status: "Completed",
          transaction_number: verification.payerNumber || "",
        };

        order.status = "processing";
        await order.save();

        sendOrderConfirmationEmail(order).catch((err) =>
          console.error("Webhook order confirmation email failed:", err.message)
        );

        sendMetaPurchaseEvent(order, request).catch((err) =>
          console.warn("[meta-capi] Webhook purchase event failed:", err.message)
        );
      }
    }

    webhookRecord.status = "processed";
    webhookRecord.processedAt = new Date();
    await webhookRecord.save();

    return NextResponse.json({ success: true, eventId }, { status: 200 });
  } catch (error) {
    console.error(`POST /api/pgw/${provider}/webhook error:`, error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
