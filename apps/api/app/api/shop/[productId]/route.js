import Product from "@/app/models/product-model";
import Category from "@/app/models/category-model";
import { Brand } from "@/app/models/brand-model";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectMongo();
    const resolvedParams = await params;
    const identifier = resolvedParams?.productId || "";

    if (!identifier) {
      return NextResponse.json({ error: "Product identifier is required" }, { status: 400 });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    let filter;

    if (isObjectId) {
      filter = { _id: identifier };
    } else {
      const cleanSlug = identifier.toLowerCase().trim();
      filter = {
        $or: [{ slug: cleanSlug }, { slugHistory: cleanSlug }],
      };
    }

    const product = await Product.findOne(filter)
      .populate({
        path: "category",
        model: Category,
        select: "categoryName",
      })
      .populate({
        path: "brand",
        model: Brand,
        select: "title",
      })
      .select({
        purchase_price: 0,
      })
      .lean();

    if (!product || product.status === "deleted") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        product,
        slug: product.slug || null,
        isObjectId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/shop/[productId] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
