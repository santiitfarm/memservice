import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Page from "@/app/models/Page";
import { sanitizeRichText } from "@/lib/sanitize";
import { getStaff } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const template = searchParams.get("template");

    const query = {};
    if (status) query.status = status;
    if (template) query.template = template;

    const pages = await Page.find(query)
      .sort({ updatedAt: -1 })
      .select("slug title template status publishedAt updatedAt")
      .lean();

    return NextResponse.json({ success: true, pages }, { status: 200 });
  } catch (error) {
    console.error("GET /api/cms/pages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    const body = await request.json();

    if (!body.title || !body.slug) {
      return NextResponse.json(
        { success: false, error: "Title and slug are required" },
        { status: 400 }
      );
    }

    const slug = body.slug.trim().toLowerCase().replace(/\s+/g, "-");
    const existing = await Page.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A page with this slug already exists" },
        { status: 409 }
      );
    }

    const sanitizedContent = sanitizeRichText(body.content || "");
    const sanitizedContentBn = sanitizeRichText(body.contentBn || "");
    const publishedAt =
      body.status === "published" ? body.publishedAt || new Date() : null;

    const page = await Page.create({
      ...body,
      slug,
      content: sanitizedContent,
      contentBn: sanitizedContentBn,
      publishedAt,
      updatedBy: staff?._id || null,
    });

    if (page.status === "published") {
      revalidateStorefront({ path: `/${page.slug}` });
    }

    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cms/pages error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create page" },
      { status: 500 }
    );
  }
}
