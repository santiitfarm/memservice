import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import { CustomerProfile } from "@/app/models/customer-profile-model";
import { signCustomerToken } from "@/lib/auth";
import { SAFE_CUSTOMER_FIELDS } from "@/lib/customer";
import { rateLimit } from "@/lib/rateLimit";
import { verifyIdToken } from "@/lib/integrations/auth/google";

export async function POST(request) {
  const limited = await rateLimit(request, "customer-oauth", {
    limit: 15,
    windowMs: 5 * 60_000,
  });
  if (limited) return limited;

  try {
    await connectMongo();
    const body = await request.json().catch(() => ({}));
    const { idToken, profile } = body;

    let email = "";
    let name = "Customer";
    let picture = "";
    let googleId = "";

    if (idToken) {
      const verified = await verifyIdToken(idToken);
      email = verified.email;
      name = verified.name;
      picture = verified.picture;
      googleId = verified.sub;
    } else if (profile && profile.email) {
      // Storefront NextAuth session assertion
      email = String(profile.email).trim().toLowerCase();
      name = profile.name || "Customer";
      picture = profile.image || profile.picture || "";
      googleId = profile.id || profile.sub || "";
    } else {
      return NextResponse.json(
        { success: false, error: "Valid idToken or user profile required" },
        { status: 400 }
      );
    }

    // Find existing profile by email or googleId
    let customer = await CustomerProfile.findOne({
      $or: [
        { email },
        { googleId: googleId || "nonexistent_id" },
      ],
    });

    if (customer) {
      let updated = false;
      if (googleId && !customer.googleId) {
        customer.googleId = googleId;
        updated = true;
      }
      if (picture && !customer.image) {
        customer.image = picture;
        updated = true;
      }
      if (customer.authProvider !== "google" && !customer.password) {
        customer.authProvider = "google";
        updated = true;
      }
      if (updated) await customer.save();
    } else {
      // Auto-create new customer profile without password
      customer = await CustomerProfile.create({
        customer_name: name,
        email,
        googleId,
        image: picture,
        authProvider: "google",
      });
    }

    const safe = await CustomerProfile.findById(customer._id)
      .select(SAFE_CUSTOMER_FIELDS)
      .lean();

    const token = await signCustomerToken(customer);

    return NextResponse.json({
      success: true,
      user: safe,
      token,
    });
  } catch (error) {
    console.error("POST /api/customerProfile/oauth error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "OAuth authentication failed" },
      { status: 401 }
    );
  }
}
