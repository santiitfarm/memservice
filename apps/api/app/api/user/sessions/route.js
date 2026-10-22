import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import StaffSession from "@/app/models/StaffSession";
import { getStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await StaffSession.find({ user: staff.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json(
      {
        success: true,
        currentJti: staff.jti || null,
        sessions: sessions.map((s) => ({
          id: s._id,
          jti: s.jti,
          ip: s.ip,
          userAgent: s.userAgent,
          createdAt: s.createdAt,
          lastSeenAt: s.lastSeenAt,
          isRevoked: Boolean(s.revokedAt),
          revokedAt: s.revokedAt,
          isCurrent: s.jti === staff.jti,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/user/sessions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // Body may be empty if called with query params
    }

    const url = new URL(request.url);
    const everywhere = body.everywhere === true || url.searchParams.get("everywhere") === "true";
    const targetJti = body.jti || url.searchParams.get("jti");

    if (everywhere) {
      // Sign out everywhere: revoke all active sessions for this staff user
      const result = await StaffSession.updateMany(
        { user: staff.id, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
      return NextResponse.json({
        success: true,
        message: "Signed out of all devices successfully",
        revokedCount: result.modifiedCount,
      });
    }

    if (targetJti) {
      const result = await StaffSession.updateOne(
        { user: staff.id, jti: targetJti },
        { $set: { revokedAt: new Date() } }
      );
      return NextResponse.json({
        success: true,
        message: "Session revoked successfully",
        modified: result.modifiedCount > 0,
      });
    }

    return NextResponse.json(
      { success: false, error: "Specify either jti or everywhere: true" },
      { status: 400 }
    );
  } catch (error) {
    console.error("DELETE /api/user/sessions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to revoke sessions" },
      { status: 500 }
    );
  }
}
