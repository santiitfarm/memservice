import Review from "@/app/models/Review";
import { forbidden, getStaff, unauthorized } from "@/lib/auth";
import { recomputeProductRating } from "@/lib/reviews";
import { revalidateStorefront } from "@/lib/revalidate";
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
    const { status, note = "", showOnHome } = body;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ success: false, message: "Review not found." }, { status: 404 });
    }

    if (status === "deleted") {
      const productId = review.product;
      await Review.findByIdAndDelete(id);
      const ratingStats = await recomputeProductRating(productId);
      await revalidateStorefront({ tag: "cms-home", path: "/" }).catch(() => {});
      return NextResponse.json({
        success: true,
        message: "Review deleted successfully.",
        ratingStats,
      });
    }

    let statusChanged = false;
    if (status) {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return NextResponse.json(
          { success: false, message: "Status must be 'approved', 'rejected', or 'pending'." },
          { status: 400 }
        );
      }
      review.status = status;
      // If rejecting or resetting to pending, unfeature from homepage
      if (status !== "approved") {
        review.showOnHome = false;
      }
      statusChanged = true;
    }

    let homeChanged = false;
    if (typeof showOnHome === "boolean") {
      review.showOnHome = showOnHome;
      // If featuring on homepage, automatically ensure status is approved
      if (showOnHome && review.status !== "approved") {
        review.status = "approved";
        statusChanged = true;
      }
      homeChanged = true;
    }

    review.moderation = {
      by: staff.id,
      at: new Date(),
      note: note.trim() || review.moderation?.note || "",
    };

    await review.save();

    let ratingStats = null;
    if (statusChanged) {
      ratingStats = await recomputeProductRating(review.product);
    }

    // Revalidate homepage whenever featured status or approval status changes
    if (homeChanged || statusChanged) {
      await revalidateStorefront({ tag: "cms-home", path: "/" }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Review updated successfully.`,
      review,
      ratingStats,
    });
  } catch (error) {
    console.error("PUT /api/reviews/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
