import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import { User } from "@/app/models/user-model";
import { getStaff } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(request) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const user = await User.findById(staff.id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Incorrect current password" },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json(
      { success: true, message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/user/security error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update password" },
      { status: 500 }
    );
  }
}
