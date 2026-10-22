import Product from "@/app/models/product-model";
import Review from "@/app/models/Review";
import mongoose from "mongoose";

/**
 * Recomputes the average rating and total approved review count on a product.
 * @param {string|mongoose.Types.ObjectId} productId
 * @returns {Promise<{ avgRating: number, reviewCount: number }>}
 */
export async function recomputeProductRating(productId) {
  if (!productId) return { avgRating: 0, reviewCount: 0 };
  const pId =
    typeof productId === "string"
      ? new mongoose.Types.ObjectId(productId)
      : productId;

  const stats = await Review.aggregate([
    { $match: { product: pId, status: "approved" } },
    {
      $group: {
        _id: "$product",
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  const count = stats[0]?.count || 0;
  const avgRating = count > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;

  await Product.findByIdAndUpdate(pId, {
    avgRating,
    reviewCount: count,
  });

  return { avgRating, reviewCount: count };
}

export default recomputeProductRating;
