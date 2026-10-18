import connectMongo from "@/services/mongo";
import { NextResponse } from "next/server";
import Product from "@/app/models/product-model";
import { transformProductData } from "@/utils/transformProductData";
import Category from "@/app/models/category-model";
import { Brand } from "@/app/models/brand-model";

export async function GET(req) {
  await connectMongo();
  try {
    const { searchParams } = new URL(req.url);

    const tagQuery = searchParams.get("tags")?.split(","); // Extract tags from query parameters

    let query = { status: { $ne: "deleted" } }; // Initial query condition

    if (tagQuery && tagQuery.length > 0) {
      query = {
        ...query,
        tags: { $in: tagQuery }, // Add tags condition to query
      };
    }

    const stocks = await Product.find(
      query,
      "name images discount_price regular_price color stock brand category manufacturer_name generic_name special_tag tags products_type is_new is_trending is_offer best_seller sold_out"
    )
      .populate({
        path: "category",
        model: Category,
        select: "categoryName",
      })
      .populate({
        path: "brand",
        model: Brand,
        select: "title",
      });

    const transformedStocks = stocks.map((stock) => {
      const stockData = stock.toObject();
      return transformProductData(stockData);
    });

    return NextResponse.json(
      {
        related_products: transformedStocks.slice(0, 6),
        total: transformedStocks.slice(0, 6).length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
