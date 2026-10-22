import { CustomerProfile } from "@/app/models/customer-profile-model";
import Product from "@/app/models/product-model";
import Review from "@/app/models/Review";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connectMongo();

  const { idOrSlug } = await params;
  if (!idOrSlug) {
    return NextResponse.json({ success: false, message: "Product identifier is required." }, { status: 400 });
  }

  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isObjectId
      ? { _id: idOrSlug }
      : {
          $or: [
            { slug: idOrSlug.toLowerCase() },
            { slugHistory: idOrSlug.toLowerCase() },
          ],
        };

    const product = await Product.findOne(filter).select("_id name slug").lean();
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit"), 10) || 10));
    const skip = (page - 1) * limit;

    const reviewFilter = {
      product: product._id,
      status: "approved",
    };

    const [total, reviews, summaryStats] = await Promise.all([
      Review.countDocuments(reviewFilter),
      Review.find(reviewFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "customer",
          model: CustomerProfile,
          select: "customer_name image",
        })
        .select("-moderation -__v")
        .lean(),
      Review.aggregate([
        { $match: reviewFilter },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            verifiedCount: {
              $sum: { $cond: ["$verifiedPurchase", 1, 0] },
            },
            star5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
            star4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            star3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            star2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            star1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const stats = summaryStats[0] || {};
    const summary = {
      averageRating: stats.avgRating ? Math.round(stats.avgRating * 10) / 10 : 0,
      totalReviews: total,
      verifiedPurchases: stats.verifiedCount || 0,
      distribution: {
        5: stats.star5 || 0,
        4: stats.star4 || 0,
        3: stats.star3 || 0,
        2: stats.star2 || 0,
        1: stats.star1 || 0,
      },
    };

    return NextResponse.json({
      success: true,
      productId: product._id,
      slug: product.slug,
      reviews,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
      summary,
    });
  } catch (error) {
    console.error("GET /api/products/[idOrSlug]/reviews error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
