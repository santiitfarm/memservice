import { User } from "@/app/models/user-model";
import { rateLimit } from "@/lib/rateLimit";
import connectMongo from "@/services/mongo";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  const limited = await rateLimit(req, "staff-reset", {
    limit: 10,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  try {
    await connectMongo();
    const body = await req.json().catch(() => ({}));
    const { token, email, newPassword } = body;

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { error: "Token, email, and new password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(newPassword);

    if (cleanPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (cleanPassword.toLowerCase() === normalizedEmail) {
      return NextResponse.json(
        { error: "Password cannot be identical to your email address." },
        { status: 400 }
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(String(token).trim())
      .digest("hex");

    const user = await User.findOne({
      email: normalizedEmail,
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);
    await User.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
      }
    );

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error in staff reset password handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}
