import { getStaff, unauthorized } from "@/lib/auth";
import Product from "@/app/models/product-model";
import StockMovement from "@/app/models/StockMovement";
import { User } from "@/app/models/user-model";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectMongo();

  const staff = await getStaff(request);
  if (!staff) {
    return unauthorized("Staff access required");
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const variantSku = searchParams.get("variantSku");
  const reason = searchParams.get("reason");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const query = {};
  if (productId && mongoose.Types.ObjectId.isValid(productId)) {
    query.product = productId;
  }
  if (variantSku) {
    query.variantSku = variantSku;
  }
  if (reason) {
    query.reason = reason;
  }

  try {
    const [movements, total] = await Promise.all([
      StockMovement.find(query)
        .populate({
          path: "product",
          model: Product,
          select: "name slug sku images stock",
        })
        .populate({
          path: "by",
          model: User,
          select: "name email role",
        })
        .sort({ at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      StockMovement.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      movements,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("GET /api/stock/movements error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
