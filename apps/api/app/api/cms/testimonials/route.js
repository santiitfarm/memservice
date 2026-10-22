import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Testimonial from "@/app/models/Testimonial";

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    const query = includeInactive ? {} : { status: "active" };
    const testimonials = await Testimonial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, testimonials }, { status: 200 });
  } catch (error) {
    console.error("GET /api/cms/testimonials error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectMongo();
    const body = await request.json();

    if (!body.name || !body.content) {
      return NextResponse.json(
        { success: false, error: "Name and testimonial content are required" },
        { status: 400 }
      );
    }

    const testimonial = await Testimonial.create({
      ...body,
      rating: body.rating != null ? Number(body.rating) : 5,
      order: body.order != null ? Number(body.order) : 0,
    });

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cms/testimonials error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
