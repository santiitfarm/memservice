import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Menu from "@/app/models/Menu";
import { revalidateStorefront } from "@/lib/revalidate";

const VALID_LOCATIONS = [
  "header",
  "footer-1",
  "footer-2",
  "footer-3",
  "footer-4",
  "mobile",
];

function isSafeUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();
  return (
    !trimmed.startsWith("javascript:") &&
    !trimmed.startsWith("data:") &&
    !trimmed.startsWith("vbscript:")
  );
}

function validateMenuItems(items) {
  if (!Array.isArray(items)) return "Items must be an array";

  for (const item of items) {
    if (!item.label || typeof item.label !== "string") {
      return "Every menu item must have a text label";
    }
    if (!item.url || !isSafeUrl(item.url)) {
      return `Invalid or unsafe URL in item: "${item.label}"`;
    }

    if (Array.isArray(item.children)) {
      for (const child of item.children) {
        if (!child.label || typeof child.label !== "string") {
          return `Every submenu child under "${item.label}" must have a label`;
        }
        if (!child.url || !isSafeUrl(child.url)) {
          return `Invalid or unsafe child URL under "${item.label}"`;
        }
        // Depth <= 2 enforcement: child must not have children
        if (child.children && child.children.length > 0) {
          return `Menu depth cannot exceed 2 levels (error under "${child.label}")`;
        }
      }
    }
  }

  return null;
}

export async function GET(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const location = params.location.toLowerCase();

    if (!VALID_LOCATIONS.includes(location)) {
      return NextResponse.json(
        { success: false, error: "Invalid menu location" },
        { status: 400 }
      );
    }

    const menu = await Menu.findOne({ location }).lean();

    return NextResponse.json(
      {
        success: true,
        menu: menu || { location, title: location, items: [] },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/cms/menus/[location] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const location = params.location.toLowerCase();

    if (!VALID_LOCATIONS.includes(location)) {
      return NextResponse.json(
        { success: false, error: "Invalid menu location" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, items } = body;

    const validationError = validateMenuItems(items || []);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    const updated = await Menu.findOneAndUpdate(
      { location },
      {
        $set: {
          title: title || location,
          items: items || [],
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    revalidateStorefront({ tag: `cms-menu-${location}` });

    return NextResponse.json({ success: true, menu: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/cms/menus/[location] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save menu" },
      { status: 500 }
    );
  }
}
