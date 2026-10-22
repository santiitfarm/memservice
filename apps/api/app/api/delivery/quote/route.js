import { NextResponse } from "next/server";
import { calculateDeliveryQuote } from "@/lib/delivery";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { zoneKey, subtotal, paymentMethod, district, area } = body;

    const quote = await calculateDeliveryQuote({
      zoneKey,
      subtotal,
      paymentMethod,
      district,
      area,
    });

    return NextResponse.json({ success: true, quote }, { status: 200 });
  } catch (error) {
    console.error("POST /api/delivery/quote error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate delivery quote" },
      { status: 500 }
    );
  }
}
