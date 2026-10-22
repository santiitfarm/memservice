import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Coupon from "@/app/models/Coupon";
import { getStaff } from "@/lib/auth";

export async function GET(request) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.code = { $regex: search, $options: "i" };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, coupons }, { status: 200 });
  } catch (error) {
    console.error("GET /api/coupons error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      type = "percent",
      value,
      maxDiscount = 0,
      minSubtotal = 0,
      usageLimit = null,
      perCustomerLimit = 1,
      startsAt = null,
      endsAt = null,
      status = "active",
    } = body;

    if (!code || value == null) {
      return NextResponse.json(
        { success: false, error: "Coupon code and discount value are required" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Coupon code "${cleanCode}" already exists` },
        { status: 409 }
      );
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      type,
      value: Number(value),
      maxDiscount: Number(maxDiscount) || 0,
      minSubtotal: Number(minSubtotal) || 0,
      usageLimit: usageLimit != null && usageLimit !== "" ? Number(usageLimit) : null,
      perCustomerLimit: Number(perCustomerLimit) || 1,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      status,
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    console.error("POST /api/coupons error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}
