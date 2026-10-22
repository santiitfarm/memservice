import { priceOrder } from "@/lib/pricing";
import { rateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

export async function POST(request) {
  // Public rate-limited endpoint: max 60 calls per minute per IP
  const limited = await rateLimit(request, "cart-price", { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    const {
      items = [],
      zoneKey,
      district,
      area,
      paymentMethod = "cod",
      couponCode,
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: true,
        items: [],
        subtotal: 0,
        discount: 0,
        deliveryCharge: 0,
        totalAmount: 0,
        deliveryQuote: null,
      });
    }

    // Call priceOrder with allowOutOfStock=true to return inStock flags and maxQty
    const pricing = await priceOrder({
      items,
      zoneKey,
      district,
      area,
      paymentMethod,
      couponCode,
      allowOutOfStock: true,
    });

    return NextResponse.json({
      success: true,
      ...pricing,
    });
  } catch (error) {
    console.error("Cart price preview error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to calculate cart price",
        code: error.code || "PRICING_ERROR",
      },
      { status: 400 }
    );
  }
}
