import { getStaff, unauthorized } from "@/lib/auth";
import Product from "@/app/models/product-model";
import StockMovement from "@/app/models/StockMovement";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request) {
  await connectMongo();

  const staff = await getStaff(request);
  if (!staff) {
    return unauthorized("Staff access required for stock adjustments");
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { productId, variantSku, delta, reason = "adjustment", reference = "" } = body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, message: "Valid productId is required" },
        { status: 400 }
      );
    }

    const numDelta = Number(delta);
    if (isNaN(numDelta) || numDelta === 0) {
      return NextResponse.json(
        { success: false, message: "Non-zero numeric delta is required" },
        { status: 400 }
      );
    }

    const validReasons = ["adjustment", "restock", "order", "cancel", "return"];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        {
          success: false,
          message: `Reason must be one of: ${validReasons.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    let balanceAfter = 0;

    if (variantSku && Array.isArray(product.variants) && product.variants.length > 0) {
      const variant = product.variants.find((v) => v.sku === variantSku);
      if (!variant) {
        return NextResponse.json(
          { success: false, message: `Variant with SKU "${variantSku}" not found on product` },
          { status: 404 }
        );
      }

      const newVarStock = Number(variant.stock || 0) + numDelta;
      if (newVarStock < 0) {
        return NextResponse.json(
          { success: false, message: `Adjustment would result in negative variant stock (${newVarStock})` },
          { status: 400 }
        );
      }

      variant.stock = newVarStock;
      balanceAfter = newVarStock;

      // Update aggregate product stock
      product.stock = product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      await product.save();
    } else {
      const newStock = Number(product.stock || 0) + numDelta;
      if (newStock < 0) {
        return NextResponse.json(
          { success: false, message: `Adjustment would result in negative product stock (${newStock})` },
          { status: 400 }
        );
      }

      product.stock = newStock;
      balanceAfter = newStock;
      await product.save();
    }

    // Record StockMovement audit entry
    const movement = await StockMovement.create({
      product: product._id,
      variantSku: variantSku || null,
      delta: numDelta,
      reason,
      reference: reference || `Manual adjustment by ${staff.name || staff.email}`,
      balanceAfter,
      by: staff.id,
      at: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Stock adjusted successfully",
      balanceAfter,
      movement,
      product: {
        _id: product._id,
        name: product.name,
        stock: product.stock,
      },
    });
  } catch (error) {
    console.error("POST /api/stock/adjust error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
