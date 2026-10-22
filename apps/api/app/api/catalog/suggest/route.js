import { Brand } from "@/app/models/brand-model";
import Category from "@/app/models/category-model";
import Product from "@/app/models/product-model";
import { escapeRegex } from "@/lib/slug";
import connectMongo from "@/services/mongo";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectMongo();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q || q.length < 1) {
    return NextResponse.json(
      { success: true, products: [], categories: [], brands: [] },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  }

  try {
    const escaped = escapeRegex(q);
    const regex = new RegExp(escaped, "i");

    const [products, categories, brands] = await Promise.all([
      // Top 8 matching active products
      Product.find({
        status: "active",
        $or: [
          { name: regex },
          { generic_name: regex },
          { manufacturer_name: regex },
          { slug: regex },
        ],
      })
        .select("name slug images discount_price regular_price manufacturer_name stock avgRating")
        .limit(8)
        .lean(),

      // Top 5 matching categories
      Category.find({
        status: "active",
        $or: [{ categoryName: regex }, { slug: regex }],
      })
        .select("categoryName slug categoryImg")
        .limit(5)
        .lean(),

      // Top 5 matching brands
      Brand.find({
        status: "active",
        $or: [{ title: regex }, { slug: regex }],
      })
        .select("title slug logo")
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json(
      {
        success: true,
        query: q,
        products: products.map((p) => ({
          id: p._id,
          name: p.name,
          slug: p.slug,
          image: p.images?.[0] || null,
          price: p.discount_price > 0 ? p.discount_price : p.regular_price,
          regularPrice: p.regular_price,
          discountPrice: p.discount_price,
          manufacturer: p.manufacturer_name,
          inStock: p.stock > 0,
        })),
        categories: categories.map((c) => ({
          id: c._id,
          name: c.categoryName,
          slug: c.slug,
          image: c.categoryImg || null,
        })),
        brands: brands.map((b) => ({
          id: b._id,
          name: b.title,
          slug: b.slug,
          logo: b.logo || null,
        })),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/catalog/suggest error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
