import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import User from "@/app/models/user-model";
import StaffSession from "@/app/models/StaffSession";
import { getStaff, rankOf, forbidden } from "@/lib/auth";

export const dynamic = "force-dynamic";

const canAssign = (actorRole, targetRole) =>
  actorRole === "super-admin" || rankOf(targetRole) < rankOf(actorRole);

export async function PATCH(request, { params }) {
  try {
    await connectMongo();
    const actor = await getStaff(request);
    if (!actor || rankOf(actor.role) < 2) {
      return forbidden("Admin access required");
    }

    const { id } = await params;
    const body = await request.json();
    const { status, role, first_name, last_name, phone } = body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Role check: actor cannot modify a user of higher rank
    if (actor.role !== "super-admin" && rankOf(targetUser.role) >= rankOf(actor.role)) {
      return forbidden("Cannot modify users with equal or higher rank");
    }

    const update = {};
    let requiresSessionRevocation = false;

    if (first_name) update.first_name = String(first_name).trim();
    if (last_name) update.last_name = String(last_name).trim();
    if (phone) update.phone = String(phone).trim();

    if (status && ["active", "inactive"].includes(status)) {
      if (targetUser.status !== status) {
        update.status = status;
        if (status === "inactive") {
          requiresSessionRevocation = true;
        }
      }
    }

    if (role && ["manager", "admin", "super-admin", "user"].includes(role)) {
      if (targetUser.role !== role) {
        if (!canAssign(actor.role, role)) {
          return forbidden("You cannot assign this role");
        }
        update.role = role;
        requiresSessionRevocation = true;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-password");

    // If role changed or user was deactivated, immediately revoke all active sessions
    if (requiresSessionRevocation) {
      await StaffSession.updateMany(
        { user: id, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      sessionsRevoked: requiresSessionRevocation,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("PATCH /api/user/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectMongo();
    const actor = await getStaff(request);
    if (!actor || rankOf(actor.role) < 3) {
      return forbidden("Super-admin access required to delete users");
    }

    const { id } = await params;
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Revoke all sessions
    await StaffSession.updateMany(
      { user: id, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "User deleted and all active sessions revoked",
    });
  } catch (error) {
    console.error("DELETE /api/user/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
