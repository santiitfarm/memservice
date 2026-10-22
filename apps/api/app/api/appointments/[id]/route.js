import Appointment from "@/app/models/Appointment";
import Doctor from "@/app/models/doctor-model";
import { getStaff, unauthorized } from "@/lib/auth";
import { normalizeBDPhone } from "@/lib/phone";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Patient lookup or Staff view of a single appointment
export async function GET(request, { params }) {
  await connectMongo();

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, message: "Appointment reference or ID is required." }, { status: 400 });
  }

  try {
    const staff = await getStaff(request);
    const { searchParams } = new URL(request.url);
    const queryPhone = searchParams.get("phone")?.trim();

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { referenceCode: id.trim() }] }
      : { referenceCode: id.trim() };

    const appointment = await Appointment.findOne(query)
      .populate({
        path: "doctor",
        model: Doctor,
        select: "name specialty department hospital_name consultation_fee follow_up_fee image doctor_code available_day",
      })
      .lean();

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found." }, { status: 404 });
    }

    // Authorization: Either authenticated staff or patient with matching phone
    if (!staff) {
      if (!queryPhone) {
        return NextResponse.json(
          { success: false, message: "Please provide your phone number for appointment verification." },
          { status: 401 }
        );
      }
      const normalizedQueryPhone = normalizeBDPhone(queryPhone);
      if (normalizedQueryPhone !== appointment.patient?.phone) {
        return NextResponse.json(
          { success: false, message: "Provided phone number does not match this appointment record." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("GET /api/appointments/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Staff updates appointment status, reschedules, or adds staff notes
export async function PUT(request, { params }) {
  await connectMongo();

  const staff = await getStaff(request);
  if (!staff) {
    return unauthorized("Staff access required.");
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, message: "Invalid appointment ID." }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { status, preferredDate, preferredSlot, staffNotes, note = "" } = body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found." }, { status: 404 });
    }

    const updates = {};
    const validStatuses = [
      "requested",
      "confirmed",
      "rescheduled",
      "completed",
      "cancelled",
      "no_show",
    ];

    if (status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, message: `Invalid status: ${status}` },
          { status: 400 }
        );
      }
      appointment.status = status;
    }

    if (preferredDate) {
      const newDate = new Date(preferredDate);
      if (!isNaN(newDate.getTime())) {
        appointment.preferredDate = newDate;
      }
    }

    if (preferredSlot) {
      appointment.preferredSlot = preferredSlot;
    }

    if (staffNotes !== undefined) {
      appointment.staffNotes = staffNotes.trim();
    }

    // Record history
    appointment.history.push({
      status: appointment.status,
      note: note.trim() || `Status updated to ${appointment.status} by ${staff.name || "staff"}`,
      changedBy: staff.name || staff.id || "staff",
      timestamp: new Date(),
    });

    await appointment.save();

    return NextResponse.json({
      success: true,
      message: `Appointment updated successfully.`,
      appointment,
    });
  } catch (error) {
    console.error("PUT /api/appointments/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
