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
  key: "paperfly",
  name: "Paperfly Logistics",
  category: "courier",
  type: "courier",
  logo: "/assets/logo/paperfly.png",
  trackingUrlTemplate: "https://paperfly.com.bd/tracking.php?track_code={code}",
};

function getHeaders(integration) {
  const username = integration?.config?.username;
  const password = integration?.secrets?.password;
  const paperflyKey = integration?.secrets?.paperflyKey;

  if (!username || !password || !paperflyKey) {
    throw new Error("Paperfly credentials missing: username, password, and paperflyKey are required");
  }

  return {
    username,
    password,
    paperflykey: paperflyKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function createShipment(order, options = {}) {
  const integration = await getIntegration("paperfly");
  if (!integration || !integration.enabled) {
    throw new Error("Paperfly Courier integration is disabled or unconfigured");
  }

  const baseUrl = integration.config.baseUrl || "https://api.paperfly.com.bd";
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
  const recipientDistrict =
    order.shipping_details?.district || "Dhaka";

  const isPaid = order.payment_info?.status === "paid";
  const packagePrice = isPaid ? 0 : Math.round(Number(order.total_amount || 0));

  const payload = {
    merOrderRef: orderNumber,
    packagePrice: String(packagePrice),
    custName: recipientName,
    custPhone: recipientPhone,
    custAddress: recipientAddress,
    destDistrict: recipientDistrict,
    max_weight: String(options.weight || "0.5"),
    briefDescription:
      options.note ||
      order.items?.map((i) => i.title || i.name).filter(Boolean).slice(0, 2).join(", ") ||
      "Healthcare products",
  };

  const res = await fetchWithTimeout(`${baseUrl}/OrderPlacement`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  const successObj = data.success || data.response || data;
  const trackingNumber = successObj.tracking_number || successObj.tracking_code;

  if (!res.ok || !trackingNumber) {
    const errorMsg =
      data.error ||
      data.message ||
      `Paperfly shipment placement failed with HTTP ${res.status}`;
    throw new Error(errorMsg);
  }

  const trackingCode = String(trackingNumber);
  const consignmentId = trackingCode;
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
  const integration = await getIntegration("paperfly");
  if (!integration || !integration.enabled) {
    throw new Error("Paperfly Courier integration is disabled or unconfigured");
  }

  const baseUrl = integration.config.baseUrl || "https://api.paperfly.com.bd";
  const headers = getHeaders(integration);

  const res = await fetchWithTimeout(`${baseUrl}/Tracking`, {
    method: "POST",
    headers,
    body: JSON.stringify({ TrackingNumber: consignmentId }),
  });

  const data = await res.json().catch(() => ({}));
  const rawStatus = data.status || data.delivery_status || "pending";

  return {
    success: res.ok,
    status: normalizeCourierStatus(rawStatus),
    rawStatus,
    raw: data,
  };
}

export async function cancel(consignmentId) {
  return {
    success: false,
    message: "Paperfly cancellation must be done via Paperfly merchant portal",
  };
}

export async function handleWebhook(payload = {}) {
  const trackingNumber = payload.TrackingNumber || payload.tracking_number;
  const rawStatus = payload.Status || payload.status;

  return {
    success: Boolean(trackingNumber && rawStatus),
    consignmentId: String(trackingNumber || ""),
    status: normalizeCourierStatus(rawStatus),
    raw: payload,
  };
}

export async function test() {
  const integration = await getIntegration("paperfly");
  if (!integration || !integration.enabled) {
    return { ok: false, error: "Paperfly Courier integration is disabled" };
  }

  const config = integration.config || {};
  const secrets = integration.secrets || {};
  if (!config.username || !secrets.password || !secrets.paperflyKey) {
    return { ok: false, error: "Missing Paperfly username, password, or key" };
  }

  return {
    ok: true,
    message: `Paperfly credentials configured for merchant: ${config.username}`,
  };
}

const paperflyAdapter = {
  meta,
  createShipment,
  getStatus,
  cancel,
  handleWebhook,
  test,
};

export default paperflyAdapter;
