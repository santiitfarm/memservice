import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Faq from "@/app/models/Faq";
import { sanitizeRichText } from "@/lib/sanitize";

export async function PUT(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    if (body.answer !== undefined) {
      body.answer = sanitizeRichText(body.answer);
    }
    if (body.order != null) {
      body.order = Number(body.order);
    }

    const updated = await Faq.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "FAQ not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, faq: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/cms/faqs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const { id } = params;

    const deleted = await Faq.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "FAQ not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "FAQ deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/cms/faqs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
