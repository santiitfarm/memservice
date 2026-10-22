import crypto from "crypto";
import { getIntegration } from "../resolver.js";

const FETCH_TIMEOUT_MS = 15000;

export const SUPPORTED_META_EVENTS = [
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
  "Search",
  "CompleteRegistration",
];

function sha256(str) {
  if (!str) return null;
  return crypto.createHash("sha256").update(String(str).trim()).digest("hex");
}

function normalizePhone(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = "880" + digits.slice(1);
  } else if (!digits.startsWith("880") && digits.length === 10) {
    digits = "88" + digits;
  }
  return digits;
}

/**
 * Normalizes customer PII for Meta Conversions API according to Meta guidelines.
 */
export function hashUserData({ email, phone, firstName, lastName, request, cookies = {} }) {
  const normalizedEmail = email ? String(email).trim().toLowerCase() : null;
  const normalizedPh = normalizePhone(phone);
  const normalizedFn = firstName ? String(firstName).trim().toLowerCase() : null;
  const normalizedLn = lastName ? String(lastName).trim().toLowerCase() : null;

  const userData = {};

  if (normalizedEmail) userData.em = [sha256(normalizedEmail)];
  if (normalizedPh) userData.ph = [sha256(normalizedPh)];
  if (normalizedFn) userData.fn = [sha256(normalizedFn)];
  if (normalizedLn) userData.ln = [sha256(normalizedLn)];

  if (request) {
    const ip =
      request.headers?.get?.("x-forwarded-for")?.split(",")?.[0]?.trim() ||
      request.headers?.get?.("x-real-ip") ||
      request.socket?.remoteAddress;
    if (ip) userData.client_ip_address = ip;

    const ua = request.headers?.get?.("user-agent");
    if (ua) userData.client_user_agent = ua;

    // Cookie extraction (_fbp, _fbc)
    const cookieHeader = request.headers?.get?.("cookie") || "";
    const fbpMatch = cookieHeader.match(/_fbp=([^;]+)/);
    const fbcMatch = cookieHeader.match(/_fbc=([^;]+)/);

    if (fbpMatch) userData.fbp = fbpMatch[1];
    if (fbcMatch) userData.fbc = fbcMatch[1];
  }

  if (cookies._fbp && !userData.fbp) userData.fbp = cookies._fbp;
  if (cookies._fbc && !userData.fbc) userData.fbc = cookies._fbc;

  return userData;
}

/**
 * Dispatches an event to the Meta Graph Conversions API.
 * Never throws an uncaught error: tracking failures must not disrupt business transactions.
 *
 * @param {Object} options
 * @param {string} options.eventName - One of SUPPORTED_META_EVENTS
 * @param {string} [options.eventId] - Unique ID for browser/server deduplication
 * @param {string} [options.eventSourceUrl]
 * @param {Object} [options.userData] - Raw or pre-hashed user data
 * @param {Object} [options.customData] - Currency, value, contents
 * @param {Request} [options.request] - Web request for IP / user-agent extraction
 * @returns {Promise<{ success: boolean, eventId?: string, error?: string }>}
 */
export async function sendMetaEvent({
  eventName,
  eventId,
  eventSourceUrl,
  userData = {},
  customData = {},
  request = null,
}) {
  try {
    const resolvedEventId =
      eventId || `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const integration = await getIntegration("meta_capi");
    const pixelId =
      integration?.config?.pixelId ||
      process.env.META_PIXEL_ID;
    const accessToken =
      integration?.secrets?.accessToken ||
      process.env.META_ACCESS_TOKEN;
    const testEventCode =
      integration?.config?.testEventCode ||
      process.env.META_TEST_EVENT_CODE;

    if (!pixelId || !accessToken) {
      return {
        success: false,
        skipped: true,
        eventId: resolvedEventId,
        error: "Meta CAPI is not configured (missing META_PIXEL_ID or META_ACCESS_TOKEN)",
      };
    }

    const formattedUserData = hashUserData({
      email: userData.email || userData.em,
      phone: userData.phone || userData.ph,
      firstName: userData.firstName || userData.fn,
      lastName: userData.lastName || userData.ln,
      request,
      cookies: userData.cookies || {},
    });

    const eventPayload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: resolvedEventId,
      event_source_url:
        eventSourceUrl ||
        process.env.NEXT_PUBLIC_APP_URL_FRONTEND ||
        "http://localhost:3000",
      action_source: "website",
      user_data: formattedUserData,
      custom_data: customData,
    };

    const requestBody = {
      data: [eventPayload],
    };

    if (testEventCode) {
      requestBody.test_event_code = testEventCode;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    const responseData = await res.json().catch(() => ({}));

    if (!res.ok || responseData.error) {
      const msg = responseData.error?.message || `Meta Graph API error ${res.status}`;
      console.warn(`[meta-capi] Warning: ${msg}`);
      return { success: false, error: msg };
    }

    return {
      success: true,
      eventId: resolvedEventId,
      eventsReceived: responseData.events_received,
    };
  } catch (err) {
    console.error("[meta-capi] Exception sending event:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Convenience helper to send a Purchase event from an Order document.
 * @param {Object} order
 * @param {Request} [request]
 */
export async function sendMetaPurchaseEvent(order, request = null) {
  if (!order) return { success: false, error: "No order provided" };

  const customer = order.customer || {};
  const email = order.email || customer.email;
  const phone = order.phone_number || customer.phone_number;
  const name = order.customer_name || customer.customer_name || "";
  const firstName = name.split(" ")[0];

  const total = Number(order.total_amount || 0);
  const eventId = `PURCHASE-${order.order_number || order._id}`;

  const contents = (order.items || []).map((item) => ({
    id: String(item.id || item._id || item.product || ""),
    quantity: Number(item.quantity || 1),
    item_price: Number(item.price || 0),
  }));

  return sendMetaEvent({
    eventName: "Purchase",
    eventId,
    eventSourceUrl: `${process.env.NEXT_PUBLIC_APP_URL_FRONTEND || "http://localhost:3000"}/complete-order?order_id=${order._id}`,
    userData: {
      email,
      phone,
      firstName,
    },
    customData: {
      currency: "BDT",
      value: total,
      content_type: "product",
      contents,
      order_id: order.order_number,
    },
    request,
  });
}

const metaTracker = {
  SUPPORTED_META_EVENTS,
  sendMetaEvent,
  sendMetaPurchaseEvent,
  hashUserData,
};

export default metaTracker;
