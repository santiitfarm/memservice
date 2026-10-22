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
  key: "sslcommerz",
  name: "SSLCommerz (Cards / MFS / Net Banking)",
  category: "payment",
  type: "gateway",
  logo: "/assets/logo/sslcommerz.png",
};

function getEndpoints(isLive) {
  const base = isLive
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";

  return {
    initUrl: `${base}/gwprocess/v4/api.php`,
    validateUrl: `${base}/validator/api/validationserverAPI.php`,
  };
}

export async function createPayment(order, options = {}) {
  const integration = await getIntegration("sslcommerz");
  if (!integration || !integration.enabled) {
    throw new Error("SSLCommerz gateway is currently disabled or unconfigured");
  }

  const { config, secrets, mode } = integration;
  const storeId = config.storeId;
  const storePassword = secrets.storePassword;

  if (!storeId || !storePassword) {
    throw new Error("SSLCommerz credentials missing: storeId and storePassword are required");
  }

  const isLive = mode === "live";
  const { initUrl } = getEndpoints(isLive);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL_DEV ||
    process.env.API_URL ||
    "http://localhost:3001";
  const callbackUrl = `${appUrl}/api/pgw/sslcommerz/callback`;

  const totalAmount = Number(order.total_amount || order.payment_info?.amount || 0).toFixed(2);
  const tranId = order.order_number || `ORD-${Date.now()}`;

  const params = new URLSearchParams();
  params.append("store_id", storeId);
  params.append("store_passwd", storePassword);
  params.append("total_amount", totalAmount);
  params.append("currency", "BDT");
  params.append("tran_id", tranId);
  params.append("success_url", callbackUrl);
  params.append("fail_url", callbackUrl);
  params.append("cancel_url", callbackUrl);
  params.append("ipn_url", `${appUrl}/api/pgw/sslcommerz/webhook`);

  // Customer details
  params.append("cus_name", order.customer_name || order.customer?.customer_name || "Customer");
  params.append("cus_email", order.email || order.customer?.email || "customer@memservice.com");
  params.append("cus_phone", order.phone_number || order.customer?.phone_number || "01700000000");
  params.append("cus_add1", order.shipping_details?.address || "Dhaka, Bangladesh");
  params.append("cus_city", order.shipping_details?.district || "Dhaka");
  params.append("cus_country", "Bangladesh");

  // Shipping details
  params.append("shipping_method", "Courier");
  params.append("num_of_item", String(order.items?.length || 1));
  params.append("product_name", "Medicines & Health Essentials");
  params.append("product_category", "Healthcare");
  params.append("product_profile", "general");

  const res = await fetchWithTimeout(initUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.status !== "SUCCESS" || !data.GatewayPageURL) {
    throw new Error(data.failedreason || "Failed to initiate SSLCommerz payment session");
  }

  return {
    success: true,
    paymentID: data.sessionkey || tranId,
    redirectUrl: data.GatewayPageURL,
    merchantInvoiceNumber: tranId,
    raw: data,
  };
}

export async function executeOrVerify(payload = {}) {
  const integration = await getIntegration("sslcommerz");
  if (!integration) throw new Error("SSLCommerz integration not found");

  const { status, val_id, tran_id, amount, bank_tran_id, card_type } = payload;

  if (status !== "VALID" && status !== "VALIDATED") {
    return {
      success: false,
      status: status === "CANCELLED" ? "cancelled" : "failed",
      paymentID: tran_id,
      reason: payload.error || "Payment was not validated by SSLCommerz",
      raw: payload,
    };
  }

  const { config, secrets, mode } = integration;
  const isLive = mode === "live";
  const { validateUrl } = getEndpoints(isLive);

  // Validate session with SSLCommerz verification server
  const verifyParams = new URLSearchParams({
    val_id,
    store_id: config.storeId,
    store_passwd: secrets.storePassword,
    format: "json",
  });

  const res = await fetchWithTimeout(`${validateUrl}?${verifyParams.toString()}`);
  const data = await res.json().catch(() => ({}));

  if (data.status === "VALID" || data.status === "VALIDATED") {
    return {
      success: true,
      status: "paid",
      paymentID: data.tran_id,
      trxID: data.bank_tran_id || val_id,
      amount: Number(data.amount || amount),
      currency: data.currency || "BDT",
      payerNumber: data.card_no || "",
      cardType: data.card_type || card_type,
      merchantInvoiceNumber: data.tran_id,
      raw: data,
    };
  }

  return {
    success: false,
    status: "failed",
    paymentID: tran_id,
    reason: data.error || "SSLCommerz validation server rejected transaction",
    raw: data,
  };
}

export async function test(customConfig, customSecrets) {
  const config = customConfig || (await getIntegration("sslcommerz"))?.config || {};
  const secrets = customSecrets || (await getIntegration("sslcommerz"))?.secrets || {};

  if (!config.storeId || !secrets.storePassword) {
    return { ok: false, error: "Missing storeId or storePassword" };
  }

  // Ping SSLCommerz init with zero test
  const { initUrl } = getEndpoints(false);
  try {
    const res = await fetchWithTimeout(initUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        store_id: config.storeId,
        store_passwd: secrets.storePassword,
        total_amount: "10.00",
        currency: "BDT",
        tran_id: `TEST-${Date.now()}`,
        success_url: "https://example.com",
        fail_url: "https://example.com",
        cancel_url: "https://example.com",
        cus_name: "Test",
        cus_email: "test@example.com",
        cus_phone: "01700000000",
        cus_add1: "Dhaka",
        cus_city: "Dhaka",
        cus_country: "Bangladesh",
        shipping_method: "NO",
        product_name: "Test",
        product_category: "Test",
        product_profile: "general",
      }).toString(),
    });

    const data = await res.json().catch(() => ({}));
    if (data.status === "SUCCESS") {
      return { ok: true, message: "SSLCommerz credentials verified successfully" };
    }
    return { ok: false, error: data.failedreason || "Invalid store credentials" };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

const sslcommerzAdapter = {
  meta,
  createPayment,
  executeOrVerify,
  test,
};

export default sslcommerzAdapter;
