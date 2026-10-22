import Review from "@/app/models/Review";
import { rateLimit } from "@/lib/rateLimit";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  await connectMongo();

  const limited = rateLimit(request, "review-helpful", { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "Invalid review ID." }, { status: 400 });
  }

  try {
    const updated = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    ).select("_id helpfulCount");

    if (!updated) {
      return NextResponse.json({ success: false, message: "Review not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      helpfulCount: updated.helpfulCount,
    });
  } catch (error) {
    console.error("POST /api/reviews/[id]/helpful error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
