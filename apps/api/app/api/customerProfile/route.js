import { CustomerProfile } from "@/app/models/customer-profile-model";
import { Order } from "@/app/models/order-model";
import {
  authorizeCustomerAccess,
  escapeRegex,
  MIN_PASSWORD_LENGTH,
  SAFE_CUSTOMER_FIELDS,
} from "@/lib/customer";
import { rateLimit } from "@/lib/rateLimit";
import { normalizeBdPhone } from "@/lib/phone";
import connectMongo from "@/services/mongo";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const withOrders = (query) =>
  query.select(SAFE_CUSTOMER_FIELDS).populate({ path: "orders", model: Order });

// Staff: search/list customers. Customer: only their own profile.
export async function GET(req) {
  const access = await authorizeCustomerAccess(req);
  if (access.error) return access.error;

  try {
    await connectMongo();

    if (access.customer) {
      const own = await withOrders(
        CustomerProfile.findById(access.customer.id)
      );
      return NextResponse.json({ customers: own ? [own] : [] }, { status: 200 });
    }

    const mobile = new URL(req.url).searchParams.get("mobile");
    const filter = mobile
      ? {
          phone_number: {
            $regex: escapeRegex(mobile.replace(/\D/g, "")),
            $options: "i",
          },
        }
      : {};
    const customers = await withOrders(
      CustomerProfile.find(filter).sort({ createdAt: -1 })
    );
    return NextResponse.json({ customers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers." },
      { status: 500 }
    );
  }
}

// Public: self-registration.
export async function POST(req) {
  const limited = await rateLimit(req, "customer-register", {
    limit: 10,
    windowMs: 10 * 60_000,
  });
  if (limited) return limited;

  try {
    await connectMongo();
    const body = await req.json().catch(() => ({}));
    const { name, phone, password } = body;

    if (!name?.trim() || !phone || !password) {
      return NextResponse.json(
        { message: "Name, phone and password are required." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeBdPhone(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { message: "Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678)." },
        { status: 400 }
      );
    }

    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const existing = await CustomerProfile.findOne({
      phone_number: normalizedPhone,
    });

    if (existing) {
      // A profile created by a guest checkout has no password and may be claimed.
      // A profile that already has a password must never be overwritten anonymously.
      if (existing.password) {
        return NextResponse.json(
          {
            message:
              "An account with this phone number already exists. Please log in.",
          },
          { status: 409 }
        );
      }
      existing.customer_name = name.trim();
      existing.password = hashed;
      await existing.save();
      return NextResponse.json(
        { message: "Account created successfully." },
        { status: 200 }
      );
    }

    await CustomerProfile.create({
      customer_name: name.trim(),
      phone_number: normalizedPhone,
      password: hashed,
    });
    return NextResponse.json(
      { message: "Customer created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}

// Change password (requires the current password).
export async function PUT(req) {
  try {
    await connectMongo();
    const { customerId, currentPassword, newPassword } = await req.json();

    if (!customerId || !currentPassword || !newPassword) {
      return NextResponse.json(
        {
          error:
            "All fields (customerId, currentPassword, newPassword) are required.",
        },
        { status: 400 }
      );
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }

    const access = await authorizeCustomerAccess(req, customerId);
    if (access.error) return access.error;

    const limited = await rateLimit(req, "customer-password", {
      limit: 10,
      windowMs: 10 * 60_000,
    });
    if (limited) return limited;

    const customer = await CustomerProfile.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    if (
      !customer.password ||
      !(await bcrypt.compare(currentPassword, customer.password))
    ) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 }
      );
    }

    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();
    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in password change handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}
