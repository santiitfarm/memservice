import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import HomeLayout from "@/app/models/HomeLayout";
import Slider from "@/app/models/slider-model";
import Banner from "@/app/models/banner-model";
import Category from "@/app/models/category-model";
import { Brand } from "@/app/models/brand-model";
import Testimonial from "@/app/models/Testimonial";
import Department from "@/app/models/Department";
import Review from "@/app/models/Review";
import Product from "@/app/models/product-model";
import { CustomerProfile } from "@/app/models/customer-profile-model";
import { revalidateStorefront } from "@/lib/revalidate";

export async function GET() {
  try {
    await connectMongo();

    const [
      layout,
      sliders,
      categories,
      brands,
      banners,
      testimonials,
      departments,
      homeReviews,
    ] = await Promise.all([
      HomeLayout.findOne({ key: "home" }).lean(),
      Slider.find({ status: "active" }).sort({ order: 1, createdAt: -1 }).lean(),
      Category.find({ $or: [{ status: "active" }, { status: { $exists: false } }] })
        .sort({ order: 1, createdAt: 1 })
        .lean(),
      Brand.find({ status: "active" }).sort({ order: 1, createdAt: 1 }).lean(),
      Banner.find({ status: "active" }).sort({ order: 1, createdAt: -1 }).lean(),
      Testimonial.find({ status: "active" }).sort({ order: 1, createdAt: -1 }).limit(8).lean(),
      Department.find({ status: "active" }).sort({ order: 1, name: 1 }).lean(),
      Review.find({ status: "approved", showOnHome: true })
        .sort({ createdAt: -1 })
        .limit(10)
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

    const mappedReviews = (homeReviews || []).map((r) => ({
      _id: r._id,
      name: r.customer?.customer_name || "Verified Customer",
      role: "Verified Buyer",
      avatar: r.customer?.image || "",
      rating: r.rating || 5,
      content: r.body,
      title: r.title || "",
      product: r.product
        ? {
            id: r.product._id,
            name: r.product.name,
            slug: r.product.slug,
            image: Array.isArray(r.product.images) ? r.product.images[0] : "",
          }
        : null,
      verifiedPurchase: r.verifiedPurchase ?? true,
      createdAt: r.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        home: {
          layout: layout?.sections || [],
          sliders,
          categories,
          brands,
          banners,
          testimonials: mappedReviews.length > 0 ? mappedReviews : testimonials,
          reviews: mappedReviews,
          departments,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/cms/home error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve home layout data" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectMongo();
    const body = await request.json();

    const sections = Array.isArray(body.sections) ? body.sections : [];

    const updated = await HomeLayout.findOneAndUpdate(
      { key: "home" },
      { $set: { sections } },
      { new: true, upsert: true, runValidators: true }
    );

    revalidateStorefront({ tag: "cms-home", path: "/" });

    return NextResponse.json(
      { success: true, layout: updated.sections },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/cms/home error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update home layout" },
      { status: 500 }
    );
  }
}
