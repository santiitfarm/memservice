import { CustomerProfile } from "@/app/models/customer-profile-model";
import { Order } from "@/app/models/order-model";
import Product from "@/app/models/product-model";
import Review from "@/app/models/Review";
import { forbidden, getCustomer, getStaff, unauthorized } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";

// Customer submits a review
export async function POST(request) {
  await connectMongo();

  const limited = rateLimit(request, "customer-review", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const customerAuth = await getCustomer(request);
  if (!customerAuth) {
    return unauthorized("You must be logged in to write a review.");
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { product: rawProduct, rating, title = "", body: reviewBody, images = [] } = body;

    if (!rawProduct) {
      return NextResponse.json({ success: false, message: "Product is required." }, { status: 400 });
    }

    // Resolve product by _id or slug
    const productQuery = mongoose.Types.ObjectId.isValid(rawProduct)
      ? { _id: rawProduct }
      : { slug: String(rawProduct).toLowerCase() };
    const product = await Product.findOne(productQuery).select("_id name").lean();

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be an integer between 1 and 5." },
        { status: 400 }
      );
    }

    if (!reviewBody || typeof reviewBody !== "string" || !reviewBody.trim()) {
      return NextResponse.json(
        { success: false, message: "Review body is required." },
        { status: 400 }
      );
    }

    // Sanitize review body with strict plain text / basic formatting tags
    const sanitizedBody = sanitizeHtml(reviewBody.trim(), {
      allowedTags: ["b", "i", "em", "strong", "p", "br"],
      allowedAttributes: {},
    });

    const sanitizedTitle = sanitizeHtml(title.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    });

    // Check if customer already reviewed this product
    const existing = await Review.findOne({
      product: product._id,
      customer: customerAuth.id,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already submitted a review for this product.",
          review: existing,
        },
        { status: 409 }
      );
    }

    // Check for verified purchase on delivered order
    const deliveredOrder = await Order.findOne({
      customer: customerAuth.id,
      status: "delivered",
      "items.id": product._id.toString(),
    })
      .select("_id")
      .lean();

    const verifiedPurchase = Boolean(deliveredOrder);
    const orderId = deliveredOrder ? deliveredOrder._id : null;

    const review = await Review.create({
      product: product._id,
      customer: customerAuth.id,
      order: orderId,
      verifiedPurchase,
      rating: numRating,
      title: sanitizedTitle,
      body: sanitizedBody,
      images: Array.isArray(images) ? images.slice(0, 5) : [],
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your review has been submitted and is pending moderation.",
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this product." },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Staff lists reviews
export async function GET(request) {
  await connectMongo();

  const staff = await getStaff(request);
  if (!staff) {
    return unauthorized("Staff access required.");
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const productId = searchParams.get("product");
    const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit"), 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      filter.product = productId;
    }

    const [total, reviews] = await Promise.all([
      Review.countDocuments(filter),
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "customer",
          model: CustomerProfile,
          select: "customer_name email phone_number image",
        })
        .populate({
          path: "product",
          model: Product,
          select: "name slug images regular_price discount_price",
        })
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("GET /api/reviews staff error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
