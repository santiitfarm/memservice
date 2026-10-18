import { CustomerProfile } from "@/app/models/customer-profile-model";
import { signCustomerToken } from "@/lib/auth";
import { SAFE_CUSTOMER_FIELDS } from "@/lib/customer";
import { rateLimit } from "@/lib/rateLimit";
import connectMongo from "@/services/mongo";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Verifies customer credentials server-side so password hashes never leave the API.
export async function POST(req) {
  const limited = rateLimit(req, "customer-login", {
    limit: 10,
    windowMs: 5 * 60_000,
  });
  if (limited) return limited;

  try {
    await connectMongo();
    const { phone, password } = await req.json();
    const invalid = () =>
      NextResponse.json(
        { error: "Invalid phone number or password." },
        { status: 401 }
      );
    if (!phone || !password) return invalid();

    const customer = await CustomerProfile.findOne({
      phone_number: String(phone).trim(),
    });
    if (
      !customer?.password ||
      !(await bcrypt.compare(password, customer.password))
    ) {
      return invalid();
    }

    const safe = await CustomerProfile.findById(customer._id)
      .select(SAFE_CUSTOMER_FIELDS)
      .lean();
    return NextResponse.json({
      user: safe,
      token: await signCustomerToken(customer),
    });
  } catch (error) {
    console.error("Error in customer login:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}
