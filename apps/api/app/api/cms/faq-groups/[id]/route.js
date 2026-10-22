import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import FaqGroup from "@/app/models/FaqGroup";
import Faq from "@/app/models/Faq";

export async function PUT(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    if (body.order != null) body.order = Number(body.order);

    const updated = await FaqGroup.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "FAQ group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, group: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/cms/faq-groups/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update FAQ group" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const { id } = params;

    const deleted = await FaqGroup.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "FAQ group not found" },
        { status: 404 }
      );
    }

    // Unset groupId on orphaned FAQs
    await Faq.updateMany({ groupId: id }, { $set: { groupId: null } });

    return NextResponse.json(
      { success: true, message: "FAQ group deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/cms/faq-groups/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete FAQ group" },
      { status: 500 }
    );
  }
}
