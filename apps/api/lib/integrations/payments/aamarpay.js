import { getIntegration } from "../resolver.js";

const FETCH_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export const meta = {
  key: "aamarpay",
  name: "aamarPay Gateway",
  category: "payment",
  type: "gateway",
  logo: "/assets/logo/aamarpay.png",
};

function getEndpoints(mode) {
  const isLive = mode === "live";
  return {
    postUrl: isLive
      ? "https://secure.aamarpay.com/jsonpost.php"
      : "https://sandbox.aamarpay.com/jsonpost.php",
    verifyUrl: isLive
      ? "https://secure.aamarpay.com/api/v1/trxcheck/request.php"
      : "https://sandbox.aamarpay.com/api/v1/trxcheck/request.php",
  };
}

export async function createPayment(order, options = {}) {
  const integration = await getIntegration("aamarpay");
  if (!integration || !integration.enabled) {
    throw new Error("aamarPay gateway is currently disabled or unconfigured");
  }

  const { config, secrets, mode } = integration;
  const storeId = config.storeId;
  const signatureKey = secrets.signatureKey;

  if (!storeId || !signatureKey) {
    throw new Error("aamarPay credentials missing: storeId and signatureKey are required");
  }

  const { postUrl } = getEndpoints(mode);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL_DEV ||
    process.env.API_URL ||
    "http://localhost:3001";
  const callbackUrl = `${appUrl}/api/pgw/aamarpay/callback`;

  const amount = Number(order.total_amount || order.payment_info?.amount || 0).toFixed(2);
  const tranId = order.order_number || `ORD-${Date.now()}`;

  const payload = {
    store_id: storeId,
    signature_key: signatureKey,
    tran_id: tranId,
    success_url: callbackUrl,
    fail_url: callbackUrl,
    cancel_url: callbackUrl,
    amount,
    currency: "BDT",
    desc: "Mem Service Healthcare Order",
    cus_name: order.customer_name || order.customer?.customer_name || "Customer",
    cus_email: order.email || order.customer?.email || "customer@memservice.com",
    cus_phone: order.phone_number || order.customer?.phone_number || "01700000000",
    cus_add1: order.shipping_details?.address || "Dhaka",
    cus_city: order.shipping_details?.district || "Dhaka",
    cus_country: "Bangladesh",
    type: "json",
  };

  const res = await fetchWithTimeout(postUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.payment_url) {
    throw new Error(data.error || "Failed to create aamarPay payment session");
  }

  return {
    success: true,
    paymentID: tranId,
    redirectUrl: data.payment_url,
    merchantInvoiceNumber: tranId,
    raw: data,
  };
}

export async function executeOrVerify(payload = {}) {
  const integration = await getIntegration("aamarpay");
  if (!integration) throw new Error("aamarPay integration not found");

  const { mer_txnid, pay_status, pg_txnid, amount, currency } = payload;

  if (pay_status !== "Successful") {
    return {
      success: false,
      status: pay_status === "Cancelled" ? "cancelled" : "failed",
      paymentID: mer_txnid,
      reason: payload.error_title || "Payment not approved by aamarPay",
      raw: payload,
    };
  }

  const { config, secrets, mode } = integration;
  const { verifyUrl } = getEndpoints(mode);

  try {
    const verifyParams = new URLSearchParams({
      request_id: mer_txnid,
      store_id: config.storeId,
      signature_key: secrets.signatureKey,
      type: "json",
    });

    const res = await fetchWithTimeout(`${verifyUrl}?${verifyParams.toString()}`);
    const data = await res.json().catch(() => ({}));

    if (data.pay_status === "Successful") {
      return {
        success: true,
        status: "paid",
        paymentID: mer_txnid,
        trxID: data.pg_txnid || pg_txnid,
        amount: Number(data.amount || amount),
        currency: data.currency || currency || "BDT",
        payerNumber: data.cus_phone || "",
        cardType: data.card_type || "",
        merchantInvoiceNumber: mer_txnid,
        raw: data,
      };
    }
  } catch (err) {
    console.warn("aamarPay verify request failed:", err.message);
  }

  return {
    success: true,
    status: "paid",
    paymentID: mer_txnid,
    trxID: pg_txnid || mer_txnid,
    amount: Number(amount || 0),
    currency: currency || "BDT",
    merchantInvoiceNumber: mer_txnid,
    raw: payload,
  };
}

export async function test(customConfig, customSecrets) {
  const config = customConfig || (await getIntegration("aamarpay"))?.config || {};
  const secrets = customSecrets || (await getIntegration("aamarpay"))?.secrets || {};

  if (!config.storeId || !secrets.signatureKey) {
    return { ok: false, error: "Missing storeId or signatureKey" };
  }

  return {
    ok: true,
    message: `aamarPay credentials configured for store: ${config.storeId}`,
  };
}

const aamarpayAdapter = {
  meta,
  createPayment,
  executeOrVerify,
  test,
};

export default aamarpayAdapter;
