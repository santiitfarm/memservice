import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Page from "@/app/models/Page";
import { sanitizeRichText } from "@/lib/sanitize";
import { getStaff } from "@/lib/auth";
import { revalidateStorefront } from "@/lib/revalidate";

export async function GET(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const slug = params.slug.trim().toLowerCase();

    const staff = await getStaff(request);
    const query = staff ? { slug } : { slug, status: "published" };

    const page = await Page.findOne(query).lean();

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, page },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/cms/pages/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const slug = params.slug.trim().toLowerCase();
    const staff = await getStaff(request);
    const body = await request.json();

    const existing = await Page.findOne({ slug });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    if (body.content !== undefined) {
      body.content = sanitizeRichText(body.content);
    }

    if (body.status === "published" && !existing.publishedAt) {
      body.publishedAt = new Date();
    }

    body.updatedBy = staff?._id || existing.updatedBy;

    // Prevent direct slug modification through standard edit to avoid broken links
    delete body.slug;

    const updated = await Page.findByIdAndUpdate(existing._id, body, {
      new: true,
      runValidators: true,
    });

    revalidateStorefront({ path: `/${slug}` });

    return NextResponse.json({ success: true, page: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/cms/pages/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update page" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const slug = params.slug.trim().toLowerCase();

    const deleted = await Page.findOneAndDelete({ slug });
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    revalidateStorefront({ path: `/${slug}` });

    return NextResponse.json(
      { success: true, message: "Page deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/cms/pages/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
