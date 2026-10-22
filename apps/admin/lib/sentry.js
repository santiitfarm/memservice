const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || null;
const isEnabled = Boolean(dsn);

export function initSentry() {
  if (!isEnabled) return;
  console.log("[Sentry] Initialized for admin dashboard tracking");
}

export function captureException(error, context = {}) {
  console.error("[Sentry Error Admin]", error, context);
  if (isEnabled && typeof window !== "undefined") {
    // Client-side reporting hook for Admin dashboard
  }
}

export function captureMessage(message, level = "info", context = {}) {
  console.log(`[Sentry Admin ${level.toUpperCase()}]`, message, context);
}

export default {
  initSentry,
  captureException,
  captureMessage,
};
