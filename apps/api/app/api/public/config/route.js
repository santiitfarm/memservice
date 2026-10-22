import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Integration from "@/app/models/Integration";
import DeliveryZone from "@/app/models/DeliveryZone";

export async function GET() {
  try {
    await connectMongo();

    const [integrations, activeZones] = await Promise.all([
      Integration.find({ enabled: true }).lean(),
      DeliveryZone.find({ status: "active" })
        .sort({ order: 1 })
        .select("key label charge freeAbove codAvailable eta")
        .lean(),
    ]);

    // Safe flags map
    const enabledPaymentMethods = [];
    let googleAuthEnabled = false;
    let metaPixelId = null;

    for (const item of integrations) {
      if (item.category === "payment") {
        enabledPaymentMethods.push({
          key: item.key,
          mode: item.mode,
          name:
            item.config?.displayName ||
            item.key.toUpperCase(),
        });
      }
      if (item.key === "google_oauth" || item.key === "google") {
        googleAuthEnabled = true;
      }
      if (item.key === "meta_pixel" || item.key === "facebook_pixel") {
        metaPixelId = item.config?.pixelId || null;
      }
    }

    // Always include COD by default unless delivery zones forbid it
    if (!enabledPaymentMethods.some((p) => p.key === "cod")) {
      enabledPaymentMethods.unshift({
        key: "cod",
        mode: "live",
        name: "Cash on Delivery",
      });
    }

    return NextResponse.json(
      {
        success: true,
        config: {
          paymentMethods: enabledPaymentMethods,
          deliveryZones: activeZones,
          googleAuthEnabled,
          metaPixelId,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/public/config error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch public configurations" },
      { status: 500 }
    );
  }
}
