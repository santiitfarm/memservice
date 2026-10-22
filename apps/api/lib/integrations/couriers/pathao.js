import { getIntegration } from "../resolver.js";
import { normalizeCourierStatus } from "./status.js";

const FETCH_TIMEOUT_MS = 15000;
const tokenCache = new Map();

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
  key: "pathao",
  name: "Pathao Courier",
  category: "courier",
  type: "courier",
  logo: "/assets/logo/pathao.png",
  trackingUrlTemplate: "https://pathao.com/courier-tracking/?consignment_id={code}",
};

async function getPathaoToken(integration) {
  const { config, secrets } = integration;
  const baseUrl = config.baseUrl || "https://courier-api-sandbox.pathao.net";
  const clientId = config.clientId;
  const clientSecret = secrets.clientSecret;
  const username = config.username;
  const password = secrets.password;

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error("Pathao credentials missing: clientId, clientSecret, username, and password are required");
  }

  const cacheKey = `${baseUrl}_${clientId}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.token;
  }

  const res = await fetchWithTimeout(`${baseUrl}/aladdin/api/v1/issue-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      username,
      password,
      grant_type: "password",
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data.message || data.error_description || "Pathao OAuth authentication failed");
  }

  tokenCache.set(cacheKey, {
    token: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
  });

  return data.access_token;
}

export async function createShipment(order, options = {}) {
  const integration = await getIntegration("pathao");
  if (!integration || !integration.enabled) {
    throw new Error("Pathao Courier integration is disabled or unconfigured");
  }

  const baseUrl = integration.config.baseUrl || "https://courier-api-sandbox.pathao.net";
  const token = await getPathaoToken(integration);

  const orderNumber = order.order_number || String(order._id);
  const recipientName =
    order.shipping_details?.recipientName ||
    order.customer_name ||
    order.customer?.customer_name ||
    "Customer";
  const recipientPhone =
    order.shipping_details?.recipientPhone ||
    order.phone_number ||
    order.customer?.phone_number;
  const recipientAddress =
    order.shipping_details?.address || "Address not provided";

  const isPaid = order.payment_info?.status === "paid";
  const amountToCollect = isPaid ? 0 : Math.round(Number(order.total_amount || 0));

  const totalQuantity = (order.items || []).reduce(
    (sum, i) => sum + (Number(i.quantity) || 1),
    0
  );

  const storeId = Number(options.storeId || integration.config.storeId || 1);

  const payload = {
    store_id: storeId,
    merchant_order_id: orderNumber,
    recipient_name: recipientName,
    recipient_phone: recipientPhone,
    recipient_address: recipientAddress,
    recipient_city: Number(options.cityId || 1),
    recipient_zone: Number(options.zoneId || 1),
    recipient_area: Number(options.areaId || 1),
    delivery_type: Number(options.deliveryType || 48),
    item_type: 2, // Parcel
    special_instruction: options.note || order.shipping_details?.instructions || "",
    item_quantity: totalQuantity > 0 ? totalQuantity : 1,
    item_weight: Number(options.weight || 0.5),
    amount_to_collect: amountToCollect,
    item_description:
      options.itemDescription ||
      order.items?.map((i) => i.title || i.name).filter(Boolean).slice(0, 3).join(", ") ||
      "Order items",
  };

  const res = await fetchWithTimeout(`${baseUrl}/aladdin/api/v1/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.type !== "success" || !data.data) {
    const errorMsg =
      data.message ||
      (data.errors && Object.values(data.errors).flat().join(", ")) ||
      `Pathao booking failed with HTTP ${res.status}`;
    throw new Error(errorMsg);
  }

  const shipmentData = data.data;
  const consignmentId = String(shipmentData.consignment_id || "");
  const trackingCode = consignmentId;
  const trackingUrl = meta.trackingUrlTemplate.replace("{code}", trackingCode);

  return {
    success: true,
    consignmentId,
    trackingCode,
    trackingUrl,
    status: normalizeCourierStatus(shipmentData.order_status || "pending"),
    fee: Number(shipmentData.delivery_fee || 0),
    raw: data,
  };
}

export async function getStatus(consignmentId) {
  const integration = await getIntegration("pathao");
  if (!integration || !integration.enabled) {
    throw new Error("Pathao Courier integration is disabled or unconfigured");
  }

  const baseUrl = integration.config.baseUrl || "https://courier-api-sandbox.pathao.net";
  const token = await getPathaoToken(integration);

  const res = await fetchWithTimeout(
    `${baseUrl}/aladdin/api/v1/orders/${encodeURIComponent(consignmentId)}/info`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.data) {
    throw new Error(data.message || `Failed to fetch Pathao status for ${consignmentId}`);
  }

  const rawStatus = data.data.order_status || "pending";
  return {
    success: true,
    status: normalizeCourierStatus(rawStatus),
    rawStatus,
    raw: data,
  };
}

export async function cancel(consignmentId) {
  const integration = await getIntegration("pathao");
  if (!integration || !integration.enabled) {
    throw new Error("Pathao Courier integration is disabled or unconfigured");
  }

  const baseUrl = integration.config.baseUrl || "https://courier-api-sandbox.pathao.net";
  const token = await getPathaoToken(integration);

  const res = await fetchWithTimeout(
    `${baseUrl}/aladdin/api/v1/orders/${encodeURIComponent(consignmentId)}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  const data = await res.json().catch(() => ({}));
  return {
    success: res.ok,
    message: data.message || (res.ok ? "Order cancelled successfully" : "Failed to cancel Pathao order"),
    raw: data,
  };
}

export async function handleWebhook(payload = {}) {
  const consignmentId = payload.consignment_id || payload.merchant_order_id;
  const rawStatus = payload.order_status || payload.status;

  return {
    success: Boolean(consignmentId && rawStatus),
    consignmentId: String(consignmentId || ""),
    status: normalizeCourierStatus(rawStatus),
    raw: payload,
  };
}

export async function test() {
  const integration = await getIntegration("pathao");
  if (!integration || !integration.enabled) {
    return { ok: false, error: "Pathao Courier integration is disabled" };
  }

  try {
    const token = await getPathaoToken(integration);
    return {
      ok: Boolean(token),
      message: "Pathao Courier credentials verified successfully via OAuth token",
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

const pathaoAdapter = {
  meta,
  createShipment,
  getStatus,
  cancel,
  handleWebhook,
  test,
};

export default pathaoAdapter;
