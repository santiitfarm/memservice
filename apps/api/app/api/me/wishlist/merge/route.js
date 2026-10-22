import { CustomerProfile } from "@/app/models/customer-profile-model";
import Product from "@/app/models/product-model";
import { getCustomer, unauthorized } from "@/lib/auth";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request) {
  await connectMongo();

  const customer = await getCustomer(request);
  if (!customer) {
    return unauthorized("Customer authentication required");
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No items to merge",
      });
    }

    const validIds = productIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (validIds.length > 0) {
      await CustomerProfile.findByIdAndUpdate(customer.id, {
        $addToSet: { wishlist: { $each: validIds } },
      });
    }

    const profile = await CustomerProfile.findById(customer.id).populate({
      path: "wishlist",
      model: Product,
      match: { status: "active" },
      select: "name slug images regular_price discount_price stock category brand manufacturer_name",
    });

    return NextResponse.json({
      success: true,
      message: "Guest wishlist merged successfully",
      wishlist: profile?.wishlist || [],
      count: profile?.wishlist?.length || 0,
    });
  } catch (error) {
    console.error("POST /api/me/wishlist/merge error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
