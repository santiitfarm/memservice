import { CustomerProfile } from "@/app/models/customer-profile-model";
import { escapeHtml, sendMail } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";
import connectMongo from "@/services/mongo";
import crypto from "crypto";
import { NextResponse } from "next/server";

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const generic = {
  message: "If an account exists for this email, a reset code has been sent.",
};

export async function POST(req) {
  const limited = await rateLimit(req, "customer-forgot", {
    limit: 5,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  try {
    await connectMongo();
    const body = await req.json().catch(() => ({}));
    const rawEmail = body?.email;
    const normalizedEmail = String(rawEmail || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const customer = await CustomerProfile.findOne({
      email: normalizedEmail,
    });
    // Same response whether or not the account exists (no account enumeration).
    if (!customer || !customer.email) return NextResponse.json(generic);

    const resetToken = crypto.randomBytes(4).toString("hex");
    customer.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    customer.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await customer.save();

    if (process.env.NODE_ENV !== "production" || !process.env.RESEND_API_KEY) {
      console.log(`\n[customer-forgot] Password reset code for ${customer.email}: ${resetToken}\n`);
    }

    await sendMail({
      to: customer.email,
      subject: "Your Mem Service password reset code",
      text: `Hi ${customer.customer_name}, your password reset code is ${resetToken}. It expires in 15 minutes. If you did not request this, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#184363">
        <h2>Password reset</h2>
        <p>Hi ${escapeHtml(customer.customer_name)}, use this code to reset your password:</p>
        <p style="font-size:28px;letter-spacing:4px;font-weight:bold">${resetToken}</p>
        <p>The code expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>`,
    });

    return NextResponse.json(generic);
  } catch (error) {
    console.error("Error in forgot password handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}
