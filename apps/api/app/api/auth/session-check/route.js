import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import StaffSession from "@/app/models/StaffSession";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const jti = searchParams.get("jti");

  if (!jti) {
    return NextResponse.json({ valid: false, reason: "Missing jti" }, { status: 400 });
  }

  try {
    await connectMongo();
    const session = await StaffSession.findOne({ jti }).lean();

    if (!session) {
      // If no session document found, session cannot be verified
      return NextResponse.json(
        { valid: false, reason: "Session not found" },
        { status: 401 }
      );
    }

    if (session.revokedAt) {
      return NextResponse.json(
        { valid: false, reason: "Session revoked", revokedAt: session.revokedAt },
        { status: 401 }
      );
    }

    // Touch lastSeenAt asynchronously
    StaffSession.updateOne({ jti }, { $set: { lastSeenAt: new Date() } }).catch(() => {});

    return NextResponse.json({ valid: true, user: session.user });
  } catch (err) {
    return NextResponse.json(
      { valid: false, error: err.message },
      { status: 500 }
    );
  }
}
