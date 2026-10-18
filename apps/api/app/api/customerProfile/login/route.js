import { CustomerProfile } from "@/app/models/customer-profile-model";
import { signCustomerToken } from "@/lib/auth";
import { SAFE_CUSTOMER_FIELDS } from "@/lib/customer";
import { normalizeBdPhone } from "@/lib/phone";
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
    const body = await req.json().catch(() => ({}));
    const { phone, password } = body;

    const normalizedPhone = normalizeBdPhone(phone);
    if (!normalizedPhone || !password) {
      return NextResponse.json(
        { error: "Invalid phone number or password." },
        { status: 401 }
      );
    }

    const customer = await CustomerProfile.findOne({
      phone_number: normalizedPhone,
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Invalid phone number or password." },
        { status: 401 }
      );
    }

    // A profile created during guest checkout has no password set yet
    if (!customer.password) {
      return NextResponse.json(
        {
          error:
            "This account was created during guest checkout without a password. Please use 'Forgot Password' or Register to set one.",
          code: "GUEST_ACCOUNT_NO_PASSWORD",
        },
        { status: 401 }
      );
    }

    if (!(await bcrypt.compare(password, customer.password))) {
      return NextResponse.json(
        { error: "Invalid phone number or password." },
        { status: 401 }
      );
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
