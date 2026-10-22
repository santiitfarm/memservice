import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import SiteSettings from "@/app/models/SiteSettings";
import Menu from "@/app/models/Menu";
import DeliveryZone from "@/app/models/DeliveryZone";

export async function GET() {
  try {
    await connectMongo();

    const [site, allMenus, deliveryZones] = await Promise.all([
      SiteSettings.findOne({ key: "site" }).lean(),
      Menu.find({}).lean(),
      DeliveryZone.find({ status: "active" }).sort({ order: 1, createdAt: 1 }).lean(),
    ]);

    // Key menus by location for rapid O(1) storefront lookups
    const menus = {};
    for (const menu of allMenus) {
      menus[menu.location] = menu.items || [];
    }

    return NextResponse.json(
      {
        success: true,
        bootstrap: {
          site: site || {
            siteName: "Mem Service",
            tagline: "Healthcare & Medicines in Bangladesh",
            contact: { phone: "+8801711655686", email: "support@memservice.com" },
          },
          menus,
          deliveryZones,
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
    console.error("GET /api/cms/bootstrap error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load bootstrap configuration" },
      { status: 500 }
    );
  }
}
