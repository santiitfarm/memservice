import { User } from "@/app/models/user-model";
import { rankOf } from "@/lib/auth";
import { escapeHtml, sendMail } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";
import connectMongo from "@/services/mongo";
import crypto from "crypto";
import { NextResponse } from "next/server";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const generic = {
  message: "If an active staff account exists for this email, a password reset link has been sent.",
};

export async function POST(req) {
  const limited = await rateLimit(req, "staff-forgot", {
    limit: 5,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  try {
    await connectMongo();
    const body = await req.json().catch(() => ({}));
    const email = body?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Restrict reset to active staff members only (manager, admin, super-admin)
    const isStaff = user && user.status === "active" && rankOf(user.role) >= 1;

    if (!isStaff) {
      // Maintain timing and enumeration resistance by returning the exact same response
      return NextResponse.json(generic);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: tokenHash,
          passwordResetExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      }
    );

    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002";
    const resetUrl = `${adminUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    // Log the link in development if RESEND_API_KEY is not set or in dev mode
    if (process.env.NODE_ENV !== "production" || !process.env.RESEND_API_KEY) {
      console.log(`\n[staff-forgot] Password reset link for ${user.email}:\n${resetUrl}\n`);
    }

    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Staff Member";

    await sendMail({
      to: user.email,
      subject: "Mem Service Dashboard - Password Reset Request",
      text: `Hello ${fullName},\n\nYou requested to reset your password for the Mem Service staff dashboard.\nPlease use the link below to reset your password. This link expires in 30 minutes:\n\n${resetUrl}\n\nIf you did not request this, please disregard this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; color: #184363; border: 1px solid #edf4f6; rounded: 8px;">
          <h2 style="color: #15a9e3; margin-top: 0;">Password Reset Request</h2>
          <p>Hello <strong>${escapeHtml(fullName)}</strong>,</p>
          <p>We received a request to reset your password for the Mem Service staff dashboard.</p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #15a9e3; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 13px; color: #6b7280;">This link is valid for 30 minutes. If the button above does not work, copy and paste this URL into your browser:</p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #edf4f6; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; margin-bottom: 0;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json(generic);
  } catch (error) {
    console.error("Error in staff forgot password handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}
