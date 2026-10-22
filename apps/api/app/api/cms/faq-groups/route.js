import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import FaqGroup from "@/app/models/FaqGroup";

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    const query = includeInactive ? {} : { status: "active" };
    const groups = await FaqGroup.find(query).sort({ order: 1, createdAt: 1 }).lean();

    return NextResponse.json({ success: true, groups }, { status: 200 });
  } catch (error) {
    console.error("GET /api/cms/faq-groups error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQ groups" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectMongo();
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const slug = (body.slug || body.title)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const group = await FaqGroup.create({
      ...body,
      slug,
      order: body.order != null ? Number(body.order) : 0,
    });

    return NextResponse.json({ success: true, group }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cms/faq-groups error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create FAQ group" },
      { status: 500 }
    );
  }
}
