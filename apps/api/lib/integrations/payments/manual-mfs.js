import { getIntegration } from "../resolver.js";

export const meta = {
  key: "manual_mfs",
  name: "Manual MFS (bKash / Nagad / Rocket)",
  category: "payment",
  type: "manual",
  logo: "/assets/logo/mfs.png",
};

/**
 * Creates a manual MFS payment request.
 * Sets the order status to pending verification of the customer's TrxID.
 */
export async function createPayment(order, options = {}) {
  const integration = await getIntegration("manual_mfs");
  const config = integration?.config || {};

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL_FRONTEND ||
    process.env.NEXT_PUBLIC_WEB_URL ||
    "http://localhost:3000";

  const orderId = order._id ? String(order._id) : order.order_number || `ORD-${Date.now()}`;
  const redirectUrl = `${appUrl}/complete-order?order_id=${orderId}&transactionStatus=pending_verification`;

  return {
    success: true,
    paymentID: `MANUAL-${order.order_number || Date.now()}`,
    redirectUrl,
    merchantInvoiceNumber: order.order_number,
    isImmediate: true,
    instructions: {
      bkash: config.bkashNumber || "01711655686",
      nagad: config.nagadNumber || "01711655686",
      rocket: config.rocketNumber || "017116556868",
      text:
        config.instructions ||
        "Please send money to our official number and submit the TrxID.",
    },
    raw: { status: "pending_verification", method: "manual_mfs" },
  };
}

export async function executeOrVerify(payload = {}) {
  return {
    success: true,
    status: "pending_verification",
    paymentID: payload.paymentID || `MANUAL-${Date.now()}`,
    trxID: payload.trxID || payload.transaction_id || "PENDING-VERIFY",
    amount: Number(payload.amount || 0),
    currency: "BDT",
    merchantInvoiceNumber: payload.order_number,
    raw: payload,
  };
}

export async function test() {
  const integration = await getIntegration("manual_mfs");
  return {
    ok: true,
    message: `Manual MFS numbers configured: bKash (${integration?.config?.bkashNumber || "N/A"}), Nagad (${integration?.config?.nagadNumber || "N/A"})`,
  };
}

const manualMfsAdapter = {
  meta,
  createPayment,
  executeOrVerify,
  test,
};

export default manualMfsAdapter;
