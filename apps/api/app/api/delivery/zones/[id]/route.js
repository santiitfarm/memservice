import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import DeliveryZone from "@/app/models/DeliveryZone";

export async function PUT(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    if (body.isDefault) {
      await DeliveryZone.updateMany({ _id: { $ne: id } }, { isDefault: false });
    }

    if (body.charge != null) body.charge = Number(body.charge);
    if (body.freeAbove !== undefined) {
      body.freeAbove = body.freeAbove != null ? Number(body.freeAbove) : null;
    }
    if (body.minOrder != null) body.minOrder = Number(body.minOrder);
    if (body.order != null) body.order = Number(body.order);

    const updated = await DeliveryZone.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Delivery zone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, zone: updated }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/delivery/zones/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update delivery zone" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectMongo();
    const params = await context.params;
    const { id } = params;

    const deleted = await DeliveryZone.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Delivery zone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Delivery zone removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/delivery/zones/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete delivery zone" },
      { status: 500 }
    );
  }
}
