import { CustomerProfile } from "@/app/models/customer-profile-model";
import { MIN_PASSWORD_LENGTH } from "@/lib/customer";
import { rateLimit } from "@/lib/rateLimit";
import connectMongo from "@/services/mongo";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  const limited = await rateLimit(req, "customer-reset", {
    limit: 10,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  try {
    await connectMongo();
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 }
      );
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(String(token).trim())
      .digest("hex");
    const customer = await CustomerProfile.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!customer) {
      return NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 400 }
      );
    }

    customer.password = await bcrypt.hash(newPassword, 10);
    customer.passwordResetToken = undefined;
    customer.passwordResetExpires = undefined;
    await customer.save();

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error in reset password handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}
