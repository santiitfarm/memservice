import Product from "@/app/models/product-model";
import connectMongo from "@/services/mongo";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectMongo();
    const productId = (await params).productId;
    const product = await Product.findById(productId)
      .populate({
        path: "category",
        select: "categoryName",
      })
      .populate({
        path: "brand",
        select: "title",
      })
      .select({
        purchase_price: 0,
      });
    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
