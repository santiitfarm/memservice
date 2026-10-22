import Coupon from "@/app/models/Coupon";
import { getCustomer } from "@/lib/auth";
import { evaluateCoupon } from "@/lib/coupons";
import { priceOrder } from "@/lib/pricing";
import { rateLimit } from "@/lib/rateLimit";
import connectMongo from "@/services/mongo";
import { NextResponse } from "next/server";

export async function POST(request) {
  // Rate-limit to 30 requests per minute per IP to prevent brute-forcing coupon codes
  const limited = rateLimit(request, "coupons-validate", {
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  await connectMongo();

  try {
    const body = await request.json().catch(() => ({}));
    const { code, items, zoneKey, district, area, phone } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, valid: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: "Cart items are required to validate coupon",
        },
        { status: 400 }
      );
    }

    const customer = await getCustomer(request);
    const customerId = customer?.id || null;
    const customerPhone = phone || customer?.phone || null;

    // Price the cart with allowOutOfStock=true to get accurate authoritative prices
    const priced = await priceOrder({
      items,
      zoneKey,
      district,
      area,
      allowOutOfStock: true,
    });

    const couponEval = await evaluateCoupon({
      couponCode: code,
      items: priced.items,
      subtotal: priced.subtotal,
      deliveryCharge: priced.deliveryCharge,
      customerId,
      phone: customerPhone,
    });

    if (!couponEval.valid) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: couponEval.error || "Coupon is invalid or cannot be applied",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      code: couponEval.code,
      type: couponEval.type,
      value: couponEval.value,
      discount: couponEval.discount,
      minSubtotal: couponEval.minSubtotal,
      maxDiscount: couponEval.maxDiscount,
      subtotal: priced.subtotal,
      deliveryCharge: priced.deliveryCharge,
      newTotal: Math.max(0, priced.subtotal + priced.deliveryCharge - couponEval.discount),
    });
  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        message: error.message || "Failed to validate coupon",
      },
      { status: 500 }
    );
  }
}
