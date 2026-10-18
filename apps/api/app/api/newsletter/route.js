import { escapeHtml, sendMail } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BRAND = "Mem Service";

const layout = (title, body) => `<!DOCTYPE html>
<html lang="en"><body style="margin:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#184363">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden">
    <div style="background:#15a9e3;color:#fff;padding:24px;text-align:center"><h1 style="margin:0;font-size:22px">${title}</h1></div>
    <div style="padding:24px;line-height:1.6">${body}</div>
    <div style="background:#f4f6f8;padding:16px;text-align:center;font-size:12px;color:#6b7c8a">
      &copy; ${new Date().getFullYear()} ${BRAND}. All rights reserved.
    </div>
  </div>
</body></html>`;

// Public: newsletter signup. The email content is built here, never taken from the client.
export async function POST(request) {
  const limited = rateLimit(request, "newsletter", { limit: 5, windowMs: 10 * 60_000 });
  if (limited) return limited;

  try {
    const { email } = await request.json();
    const address = String(email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(address) || address.length > 254) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const welcome = await sendMail({
      to: address,
      subject: `Welcome to the ${BRAND} newsletter!`,
      html: layout(
        "Welcome to Our Newsletter!",
        `<p>Hi ${escapeHtml(address)},</p>
         <p>Thank you for signing up. You'll now receive our latest arrivals, exclusive deals and special offers.</p>
         <p>Questions? Reply to this email or call +880 1711-655686.</p>`
      ),
    });

    const adminInbox = process.env.EMAIL_ADMIN_TO;
    if (adminInbox) {
      await sendMail({
        to: adminInbox,
        subject: "New newsletter signup",
        html: layout(
          "New Newsletter Signup",
          `<p>A new customer subscribed to the newsletter.</p>
           <ul><li><strong>Email:</strong> ${escapeHtml(address)}</li>
           <li><strong>Date:</strong> ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}</li></ul>`
        ),
      });
    }

    // The signup itself succeeded even if the welcome email could not be delivered.
    return NextResponse.json({ message: "Subscribed", emailSent: welcome.ok });
  } catch (error) {
    console.error("Newsletter signup failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
