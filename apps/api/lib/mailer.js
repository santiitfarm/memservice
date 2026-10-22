import { Resend } from "resend";
import { getIntegration } from "./integrations/resolver";
import { renderOrderConfirmationEmail } from "./emailTemplates/orderConfirmation";
import { renderOrderShippedEmail } from "./emailTemplates/orderShipped";
import { renderPaymentReceivedEmail } from "./emailTemplates/paymentStatus";
import {
  renderStaffPasswordResetEmail,
  renderCustomerPasswordResetEmail,
} from "./emailTemplates/passwordReset";

let cachedResend = null;
let lastKey = null;

async function getResendClient() {
  const integration = await getIntegration("resend");
  const apiKey =
    integration?.secrets?.apiKey ||
    process.env.RESEND_API_KEY ||
    process.env.RESEND_KEY;

  if (!apiKey) return null;

  if (cachedResend && lastKey === apiKey) {
    return { client: cachedResend, integration };
  }

  cachedResend = new Resend(apiKey);
  lastKey = apiKey;
  return { client: cachedResend, integration };
}

/**
 * Sends a transactional email through Resend.
 * Never throws: email problems must not fail the business operation that triggered them.
 */
export async function sendMail({ to, subject, html, text, replyTo }) {
  const clientInfo = await getResendClient();
  if (!clientInfo?.client) {
    console.warn(`[mailer] Resend API key not set - email "${subject}" to ${to} was not sent`);
    return { ok: false, skipped: true, error: "Email provider is not configured" };
  }

  const { client, integration } = clientInfo;
  const from =
    integration?.config?.from ||
    process.env.EMAIL_FROM ||
    "Mem Service <onboarding@resend.dev>";
  const defReplyTo =
    replyTo ||
    integration?.config?.replyTo ||
    process.env.EMAIL_REPLY_TO ||
    undefined;

  try {
    const { data, error } = await client.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo: defReplyTo,
    });

    if (error) {
      console.error("[mailer] Resend rejected the email:", error.message || error);
      return { ok: false, error: error.message || String(error) };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[mailer] Failed to send email:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Sends branded order confirmation email to the customer.
 */
export async function sendOrderConfirmationEmail(order) {
  const recipient = order.email || order.customer?.email;
  if (!recipient) return { ok: false, skipped: true, error: "No email address" };

  try {
    const { html, text, subject } = await renderOrderConfirmationEmail(order);
    return await sendMail({ to: recipient, subject, html, text });
  } catch (err) {
    console.error("sendOrderConfirmationEmail error:", err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Sends shipment tracking email to the customer.
 */
export async function sendOrderShippedEmail(order, shipment) {
  const recipient = order.email || order.customer?.email;
  if (!recipient) return { ok: false, skipped: true, error: "No email address" };

  try {
    const { html, text, subject } = await renderOrderShippedEmail(order, shipment);
    return await sendMail({ to: recipient, subject, html, text });
  } catch (err) {
    console.error("sendOrderShippedEmail error:", err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Sends payment received notification email.
 */
export async function sendPaymentReceivedEmail(order, transaction) {
  const recipient = order.email || order.customer?.email;
  if (!recipient) return { ok: false, skipped: true, error: "No email address" };

  try {
    const { html, text, subject } = await renderPaymentReceivedEmail(order, transaction);
    return await sendMail({ to: recipient, subject, html, text });
  } catch (err) {
    console.error("sendPaymentReceivedEmail error:", err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Sends staff password reset email.
 */
export async function sendStaffPasswordResetEmail(user, resetLink) {
  if (!user.email) return { ok: false, skipped: true };

  try {
    const { html, text, subject } = await renderStaffPasswordResetEmail(user, resetLink);
    return await sendMail({ to: user.email, subject, html, text });
  } catch (err) {
    console.error("sendStaffPasswordResetEmail error:", err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Sends customer password reset email.
 */
export async function sendCustomerPasswordResetEmail(customer, resetLink) {
  if (!customer.email) return { ok: false, skipped: true };

  try {
    const { html, text, subject } = await renderCustomerPasswordResetEmail(customer, resetLink);
    return await sendMail({ to: customer.email, subject, html, text });
  } catch (err) {
    console.error("sendCustomerPasswordResetEmail error:", err.message);
    return { ok: false, error: err.message };
  }
}

export const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c]
  );

const mailer = {
  sendMail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendPaymentReceivedEmail,
  sendStaffPasswordResetEmail,
  sendCustomerPasswordResetEmail,
  escapeHtml,
};

export default mailer;
