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
  key: "steadfast",
  name: "Steadfast Courier",
  category: "courier",
  type: "courier",
  logo: "/assets/logo/steadfast.png",
  trackingUrlTemplate: "https://steadfast.com.bd/t/{code}",
};

function getHeaders(integration) {
  const apiKey = integration?.secrets?.apiKey;
  const secretKey = integration?.secrets?.secretKey;

  if (!apiKey || !secretKey) {
    throw new Error("Steadfast credentials missing: apiKey and secretKey are required");
  }

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Api-Key": apiKey,
    "Secret-Key": secretKey,
  };
}

export async function createShipment(order, options = {}) {
  const integration = await getIntegration("steadfast");
  if (!integration || !integration.enabled) {
    throw new Error("Steadfast Courier integration is disabled or unconfigured");
  }

  const baseUrl = integration.config.baseUrl || "https://portal.steadfast.com.bd/api/v1";
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

  // If order is already paid, COD amount to collect is 0
  const isPaid = order.payment_info?.status === "paid";
  const codAmount = isPaid ? 0 : Math.round(Number(order.total_amount || 0));

  const payload = {
    invoice: orderNumber,
    recipient_name: recipientName,
    recipient_phone: recipientPhone,
    recipient_address: recipientAddress,
    cod_amount: codAmount,
    note: options.note || order.shipping_details?.instructions || "Handle with care",
  };

  const res = await fetchWithTimeout(`${baseUrl}/create_order`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || (data.status !== 200 && data.status !== 201)) {
    const errorMsg =
      data.message ||
      (data.errors && Object.values(data.errors).flat().join(", ")) ||
      `Steadfast booking failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  const consignment = data.consignment || {};
  const consignmentId = String(consignment.consignment_id || consignment.id || "");
  const trackingCode = String(consignment.tracking_code || consignmentId);
  const trackingUrl = meta.trackingUrlTemplate.replace("{code}", trackingCode);

  return {
    success: true,
    consignmentId,
    trackingCode,
    trackingUrl,
    status: normalizeCourierStatus(consignment.status || "pending"),
    fee: Number(consignment.delivery_fee || 0),
    raw: data,
  };
}

export async function getStatus(consignmentId) {
  const integration = await getIntegration("steadfast");
  if (!integration || !integration.enabled) {
    throw new Error("Steadfast Courier integration is disabled or unconfigured");
  }

  const baseUrl = integration.config.baseUrl || "https://portal.steadfast.com.bd/api/v1";
  const headers = getHeaders(integration);

  const res = await fetchWithTimeout(
    `${baseUrl}/status_by_cid/${encodeURIComponent(consignmentId)}`,
    { method: "GET", headers }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.status !== 200) {
    throw new Error(data.message || `Failed to fetch Steadfast status for ${consignmentId}`);
  }

  const rawStatus = data.delivery_status || "pending";
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
    message: "Steadfast does not support automated API cancellation. Please contact Steadfast support.",
  };
}

export async function handleWebhook(payload = {}) {
  const consignmentId =
    payload.consignment_id || payload.cid || payload.tracking_code;
  const rawStatus = payload.status || payload.delivery_status;

  return {
    success: Boolean(consignmentId && rawStatus),
    consignmentId: String(consignmentId || ""),
    status: normalizeCourierStatus(rawStatus),
    raw: payload,
  };
}

export async function test() {
  const integration = await getIntegration("steadfast");
  if (!integration || !integration.enabled) {
    return { ok: false, error: "Steadfast Courier integration is disabled" };
  }

  const baseUrl = integration.config.baseUrl || "https://portal.steadfast.com.bd/api/v1";
  try {
    const headers = getHeaders(integration);
    const res = await fetchWithTimeout(`${baseUrl}/get_balance`, {
      method: "GET",
      headers,
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.status === 200) {
      return {
        ok: true,
        message: `Steadfast API connected successfully. Current balance: ৳${data.current_balance ?? "N/A"}`,
      };
    }
    return {
      ok: false,
      error: data.message || `Steadfast connection failed with HTTP ${res.status}`,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

const steadfastAdapter = {
  meta,
  createShipment,
  getStatus,
  cancel,
  handleWebhook,
  test,
};

export default steadfastAdapter;
