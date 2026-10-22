import { getIntegration } from "../resolver.js";
import { normalizeCourierStatus } from "./status.js";

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
  key: "redx",
  name: "RedX Delivery",
  category: "courier",
  type: "courier",
  logo: "/assets/logo/redx.png",
  trackingUrlTemplate: "https://redx.com.bd/track-parcel/?trackingId={code}",
};

function getHeaders(integration) {
  const accessToken = integration?.secrets?.accessToken;
  if (!accessToken) {
    throw new Error("RedX credentials missing: accessToken is required");
  }
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function createShipment(order, options = {}) {
  const integration = await getIntegration("redx");
  if (!integration || !integration.enabled) {
    throw new Error("RedX Courier integration is disabled or unconfigured");
  }

  const baseUrl = integration.config.baseUrl || "https://openapi.redx.com.bd/v1.0.0-beta";
  const headers = getHeaders(integration);

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
  const deliveryArea =
    order.shipping_details?.area ||
    order.shipping_details?.district ||
    "Dhaka";

  const isPaid = order.payment_info?.status === "paid";
  const cashCollection = isPaid ? 0 : Math.round(Number(order.total_amount || 0));

  const payload = {
    customer_name: recipientName,
    customer_phone: recipientPhone,
    delivery_area: deliveryArea,
    delivery_area_id: options.areaId || null,
    customer_address: recipientAddress,
    merchant_invoice_id: orderNumber,
    cash_collection_amount: cashCollection,
    parcel_weight: Number(options.weight || 500),
    instruction: options.note || order.shipping_details?.instructions || "",
    value: Math.round(Number(order.total_amount || 0)),
  };

  const res = await fetchWithTimeout(`${baseUrl}/parcels`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || (!data.tracking_id && !data.parcel_id)) {
    const errorMsg =
      data.message ||
      data.error ||
      `RedX parcel creation failed with HTTP ${res.status}`;
    throw new Error(errorMsg);
  }

  const trackingCode = String(data.tracking_id || data.parcel_id || "");
  const consignmentId = String(data.parcel_id || trackingCode);
  const trackingUrl = meta.trackingUrlTemplate.replace("{code}", trackingCode);

  return {
    success: true,
    consignmentId,
    trackingCode,
    trackingUrl,
    status: "pending",
    fee: Number(data.delivery_fee || 0),
    raw: data,
  };
}

export async function getStatus(consignmentId) {
  const integration = await getIntegration("redx");
  if (!integration || !integration.enabled) {
    throw new Error("RedX Courier integration is disabled or unconfigured");
  }

  const baseUrl = integration.config.baseUrl || "https://openapi.redx.com.bd/v1.0.0-beta";
  const headers = getHeaders(integration);

  const res = await fetchWithTimeout(
    `${baseUrl}/parcels/info/${encodeURIComponent(consignmentId)}`,
    { method: "GET", headers }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch RedX tracking for ${consignmentId}`);
  }

  const rawStatus = data.status || data.delivery_status || "pending";
  return {
    success: true,
    status: normalizeCourierStatus(rawStatus),
    rawStatus,
    raw: data,
  };
}

export async function cancel(consignmentId) {
  return {
    success: false,
    message: "RedX cancellation must be performed via RedX merchant portal",
  };
}

export async function handleWebhook(payload = {}) {
  const trackingId = payload.tracking_id || payload.merchant_invoice_id;
  const rawStatus = payload.status || payload.parcel_status;

  return {
    success: Boolean(trackingId && rawStatus),
    consignmentId: String(trackingId || ""),
    status: normalizeCourierStatus(rawStatus),
    raw: payload,
  };
}

export async function test() {
  const integration = await getIntegration("redx");
  if (!integration || !integration.enabled) {
    return { ok: false, error: "RedX Courier integration is disabled" };
  }

  const baseUrl = integration.config.baseUrl || "https://openapi.redx.com.bd/v1.0.0-beta";
  try {
    const headers = getHeaders(integration);
    const res = await fetchWithTimeout(`${baseUrl}/locations/divisions`, {
      method: "GET",
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return {
        ok: true,
        message: "RedX access token verified successfully with division lookup",
      };
    }
    return {
      ok: false,
      error: data.message || `RedX authorization failed with HTTP ${res.status}`,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

const redxAdapter = {
  meta,
  createShipment,
  getStatus,
  cancel,
  handleWebhook,
  test,
};

export default redxAdapter;
