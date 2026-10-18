import { CustomerProfile } from "@/app/models/customer-profile-model";
import { authorizeCustomerAccess, SAFE_CUSTOMER_FIELDS } from "@/lib/customer";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const notFound = () =>
  NextResponse.json({ error: "Customer not found." }, { status: 404 });
const serverError = () =>
  NextResponse.json(
    { error: "Internal Server Error. Please try again later." },
    { status: 500 }
  );

// Staff may read any customer; a customer only their own profile.
export async function GET(req, { params }) {
  const { id } = await params;
  const access = await authorizeCustomerAccess(req, id);
  if (access.error) return access.error;
  if (!mongoose.isValidObjectId(id)) return notFound();

  try {
    await connectMongo();
    const customer = await CustomerProfile.findById(id).select(
      SAFE_CUSTOMER_FIELDS
    );
    return customer ? NextResponse.json(customer, { status: 200 }) : notFound();
  } catch (error) {
    console.error("Error in GET handler:", error);
    return serverError();
  }
}

// Update profile details (staff or the customer themselves).
export async function PUT(req, { params }) {
  const { id } = await params;
  const access = await authorizeCustomerAccess(req, id);
  if (access.error) return access.error;
  if (!mongoose.isValidObjectId(id)) return notFound();

  try {
    await connectMongo();
    const { name, phone, email, address } = await req.json();

    const customer = await CustomerProfile.findById(id);
    if (!customer) return notFound();

    if (name) customer.customer_name = name;
    if (phone) customer.phone_number = phone;
    if (email) customer.email = String(email).trim().toLowerCase();
    if (address) customer.address = address;
    await customer.save();

    const safe = await CustomerProfile.findById(id).select(SAFE_CUSTOMER_FIELDS);
    return NextResponse.json(
      { message: "Customer updated successfully.", customer: safe },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT handler:", error);
    return serverError();
  }
}

// Staff only (enforced in middleware.js).
export async function DELETE(req, { params }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return notFound();

  try {
    await connectMongo();
    const customer = await CustomerProfile.findByIdAndDelete(id).select(
      SAFE_CUSTOMER_FIELDS
    );
    return customer
      ? NextResponse.json(
          { message: "Customer successfully deleted.", customer },
          { status: 200 }
        )
      : notFound();
  } catch (error) {
    console.error("Error in DELETE handler:", error);
    return serverError();
  }
}
