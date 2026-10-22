import DataRequest from "@/app/models/DataRequest";
import { getStaff, unauthorized } from "@/lib/auth";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  await connectMongo();
  const { id } = await params;

  const staff = await getStaff(request);
  if (!staff) {
    return unauthorized("Staff access required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid request ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { status, downloadUrl, notes } = body;

    const dataReq = await DataRequest.findById(id);
    if (!dataReq) {
      return NextResponse.json(
        { success: false, message: "Data request not found" },
        { status: 404 }
      );
    }

    if (status) {
      const validStatuses = ["pending", "processing", "completed", "rejected"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: `Status must be one of: ${validStatuses.join(", ")}`,
          },
          { status: 400 }
        );
      }
      dataReq.status = status;
    }

    if (downloadUrl !== undefined) dataReq.downloadUrl = downloadUrl;
    if (notes !== undefined) dataReq.notes = notes;

    dataReq.processedBy = staff.id;
    dataReq.processedAt = new Date();

    await dataReq.save();

    return NextResponse.json({
      success: true,
      message: `Data request marked as ${dataReq.status}`,
      request: dataReq,
    });
  } catch (error) {
    console.error("PUT /api/me/data-requests/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
