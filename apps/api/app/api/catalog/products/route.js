import { Brand } from "@/app/models/brand-model";
import Category from "@/app/models/category-model";
import Product from "@/app/models/product-model";
import { escapeRegex } from "@/lib/slug";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectMongo();

  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const categoryParam = searchParams.get("category")?.trim() || "";
    const brandParam = searchParams.get("brand")?.trim() || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const rating = searchParams.get("rating");
    const tagsParam = searchParams.get("tags")?.trim() || "";
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit"), 10) || 24));
    const skip = (page - 1) * limit;

    // Base filter: Only active, non-deleted products
    const filter = { status: "active" };

    // 1. Search Query with ReDoS-safe regex and text fallback
    if (q) {
      const escaped = escapeRegex(q);
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { name: regex },
        { generic_name: regex },
        { manufacturer_name: regex },
        { slug: regex },
        { tags: regex },
      ];
    }

    // 2. Category Filter (supports ObjectIds or slugs)
    if (categoryParam) {
      const tokens = categoryParam.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      const objectIds = tokens.filter((t) => mongoose.Types.ObjectId.isValid(t));
      const slugs = tokens.filter((t) => !mongoose.Types.ObjectId.isValid(t));

      const orConditions = [];
      if (objectIds.length > 0) {
        orConditions.push({ _id: { $in: objectIds } });
      }
      if (slugs.length > 0) {
        orConditions.push({ slug: { $in: slugs } });
      }

      if (orConditions.length > 0) {
        const foundCategories = await Category.find({ $or: orConditions }).select("_id").lean();
        const matchedIds = foundCategories.map((c) => c._id);
        filter.category = { $in: matchedIds };
      }
    }

    // 3. Brand Filter (supports ObjectIds or slugs)
    if (brandParam) {
      const tokens = brandParam.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      const objectIds = tokens.filter((t) => mongoose.Types.ObjectId.isValid(t));
      const slugs = tokens.filter((t) => !mongoose.Types.ObjectId.isValid(t));

      const orConditions = [];
      if (objectIds.length > 0) {
        orConditions.push({ _id: { $in: objectIds } });
      }
      if (slugs.length > 0) {
        orConditions.push({ slug: { $in: slugs } });
      }

      if (orConditions.length > 0) {
        const foundBrands = await Brand.find({ $or: orConditions }).select("_id").lean();
        const matchedIds = foundBrands.map((b) => b._id);
        filter.brand = { $in: matchedIds };
      }
    }

    // 4. In-Stock Filter
    if (inStock === "true") {
      filter.stock = { $gt: 0 };
    } else if (inStock === "false") {
      filter.stock = { $lte: 0 };
    }

    // 5. Rating Filter
    if (rating && !isNaN(Number(rating))) {
      filter.avgRating = { $gte: Number(rating) };
    }

    // 6. Tags Filter
    if (tagsParam) {
      const tagList = tagsParam.split(",").map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        filter.tags = { $in: tagList };
      }
    }

    // 7. Price Range Filter (evaluated on effective price: discount_price > 0 ? discount_price : regular_price)
    const numMin = minPrice !== null && minPrice !== "" && !isNaN(Number(minPrice)) ? Number(minPrice) : null;
    const numMax = maxPrice !== null && maxPrice !== "" && !isNaN(Number(maxPrice)) ? Number(maxPrice) : null;

    if (numMin !== null || numMax !== null) {
      const priceExpr = {
        $cond: {
          if: { $and: [{ $gt: ["$discount_price", 0] }, { $ne: ["$discount_price", null] }] },
          then: "$discount_price",
          else: "$regular_price",
        },
      };

      const exprConditions = [];
      if (numMin !== null) {
        exprConditions.push({ $gte: [priceExpr, numMin] });
      }
      if (numMax !== null) {
        exprConditions.push({ $lte: [priceExpr, numMax] });
      }

      if (exprConditions.length > 0) {
        filter.$expr = filter.$expr
          ? { $and: [filter.$expr, ...exprConditions] }
          : { $and: exprConditions };
      }
    }

    // 8. Sorting
    let sortOption = { createdAt: -1 };
    switch (sort) {
      case "price_asc":
        sortOption = { discount_price: 1, regular_price: 1 };
        break;
      case "price_desc":
        sortOption = { discount_price: -1, regular_price: -1 };
        break;
      case "popular":
        sortOption = { sold_out: -1, avgRating: -1, createdAt: -1 };
        break;
      case "rating":
        sortOption = { avgRating: -1, reviewCount: -1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // 9. Execute Query & Total Count
    const [total, items, facetAggregate] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate({ path: "category", model: Category, select: "categoryName slug" })
        .populate({ path: "brand", model: Brand, select: "title slug logo" })
        .select({ purchase_price: 0, __v: 0 })
        .lean(),
      Product.aggregate([
        { $match: { status: "active" } },
        {
          $facet: {
            categories: [
              { $match: { category: { $ne: null } } },
              { $group: { _id: "$category", count: { $sum: 1 } } },
              { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "cat" } },
              { $unwind: "$cat" },
              { $project: { _id: 1, name: "$cat.categoryName", slug: "$cat.slug", count: 1 } },
              { $sort: { count: -1 } },
              { $limit: 20 },
            ],
            brands: [
              { $match: { brand: { $ne: null } } },
              { $group: { _id: "$brand", count: { $sum: 1 } } },
              { $lookup: { from: "brands", localField: "_id", foreignField: "_id", as: "b" } },
              { $unwind: "$b" },
              { $project: { _id: 1, name: "$b.title", slug: "$b.slug", count: 1 } },
              { $sort: { count: -1 } },
              { $limit: 20 },
            ],
            priceRange: [
              {
                $group: {
                  _id: null,
                  minPrice: { $min: "$regular_price" },
                  maxPrice: { $max: "$regular_price" },
                },
              },
            ],
          },
        },
      ]),
    ]);

    const facets = {
      categories: facetAggregate[0]?.categories || [],
      brands: facetAggregate[0]?.brands || [],
      priceRange: {
        min: facetAggregate[0]?.priceRange[0]?.minPrice || 0,
        max: facetAggregate[0]?.priceRange[0]?.maxPrice || 1000,
      },
    };

    return NextResponse.json({
      success: true,
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
      facets,
    });
  } catch (error) {
    console.error("GET /api/catalog/products error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
