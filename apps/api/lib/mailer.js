import { Resend } from "resend";

let client;
const getClient = () => {
  const key = process.env.RESEND_API_KEY || process.env.RESEND_KEY;
  if (!key) return null;
  client ??= new Resend(key);
  return client;
};

/**
 * Sends a transactional email through Resend.
 * Never throws: email problems must not fail the business operation that triggered them.
 * Configure in .env: RESEND_API_KEY, EMAIL_FROM (verified sender), EMAIL_REPLY_TO (optional).
 *
 * @returns {Promise<{ ok: boolean, skipped?: boolean, id?: string, error?: string }>}
 */
export async function sendMail({ to, subject, html, text, replyTo }) {
  const resend = getClient();
  if (!resend) {
    console.warn(`[mailer] RESEND_API_KEY not set - email "${subject}" to ${to} was not sent`);
    return { ok: false, skipped: true, error: "Email provider is not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Mem Service <onboarding@resend.dev>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo: replyTo || process.env.EMAIL_REPLY_TO || undefined,
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

export const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
