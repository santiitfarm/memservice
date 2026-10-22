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
  key: "shurjopay",
  name: "ShurjoPay Checkout",
  category: "payment",
  type: "gateway",
  logo: "/assets/logo/shurjopay.png",
};

async function getShurjoPayToken(baseUrl, username, password) {
  const res = await fetchWithTimeout(`${baseUrl}/get_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sp_user: username, sp_pass: password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.token) {
    throw new Error(data.message || "Failed to acquire ShurjoPay auth token");
  }
  return data.token;
}

export async function createPayment(order, options = {}) {
  const integration = await getIntegration("shurjopay");
  if (!integration || !integration.enabled) {
    throw new Error("ShurjoPay gateway is currently disabled or unconfigured");
  }

  const { config, secrets } = integration;
  const username = config.username;
  const password = secrets.password;
  const prefix = config.prefix || "NOK";
  const baseUrl = config.endpoint || "https://sandbox.shurjopayment.com/api";

  if (!username || !password) {
    throw new Error("ShurjoPay credentials missing: username and password are required");
  }

  const token = await getShurjoPayToken(baseUrl, username, password);

  const amount = Number(order.total_amount || order.payment_info?.amount || 0).toFixed(2);
  const orderId = order.order_number || `ORD-${Date.now()}`;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL_DEV ||
    process.env.API_URL ||
    "http://localhost:3001";
  const returnUrl = `${appUrl}/api/pgw/shurjopay/callback`;

  const payload = {
    prefix,
    token,
    return_url: returnUrl,
    cancel_url: returnUrl,
    amount,
    order_id: orderId,
    currency: "BDT",
    customer_name: order.customer_name || order.customer?.customer_name || "Customer",
    customer_address: order.shipping_details?.address || "Dhaka",
    customer_email: order.email || order.customer?.email || "customer@memservice.com",
    customer_phone: order.phone_number || order.customer?.phone_number || "01700000000",
    customer_city: order.shipping_details?.district || "Dhaka",
    client_ip: "127.0.0.1",
  };

  const res = await fetchWithTimeout(`${baseUrl}/secret-pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.checkout_url) {
    throw new Error(data.message || "Failed to initiate ShurjoPay session");
  }

  return {
    success: true,
    paymentID: data.sp_order_id || orderId,
    redirectUrl: data.checkout_url,
    merchantInvoiceNumber: orderId,
    raw: data,
  };
}

export async function executeOrVerify(payload = {}) {
  const integration = await getIntegration("shurjopay");
  if (!integration) throw new Error("ShurjoPay integration not found");

  const { order_id, sp_code, message } = payload;

  const { config, secrets } = integration;
  const username = config.username;
  const password = secrets.password;
  const baseUrl = config.endpoint || "https://sandbox.shurjopayment.com/api";

  try {
    const token = await getShurjoPayToken(baseUrl, username, password);

    const res = await fetchWithTimeout(`${baseUrl}/verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ order_id }),
    });

    const data = await res.json().catch(() => ({}));
    const record = Array.isArray(data) ? data[0] : data;

    if (record && record.sp_code === "1000") {
      return {
        success: true,
        status: "paid",
        paymentID: record.sp_order_id || order_id,
        trxID: record.bank_trx_id || record.sp_order_id,
        amount: Number(record.amount),
        currency: record.currency || "BDT",
        payerNumber: record.phone_no || "",
        cardType: record.method || "",
        merchantInvoiceNumber: record.customer_order_id || order_id,
        raw: record,
      };
    }
  } catch (err) {
    console.warn("ShurjoPay verification query failed:", err.message);
  }

  if (sp_code === "1000") {
    return {
      success: true,
      status: "paid",
      paymentID: order_id,
      trxID: order_id,
      amount: Number(payload.amount || 0),
      currency: "BDT",
      merchantInvoiceNumber: order_id,
      raw: payload,
    };
  }

  return {
    success: false,
    status: "failed",
    paymentID: order_id,
    reason: message || "ShurjoPay payment not approved",
    raw: payload,
  };
}

export async function test(customConfig, customSecrets) {
  const config = customConfig || (await getIntegration("shurjopay"))?.config || {};
  const secrets = customSecrets || (await getIntegration("shurjopay"))?.secrets || {};

  const username = config.username;
  const password = secrets.password;
  const baseUrl = config.endpoint || "https://sandbox.shurjopayment.com/api";

  if (!username || !password) {
    return { ok: false, error: "Missing username or password" };
  }

  try {
    const token = await getShurjoPayToken(baseUrl, username, password);
    return {
      ok: Boolean(token),
      message: "Successfully authenticated with ShurjoPay API",
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

const shurjopayAdapter = {
  meta,
  createPayment,
  executeOrVerify,
  test,
};

export default shurjopayAdapter;
