import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import DeliveryZone from "@/app/models/DeliveryZone";

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    const query = includeInactive ? {} : { status: "active" };
    const zones = await DeliveryZone.find(query).sort({ order: 1, createdAt: 1 }).lean();

    return NextResponse.json({ success: true, zones }, { status: 200 });
  } catch (error) {
    console.error("GET /api/delivery/zones error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch delivery zones" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectMongo();
    const body = await request.json();

    if (!body.key || !body.label || body.charge == null) {
      return NextResponse.json(
        { success: false, error: "key, label, and charge are required" },
        { status: 400 }
      );
    }

    const key = body.key.trim().toLowerCase();
    const existing = await DeliveryZone.findOne({ key });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A delivery zone with this key already exists" },
        { status: 409 }
      );
    }

    if (body.isDefault) {
      await DeliveryZone.updateMany({}, { isDefault: false });
    }

    const zone = await DeliveryZone.create({
      ...body,
      key,
      charge: Number(body.charge),
      freeAbove: body.freeAbove != null ? Number(body.freeAbove) : null,
      minOrder: body.minOrder != null ? Number(body.minOrder) : 0,
      order: body.order != null ? Number(body.order) : 0,
    });

    return NextResponse.json({ success: true, zone }, { status: 201 });
  } catch (error) {
    console.error("POST /api/delivery/zones error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create delivery zone" },
      { status: 500 }
    );
  }
}
