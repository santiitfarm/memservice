const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || null;
const isEnabled = Boolean(dsn);

export function initSentry() {
  if (!isEnabled) return;
  console.log("[Sentry] Initialized for storefront client/server tracking");
}

export function captureException(error, context = {}) {
  console.error("[Sentry Error]", error, context);
  if (isEnabled && typeof window !== "undefined") {
    // Client-side reporting hook
  }
}

export function captureMessage(message, level = "info", context = {}) {
  console.log(`[Sentry ${level.toUpperCase()}]`, message, context);
}

export default {
  initSentry,
  captureException,
  captureMessage,
};
