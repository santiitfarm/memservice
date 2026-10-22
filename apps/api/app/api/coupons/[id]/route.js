import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Coupon from "@/app/models/Coupon";
import { getStaff } from "@/lib/auth";
import mongoose from "mongoose";

export async function PUT(request, context) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid coupon ID" }, { status: 400 });
    }

    const body = await request.json();
    const updateData = { ...body };

    if (updateData.code) {
      updateData.code = updateData.code.trim().toUpperCase();
      const existing = await Coupon.findOne({ code: updateData.code, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: `Coupon code "${updateData.code}" is taken` },
          { status: 409 }
        );
      }
    }

    if (updateData.value != null) updateData.value = Number(updateData.value);
    if (updateData.maxDiscount != null) updateData.maxDiscount = Number(updateData.maxDiscount);
    if (updateData.minSubtotal != null) updateData.minSubtotal = Number(updateData.minSubtotal);
    if (updateData.usageLimit !== undefined) {
      updateData.usageLimit = updateData.usageLimit != null && updateData.usageLimit !== ""
        ? Number(updateData.usageLimit)
        : null;
    }
    if (updateData.startsAt) updateData.startsAt = new Date(updateData.startsAt);
    if (updateData.endsAt) updateData.endsAt = new Date(updateData.endsAt);

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/coupons/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;

    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Coupon deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/coupons/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
