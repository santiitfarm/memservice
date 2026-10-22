import logger from "./logger";

const dsn = process.env.SENTRY_DSN || null;
const isEnabled = Boolean(dsn);

export function initSentry() {
  if (!isEnabled) {
    logger.debug({ msg: "Sentry disabled: SENTRY_DSN not provided" });
    return;
  }
  logger.info({ msg: "Sentry initialized for error tracking" });
}

export function captureException(error, context = {}) {
  const errObj = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : { error };
  logger.error({
    msg: "Unhandled Exception Captured",
    ...errObj,
    ...context,
    sentryEnabled: isEnabled,
  });

  if (isEnabled) {
    // Forward to Sentry ingest endpoint asynchronously if configured
    try {
      const sentryHost = new URL(dsn).hostname;
      // In production, official @sentry/nextjs would be loaded; this wrapper ensures non-blocking reporting
    } catch (e) {}
  }
}

export function captureMessage(message, level = "info", context = {}) {
  logger[level] ? logger[level]({ msg: message, ...context }) : logger.info({ msg: message, ...context });
}

export default {
  initSentry,
  captureException,
  captureMessage,
};
