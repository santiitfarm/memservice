import { CustomerProfile } from "@/app/models/customer-profile-model";
import Product from "@/app/models/product-model";
import { getCustomer, unauthorized } from "@/lib/auth";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectMongo();

  const customer = await getCustomer(request);
  if (!customer) {
    return unauthorized("Customer authentication required");
  }

  try {
    const profile = await CustomerProfile.findById(customer.id).populate({
      path: "wishlist",
      model: Product,
      match: { status: "active" },
      select: "name slug images regular_price discount_price stock category brand manufacturer_name",
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Customer profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wishlist: profile.wishlist || [],
      count: profile.wishlist?.length || 0,
    });
  } catch (error) {
    console.error("GET /api/me/wishlist error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  await connectMongo();

  const customer = await getCustomer(request);
  if (!customer) {
    return unauthorized("Customer authentication required");
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { productIds, productId, action } = body;

    const profile = await CustomerProfile.findById(customer.id);
    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Customer profile not found" },
        { status: 404 }
      );
    }

    if (Array.isArray(productIds)) {
      // Replace entire wishlist with valid IDs
      const validIds = productIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      profile.wishlist = validIds;
    } else if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      const pIdStr = String(productId);
      const currentList = (profile.wishlist || []).map((id) => String(id));

      if (action === "remove") {
        profile.wishlist = profile.wishlist.filter((id) => String(id) !== pIdStr);
      } else {
        // default action is 'add' or toggle
        if (action === "toggle") {
          if (currentList.includes(pIdStr)) {
            profile.wishlist = profile.wishlist.filter((id) => String(id) !== pIdStr);
          } else {
            profile.wishlist.push(new mongoose.Types.ObjectId(productId));
          }
        } else {
          // add if not present
          if (!currentList.includes(pIdStr)) {
            profile.wishlist.push(new mongoose.Types.ObjectId(productId));
          }
        }
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Specify productIds array or productId" },
        { status: 400 }
      );
    }

    await profile.save();

    const populated = await CustomerProfile.findById(customer.id).populate({
      path: "wishlist",
      model: Product,
      match: { status: "active" },
      select: "name slug images regular_price discount_price stock category brand manufacturer_name",
    });

    return NextResponse.json({
      success: true,
      message: "Wishlist updated successfully",
      wishlist: populated.wishlist || [],
      count: populated.wishlist?.length || 0,
    });
  } catch (error) {
    console.error("PUT /api/me/wishlist error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
