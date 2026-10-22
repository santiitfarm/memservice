import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Integration from "@/app/models/Integration";
import DeliveryZone from "@/app/models/DeliveryZone";
import SiteSettings from "@/app/models/SiteSettings";
import { listCourierAdapters } from "@/lib/integrations/couriers";

export async function GET() {
  try {
    await connectMongo();

    const [integrations, activeZones, siteSettings] = await Promise.all([
      Integration.find({ enabled: true }).lean(),
      DeliveryZone.find({ status: "active" })
        .sort({ order: 1 })
        .select("key label charge freeAbove codAvailable eta")
        .lean(),
      SiteSettings.findOne({ key: "site" }).lean(),
    ]);

    const enabledPaymentMethods = [];
    const enabledCouriers = [];
    let googleAuthEnabled = Boolean(
      process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID
    );
    let googleClientId =
      process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "";
    let metaPixelId = process.env.META_PIXEL_ID || null;
    let metaTestMode = Boolean(process.env.META_TEST_EVENT_CODE);

    const allCourierMetas = listCourierAdapters();

    for (const item of integrations) {
      if (item.category === "payment") {
        enabledPaymentMethods.push({
          key: item.key,
          mode: item.mode,
          name: item.config?.displayName || item.key.toUpperCase(),
        });
      }

      if (item.category === "courier") {
        const found = allCourierMetas.find((c) => c.key === item.key);
        enabledCouriers.push({
          key: item.key,
          name: item.config?.displayName || found?.name || item.key,
          trackingUrlTemplate: found?.trackingUrlTemplate || "",
        });
      }

      if (
        item.key === "google_oauth" ||
        item.key === "google-auth" ||
        item.key === "google"
      ) {
        googleAuthEnabled = item.enabled;
        googleClientId = item.config?.clientId || googleClientId;
      }

      if (
        item.key === "meta_capi" ||
        item.key === "meta_pixel" ||
        item.key === "meta"
      ) {
        metaPixelId = item.config?.pixelId || metaPixelId;
        if (item.config?.testEventCode) metaTestMode = true;
      }
    }

    // Fallback: If no couriers in DB, check env for steadfast or default
    if (enabledCouriers.length === 0) {
      enabledCouriers.push({
        key: "steadfast",
        name: "Steadfast Courier",
        trackingUrlTemplate: "https://steadfast.com.bd/t/{code}",
      });
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
          supportPhone: siteSettings?.contact?.phone || "+8801711655686",
          siteSettings: {
            phone: siteSettings?.contact?.phone || "+8801711655686",
            whatsapp: siteSettings?.contact?.whatsapp || "+8801711655686",
            email: siteSettings?.contact?.email || "support@memservice.com",
            address: siteSettings?.contact?.address || "",
            workingHours: siteSettings?.contact?.workingHours || "9:00 AM - 10:00 PM (Daily)",
          },
          paymentMethods: enabledPaymentMethods,
          deliveryZones: activeZones,
          couriers: enabledCouriers,
          googleAuth: {
            enabled: googleAuthEnabled,
            clientId: googleClientId,
          },
          tracking: {
            metaPixelId,
            testMode: metaTestMode,
          },
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
