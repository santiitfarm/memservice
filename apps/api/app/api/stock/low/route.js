import { getStaff, unauthorized } from "@/lib/auth";
import Product from "@/app/models/product-model";
import connectMongo from "@/services/mongo";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectMongo();

  const staff = await getStaff(request);
  if (!staff) {
    return unauthorized("Staff access required");
  }

  try {
    // Find active products where current stock <= lowStockThreshold (or default 5)
    const items = await Product.find({
      status: "active",
      $or: [
        {
          $expr: {
            $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }],
          },
        },
        {
          "variants.stock": { $lte: 5 },
        },
      ],
    })
      .select("name slug sku stock lowStockThreshold variants regular_price discount_price images manufacturer_name")
      .sort({ stock: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("GET /api/stock/low error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
