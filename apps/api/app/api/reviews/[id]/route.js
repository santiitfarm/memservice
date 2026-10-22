import Review from "@/app/models/Review";
import { forbidden, getStaff, unauthorized } from "@/lib/auth";
import { recomputeProductRating } from "@/lib/reviews";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  await connectMongo();

  const staff = await getStaff(request);
  if (!staff) {
    return unauthorized("Staff access required.");
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "Invalid review ID." }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { status, note = "" } = body;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ success: false, message: "Review not found." }, { status: 404 });
    }

    if (status === "deleted") {
      const productId = review.product;
      await Review.findByIdAndDelete(id);
      const ratingStats = await recomputeProductRating(productId);
      return NextResponse.json({
        success: true,
        message: "Review deleted successfully.",
        ratingStats,
      });
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status must be 'approved', 'rejected', or 'pending'." },
        { status: 400 }
      );
    }

    review.status = status;
    review.moderation = {
      by: staff.id,
      at: new Date(),
      note: note.trim(),
    };

    await review.save();

    // Recompute product ratings whenever review status changes
    const ratingStats = await recomputeProductRating(review.product);

    return NextResponse.json({
      success: true,
      message: `Review marked as ${status}.`,
      review,
      ratingStats,
    });
  } catch (error) {
    console.error("PUT /api/reviews/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
