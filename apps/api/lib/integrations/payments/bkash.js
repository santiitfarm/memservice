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

// Token cache per base URL to prevent repeated grant calls
const tokenMemory = new Map();

async function getBkashToken(integration) {
  const { config, secrets } = integration;
  const baseUrl = config.baseUrl || "https://tokenized.sandbox.bka.sh/v2.0.0-beta";
  const appKey = secrets.appKey;
  const appSecret = secrets.appSecret;
  const username = secrets.username;
  const password = secrets.password;

  if (!appKey || !appSecret || !username || !password) {
    throw new Error("bKash credentials missing: appKey, appSecret, username, and password are required");
  }

  const cached = tokenMemory.get(appKey);
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.id_token;
  }

  const res = await fetchWithTimeout(`${baseUrl}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username,
      password,
    },
    body: JSON.stringify({
      app_key: appKey,
      app_secret: appSecret,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.statusCode !== "0000" || !data.id_token) {
    throw new Error(data.statusMessage || `bKash token grant failed with status ${res.status}`);
  }

  tokenMemory.set(appKey, {
    id_token: data.id_token,
    refresh_token: data.refresh_token,
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
  });

  return data.id_token;
}

export const meta = {
  key: "bkash",
  name: "bKash Tokenized Checkout",
  category: "payment",
  type: "gateway",
  logo: "/assets/logo/bkash.png",
};

/**
 * Creates a bKash tokenized payment session for an order.
 */
export async function createPayment(order, options = {}) {
  const integration = await getIntegration("bkash");
  if (!integration || !integration.enabled) {
    throw new Error("bKash payment gateway is currently disabled or unconfigured");
  }

  const { config, secrets } = integration;
  const baseUrl = config.baseUrl || "https://tokenized.sandbox.bka.sh/v2.0.0-beta";
  const idToken = await getBkashToken(integration);

  const amount = Number(order.total_amount || order.payment_info?.amount || 0).toFixed(2);
  const merchantInvoiceNumber = order.order_number || `ORD-${Date.now()}`;
  const payerReference =
    order.phone_number || order.customer?.phone_number || "01700000000";

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL_DEV ||
    process.env.API_URL ||
    "http://localhost:3001";
  const callbackURL = `${appUrl}/api/pgw/bkash/callback`;

  const payload = {
    mode: "0011",
    payerReference,
    callbackURL,
    amount,
    currency: "BDT",
    intent: "sale",
    merchantInvoiceNumber,
  };

  const res = await fetchWithTimeout(`${baseUrl}/tokenized/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: idToken,
      "X-APP-Key": secrets.appKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.statusCode !== "0000" || !data.bkashURL) {
    throw new Error(data.statusMessage || "bKash payment session creation failed");
  }

  return {
    success: true,
    paymentID: data.paymentID,
    redirectUrl: data.bkashURL,
    merchantInvoiceNumber,
    raw: data,
  };
}

/**
 * Executes a bKash payment upon user completion at callback.
 */
export async function executeOrVerify(payload = {}) {
  const integration = await getIntegration("bkash");
  if (!integration) throw new Error("bKash integration not configured");

  const { paymentID, status } = payload;

  if (status !== "success" || !paymentID) {
    return {
      success: false,
      status: "cancelled",
      paymentID,
      reason: payload.statusMessage || "Payment was cancelled or failed by user",
    };
  }

  const { config, secrets } = integration;
  const baseUrl = config.baseUrl || "https://tokenized.sandbox.bka.sh/v2.0.0-beta";
  const idToken = await getBkashToken(integration);

  const res = await fetchWithTimeout(`${baseUrl}/tokenized/checkout/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: idToken,
      "X-APP-Key": secrets.appKey,
    },
    body: JSON.stringify({ paymentID }),
  });

  const data = await res.json().catch(() => ({}));

  if (data.statusCode === "0000") {
    return {
      success: true,
      status: "paid",
      paymentID: data.paymentID,
      trxID: data.trxID,
      amount: Number(data.amount),
      currency: data.currency || "BDT",
      payerNumber: data.customerMsisdn,
      merchantInvoiceNumber: data.merchantInvoiceNumber,
      raw: data,
    };
  }

  return {
    success: false,
    status: "failed",
    paymentID,
    reason: data.statusMessage || "Execution failed",
    raw: data,
  };
}

/**
 * Verifies adapter credentials without charging real transactions.
 */
export async function test(customConfig, customSecrets) {
  const integration = {
    config: customConfig || (await getIntegration("bkash"))?.config || {},
    secrets: customSecrets || (await getIntegration("bkash"))?.secrets || {},
  };

  try {
    const token = await getBkashToken(integration);
    return {
      ok: Boolean(token),
      message: "Successfully authenticated with bKash API & acquired auth token",
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message,
    };
  }
}

const bkashAdapter = {
  meta,
  createPayment,
  executeOrVerify,
  test,
};

export default bkashAdapter;
