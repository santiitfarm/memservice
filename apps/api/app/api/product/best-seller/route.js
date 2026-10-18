import connectMongo from "@/services/mongo";
import { NextResponse } from "next/server";

import Product from "@/app/models/product-model";
import { transformProductData } from "@/utils/transformProductData";
import Category from "@/app/models/category-model";
import { Brand } from "@/app/models/brand-model";

export async function GET(req) {
  await connectMongo();
  try {
    // Fetch stocks and populate the product data
    const stocks = await Product.find(
      {},
      "name images discount_price regular_price color stock brand category manufacturer_name generic_name special_tag tags best_seller"
    )
      .sort({ createdAt: -1 })
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

    // Filter for best-seller products
    const filteredStocks = stocks.filter((stock) => stock.best_seller === true);

    // Transform the filtered data
    const transformedStocks = filteredStocks.map((stock) => {
      const stockData = stock.toObject();
      return transformProductData(stockData);
    });

    return NextResponse.json(
      { bestSellers: transformedStocks },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
