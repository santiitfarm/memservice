import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Department from "@/app/models/Department";

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    const query = includeInactive ? {} : { status: "active" };
    const departments = await Department.find(query)
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json({ success: true, departments }, { status: 200 });
  } catch (error) {
    console.error("GET /api/cms/departments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectMongo();
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Department name is required" },
        { status: 400 }
      );
    }

    const slug = (body.slug || body.name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await Department.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A department with this slug already exists" },
        { status: 409 }
      );
    }

    const department = await Department.create({
      ...body,
      slug,
      order: body.order != null ? Number(body.order) : 0,
    });

    return NextResponse.json({ success: true, department }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cms/departments error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create department" },
      { status: 500 }
    );
  }
}
