export const meta = {
  key: "cod",
  name: "Cash on Delivery",
  category: "payment",
  type: "cod",
  logo: "/assets/logo/cod.png",
};

/**
 * Creates a Cash on Delivery payment session.
 * Does not require external gateway communication.
 */
export async function createPayment(order, options = {}) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL_FRONTEND ||
    process.env.NEXT_PUBLIC_WEB_URL ||
    "http://localhost:3000";

  const orderId = order._id ? String(order._id) : order.order_number || `ORD-${Date.now()}`;
  const redirectUrl = `${appUrl}/complete-order?order_id=${orderId}&transactionStatus=pending_cod`;

  return {
    success: true,
    paymentID: `COD-${order.order_number || Date.now()}`,
    redirectUrl,
    merchantInvoiceNumber: order.order_number,
    isImmediate: true,
    raw: { status: "pending_cod", method: "cod" },
  };
}

/**
 * COD verification: payment remains pending collection at delivery.
 */
export async function executeOrVerify(payload = {}) {
  return {
    success: true,
    status: "pending_cod",
    paymentID: payload.paymentID || `COD-${Date.now()}`,
    trxID: "COD-UPON-DELIVERY",
    amount: Number(payload.amount || 0),
    currency: "BDT",
    merchantInvoiceNumber: payload.order_number,
    raw: payload,
  };
}

export async function test() {
  return {
    ok: true,
    message: "Cash on Delivery operates locally without third-party credentials",
  };
}

const codAdapter = {
  meta,
  createPayment,
  executeOrVerify,
  test,
};

export default codAdapter;
