import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import { User } from "@/app/models/user-model";
import { getStaff } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(staff.id).select("-password").lean();
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { first_name, last_name, phone, avatar, theme } = body;

    const update = {};
    if (first_name) update.first_name = String(first_name).trim();
    if (last_name) update.last_name = String(last_name).trim();
    if (phone) update.phone = String(phone).trim();
    if (avatar !== undefined) update.avatar = String(avatar);
    if (theme && ["system", "light", "dark"].includes(theme)) update.theme = theme;

    const user = await User.findByIdAndUpdate(
      staff.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-password");

    return NextResponse.json(
      { success: true, user, message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
