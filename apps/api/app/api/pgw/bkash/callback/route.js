import { NextResponse } from "next/server";
import { executePayment } from "@/lib/bkash";
import { Order } from "@/app/models/order-model";
import { CustomerProfile } from "@/app/models/customer-profile-model";
import { SAFE_CUSTOMER_FIELDS } from "@/lib/customer";
import { cancelOrder } from "@/lib/orders";
import { sendOrderConfirmationEmail } from "@/lib/mailer";
import { sendMetaPurchaseEvent } from "@/lib/integrations/tracking/meta";

import connectMongo from "@/services/mongo";

export async function GET(request) {
  await connectMongo();
  try {
    const { searchParams } = new URL(request.url);
    const paymentID = searchParams.get("paymentID");
    const status = searchParams.get("status");
    if (!paymentID || !status) {
      return NextResponse.json(
        { error: "Missing paymentID or status" },
        { status: 400 }
      );
    }
    const order = await Order.findOne({ paymentID: paymentID });

    if (status === "success") {
      const executionResult = await executePayment(paymentID);
      // executionResult {
      //   paymentID: 'TR0011GEO7m2E1734526005543',
      //   trxID: 'BLI2705O2E',
      //   transactionStatus: 'Completed',
      //   amount: '1',
      //   currency: 'BDT',
      //   intent: 'sale',
      //   paymentExecuteTime: '2024-12-18T18:47:14:041 GMT+0600',
      //   merchantInvoiceNumber: 'ORD20241218KST184644',
      //   payerType: 'Customer',
      //   payerReference: '01758019050',
      //   customerMsisdn: '01758019050',
      //   payerAccount: '01758019050',
      //   statusCode: '0000',
      //   statusMessage: 'Successful'
      // }
      if (executionResult.statusCode === "0000") {
        order.payment_info.status = checkStatus(
          executionResult.amount,
          order.payment_info.amount
        );
        order.payment_info.transaction_amount = executionResult.amount;
        order.payment_info.transaction_id = executionResult.trxID;
        order.payment_info.transaction_number = executionResult.customerMsisdn;
        order.payment_info.transaction_status =
          executionResult.transactionStatus;
        order.payment_info.provider = "bkash";
        order.status =
          order.payment_info.status === "paid" ? "processing" : "pending";
        await order.save();

        if (order.payment_info.status === "paid") {
          sendOrderConfirmationEmail(order).catch((err) =>
            console.error("Failed to send order confirmation email:", err.message)
          );
          sendMetaPurchaseEvent(order, request).catch((err) =>
            console.warn("[meta-capi] Purchase event failed:", err.message)
          );
        }
        const redirectUrl = new URL(
          `${process.env.NEXT_PUBLIC_APP_URL_FRONTEND}/complete-order`
        );
        redirectUrl.searchParams.append("order_id", order._id);
        redirectUrl.searchParams.append(
          "invoice_no",
          executionResult.merchantInvoiceNumber
        );
        redirectUrl.searchParams.append(
          "transactionStatus",
          executionResult.transactionStatus
        );
        redirectUrl.searchParams.append("amount", executionResult.amount);
        redirectUrl.searchParams.append(
          "customerMsisdn",
          executionResult.customerMsisdn
        );
        redirectUrl.searchParams.append("trxID", executionResult.trxID);

        return NextResponse.redirect(redirectUrl);
      }
    } else {
      // Direct call (the public order PUT endpoint is staff-only)
      if (order && order.status !== "cancelled") {
        const populated = await Order.findById(order._id).populate({
          path: "customer",
          model: CustomerProfile,
          select: SAFE_CUSTOMER_FIELDS,
        });
        await cancelOrder(populated);
      }
      const redirectUrl = new URL(
        `${process.env.NEXT_PUBLIC_APP_URL_FRONTEND}/complete-order`
      );
      redirectUrl.searchParams.append("order_id", order._id);
      redirectUrl.searchParams.append("transactionStatus", "cancelled");
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("Error processing bKash callback:", error);
    return NextResponse.json(
      { error: "Failed to process bKash callback" },
      { status: 500 }
    );
  }
}

const checkStatus = (paid, total) => {
  if (paid >= total) {
    return "paid";
  } else if (paid > 0) {
    return "partially-paid";
  } else {
    return "unpaid";
  }
};
