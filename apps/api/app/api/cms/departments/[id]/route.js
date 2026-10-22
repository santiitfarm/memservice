import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Department from "@/app/models/Department";

export async function PUT(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    if (body.order != null) body.order = Number(body.order);

    const updated = await Department.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, department: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/cms/departments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update department" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const { id } = params;

    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Department deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/cms/departments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete department" },
      { status: 500 }
    );
  }
}
