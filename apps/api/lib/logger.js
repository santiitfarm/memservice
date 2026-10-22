import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  redact: {
    paths: [
      "password",
      "newPassword",
      "oldPassword",
      "token",
      "accessToken",
      "refreshToken",
      "authorization",
      "cookie",
      "secret",
      "clientSecret",
      "apiKey",
      "appSecret",
      "webhookSecret",
      "*.password",
      "*.newPassword",
      "*.oldPassword",
      "*.token",
      "*.secret",
      "*.accessToken",
      "body.password",
      "body.newPassword",
      "body.oldPassword",
      "headers.authorization",
      "headers.cookie",
    ],
    censor: "[REDACTED]",
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
