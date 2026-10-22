import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Testimonial from "@/app/models/Testimonial";

export async function PUT(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    if (body.rating != null) body.rating = Number(body.rating);
    if (body.order != null) body.order = Number(body.order);

    const updated = await Testimonial.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, testimonial: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/cms/testimonials/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const { id } = params;

    const deleted = await Testimonial.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Testimonial deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/cms/testimonials/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
