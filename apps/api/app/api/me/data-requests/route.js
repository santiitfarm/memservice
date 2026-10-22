import { CustomerProfile } from "@/app/models/customer-profile-model";
import DataRequest from "@/app/models/DataRequest";
import { getCustomer, getStaff, unauthorized } from "@/lib/auth";
import connectMongo from "@/services/mongo";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectMongo();

  const staff = await getStaff(request);
  const customer = await getCustomer(request);

  if (!staff && !customer) {
    return unauthorized("Authentication required");
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  const query = {};
  if (customer && !staff) {
    query.customer = customer.id;
  }
  if (status) query.status = status;
  if (type) query.type = type;

  try {
    const [requests, total] = await Promise.all([
      DataRequest.find(query)
        .populate({
          path: "customer",
          model: CustomerProfile,
          select: "customer_name email phone_number",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DataRequest.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      requests,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("GET /api/me/data-requests error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await connectMongo();

  const customer = await getCustomer(request);
  if (!customer) {
    return unauthorized("Customer authentication required");
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { type, notes } = body;

    if (!type || !["export", "delete"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Valid request type is required ("export" or "delete")',
        },
        { status: 400 }
      );
    }

    // Check if there's already a pending request of this type
    const existingPending = await DataRequest.findOne({
      customer: customer.id,
      type,
      status: { $in: ["pending", "processing"] },
    });

    if (existingPending) {
      return NextResponse.json(
        {
          success: false,
          message: `You already have an active ${type} request in progress.`,
          requestId: existingPending._id,
        },
        { status: 409 }
      );
    }

    const doc = await DataRequest.create({
      customer: customer.id,
      type,
      status: "pending",
      notes: notes || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: `Your data ${type} request has been submitted. Our compliance team will review and process it.`,
        request: doc,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/me/data-requests error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
