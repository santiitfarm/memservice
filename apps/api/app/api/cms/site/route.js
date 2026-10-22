import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import SiteSettings from "@/app/models/SiteSettings";
import { revalidateStorefront } from "@/lib/revalidate";

export async function GET() {
  try {
    await connectMongo();
    let site = await SiteSettings.findOne({ key: "site" }).lean();

    if (!site) {
      site = await SiteSettings.create({ key: "site" });
    }

    return NextResponse.json(
      { success: true, site },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/cms/site error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch site settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectMongo();
    const body = await request.json();

    // Prevent key change
    delete body.key;
    delete body._id;

    const updated = await SiteSettings.findOneAndUpdate(
      { key: "site" },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    // Revalidate frontend cache
    revalidateStorefront({ tag: "cms-site" });

    return NextResponse.json({ success: true, site: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/cms/site error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update site settings" },
      { status: 500 }
    );
  }
}
