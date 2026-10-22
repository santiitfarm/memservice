import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import { Order } from "@/app/models/order-model";
import { CustomerProfile } from "@/app/models/customer-profile-model";
import { SAFE_CUSTOMER_FIELDS } from "@/lib/customer";
import { cancelOrder } from "@/lib/orders";
import { getPaymentAdapter } from "@/lib/integrations/payments";
import { sendOrderConfirmationEmail } from "@/lib/mailer";
import { sendMetaPurchaseEvent } from "@/lib/integrations/tracking/meta";

async function parsePayload(request) {
  const method = request.method;
  const url = new URL(request.url);
  const queryObj = Object.fromEntries(url.searchParams.entries());

  if (method === "GET") {
    return queryObj;
  }

  // Handle POST (form urlencoded or JSON)
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await request.json().catch(() => ({}));
    return { ...queryObj, ...json };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData().catch(() => null);
    if (formData) {
      const formObj = {};
      for (const [k, v] of formData.entries()) {
        formObj[k] = v;
      }
      return { ...queryObj, ...formObj };
    }
  }

  return queryObj;
}

async function handleCallback(request, context) {
  await connectMongo();

  const params = await context.params;
  const provider = params.provider.toLowerCase();
  const adapter = getPaymentAdapter(provider);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL_FRONTEND ||
    process.env.NEXT_PUBLIC_WEB_URL ||
    "http://localhost:3000";

  if (!adapter) {
    console.error(`Unknown payment gateway provider: ${provider}`);
    return NextResponse.redirect(`${appUrl}/complete-order?transactionStatus=error&reason=unknown_provider`);
  }

  const payload = await parsePayload(request);

  try {
    const verification = await adapter.executeOrVerify(payload);

    // Locate the matching Order
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

    if (!order) {
      console.warn(`Order not found for ${provider} callback:`, searchKeys);
      return NextResponse.redirect(
        `${appUrl}/complete-order?transactionStatus=${verification.status || "failed"}&provider=${provider}`
      );
    }

    if (verification.success && (verification.status === "paid" || verification.status === "Completed")) {
      // Payment successful
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

      // Trigger confirmation email asynchronously (does not block redirect)
      sendOrderConfirmationEmail(order).catch((err) =>
        console.error("Order confirmation email failed:", err.message)
      );

      // Trigger Meta Conversions API Purchase event asynchronously
      sendMetaPurchaseEvent(order, request).catch((err) =>
        console.warn("[meta-capi] Purchase event failed:", err.message)
      );

      const redirectUrl = new URL(`${appUrl}/complete-order`);
      redirectUrl.searchParams.append("order_id", String(order._id));
      redirectUrl.searchParams.append("invoice_no", order.order_number);
      redirectUrl.searchParams.append("transactionStatus", "Completed");
      redirectUrl.searchParams.append("amount", String(verification.amount || order.total_amount));
      redirectUrl.searchParams.append("trxID", String(verification.trxID || verification.paymentID));
      redirectUrl.searchParams.append("provider", provider);

      return NextResponse.redirect(redirectUrl);
    } else {
      // Payment cancelled or failed
      if (order.status !== "cancelled") {
        const populated = await Order.findById(order._id).populate({
          path: "customer",
          model: CustomerProfile,
          select: SAFE_CUSTOMER_FIELDS,
        });
        await cancelOrder(populated || order);
      }

      const redirectUrl = new URL(`${appUrl}/complete-order`);
      redirectUrl.searchParams.append("order_id", String(order._id));
      redirectUrl.searchParams.append("transactionStatus", verification.status || "cancelled");
      redirectUrl.searchParams.append("provider", provider);
      if (verification.reason) {
        redirectUrl.searchParams.append("reason", verification.reason);
      }

      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error(`Error in /api/pgw/${provider}/callback:`, error);
    return NextResponse.redirect(
      `${appUrl}/complete-order?transactionStatus=error&reason=${encodeURIComponent(error.message)}`
    );
  }
}

export async function GET(request, context) {
  return handleCallback(request, context);
}

export async function POST(request, context) {
  return handleCallback(request, context);
}
