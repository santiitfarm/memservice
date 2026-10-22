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
  key: "ecourier",
  name: "eCourier",
  category: "courier",
  type: "courier",
  logo: "/assets/logo/ecourier.png",
  trackingUrlTemplate: "https://ecourier.com.bd/track?ecr={code}",
};

function getHeaders(integration) {
  const apiKey = integration?.secrets?.apiKey;
  const apiSecret = integration?.secrets?.apiSecret;
  const userId = integration?.config?.userId;

  if (!apiKey || !apiSecret || !userId) {
    throw new Error("eCourier credentials missing: apiKey, apiSecret, and userId are required");
  }

  return {
    "API-KEY": apiKey,
    "API-SECRET": apiSecret,
    "USER-ID": userId,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function createShipment(order, options = {}) {
  const integration = await getIntegration("ecourier");
  if (!integration || !integration.enabled) {
    throw new Error("eCourier integration is disabled or unconfigured");
  }

  const baseUrl = integration.config.baseUrl || "https://backoffice.ecourier.com.bd/api";
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
  const recipientCity =
    order.shipping_details?.district || "Dhaka";
  const recipientArea =
    order.shipping_details?.area || "Dhaka";

  const isPaid = order.payment_info?.status === "paid";
  const productPrice = isPaid ? 0 : Math.round(Number(order.total_amount || 0));

  const payload = {
    recipient_name: recipientName,
    recipient_mobile: recipientPhone,
    recipient_city: recipientCity,
    recipient_area: recipientArea,
    recipient_address: recipientAddress,
    package_code: orderNumber,
    product_price: productPrice,
    payment_method: isPaid ? "PREPAID" : "COD",
    parcel_detail:
      options.note ||
      order.items?.map((i) => i.title || i.name).filter(Boolean).slice(0, 2).join(", ") ||
      "Order items",
  };

  const res = await fetchWithTimeout(`${baseUrl}/order-place`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  const trackingCode = String(data.ECR || data.ecr || data.ID || "");

  if (!res.ok || (!data.success && !trackingCode)) {
    const errorMsg =
      data.message ||
      data.error ||
      `eCourier booking failed with HTTP ${res.status}`;
    throw new Error(errorMsg);
  }

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
  const integration = await getIntegration("ecourier");
  if (!integration || !integration.enabled) {
    throw new Error("eCourier integration is disabled or unconfigured");
  }

  const baseUrl = integration.config.baseUrl || "https://backoffice.ecourier.com.bd/api";
  const headers = getHeaders(integration);

  const res = await fetchWithTimeout(`${baseUrl}/track`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ecr: consignmentId }),
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
    message: "eCourier cancellation must be requested through eCourier support",
  };
}

export async function handleWebhook(payload = {}) {
  const ecr = payload.ecr || payload.ECR || payload.package_code;
  const rawStatus = payload.status || payload.delivery_status;

  return {
    success: Boolean(ecr && rawStatus),
    consignmentId: String(ecr || ""),
    status: normalizeCourierStatus(rawStatus),
    raw: payload,
  };
}

export async function test() {
  const integration = await getIntegration("ecourier");
  if (!integration || !integration.enabled) {
    return { ok: false, error: "eCourier integration is disabled" };
  }

  const config = integration.config || {};
  const secrets = integration.secrets || {};
  if (!config.userId || !secrets.apiKey || !secrets.apiSecret) {
    return { ok: false, error: "Missing eCourier userId, apiKey, or apiSecret" };
  }

  return {
    ok: true,
    message: `eCourier credentials configured for user: ${config.userId}`,
  };
}

const ecourierAdapter = {
  meta,
  createShipment,
  getStatus,
  cancel,
  handleWebhook,
  test,
};

export default ecourierAdapter;
