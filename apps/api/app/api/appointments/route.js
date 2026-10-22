import Appointment from "@/app/models/Appointment";
import Doctor from "@/app/models/doctor-model";
import { getStaff, unauthorized } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";
import { isValidBDPhone, normalizeBDPhone } from "@/lib/phone";
import { rateLimit } from "@/lib/rateLimit";
import connectMongo from "@/services/mongo";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function isDoctorAvailableOnDay(availableDayStr, date) {
  if (!availableDayStr || typeof availableDayStr !== "string") return true;
  const str = availableDayStr.toLowerCase().trim();
  if (str.includes("all") || str.includes("every") || str.includes("daily") || str === "") {
    return true;
  }

  const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const dayNames = [
    { short: "sun", full: "sunday", index: 0 },
    { short: "mon", full: "monday", index: 1 },
    { short: "tue", full: "tuesday", index: 2 },
    { short: "wed", full: "wednesday", index: 3 },
    { short: "thu", full: "thursday", index: 4 },
    { short: "fri", full: "friday", index: 5 },
    { short: "sat", full: "saturday", index: 6 },
  ];

  const current = dayNames[dayIndex];

  // Direct match on short or full name
  if (str.includes(current.short) || str.includes(current.full)) {
    return true;
  }

  // Handle range like "sat - thu" or "sat-thu"
  if (str.includes("-") || str.includes("to")) {
    const parts = str.split(/[-–—]|to/).map((s) => s.trim().slice(0, 3));
    if (parts.length === 2) {
      const startIdx = dayNames.findIndex((d) => d.short === parts[0]);
      const endIdx = dayNames.findIndex((d) => d.short === parts[1]);
      if (startIdx !== -1 && endIdx !== -1) {
        let cur = startIdx;
        while (true) {
          if (cur === dayIndex) {
            return true;
          }
          if (cur === endIdx) break;
          cur = (cur + 1) % 7;
        }
      }
    }
  }

  return false;
}

// Public endpoint: Patients book a doctor appointment
export async function POST(request) {
  await connectMongo();

  const limited = await rateLimit(request, "appointments", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    const {
      doctorId,
      doctor: rawDoctor,
      patient = {},
      preferredDate,
      preferredSlot = "morning",
      notes = "",
      source = "storefront",
    } = body;

    const docId = doctorId || rawDoctor;
    if (!docId || !mongoose.Types.ObjectId.isValid(docId)) {
      return NextResponse.json(
        { success: false, message: "A valid Doctor ID is required." },
        { status: 400 }
      );
    }

    if (!patient.name || typeof patient.name !== "string" || !patient.name.trim()) {
      return NextResponse.json(
        { success: false, message: "Patient name is required." },
        { status: 400 }
      );
    }

    if (!patient.phone || !isValidBDPhone(patient.phone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide a valid Bangladesh mobile number (e.g. 017XXXXXXXX).",
        },
        { status: 400 }
      );
    }
    const normalizedPhone = normalizeBDPhone(patient.phone);

    // Verify preferred date is not in the past
    if (!preferredDate) {
      return NextResponse.json(
        { success: false, message: "Preferred appointment date is required." },
        { status: 400 }
      );
    }
    const appDate = new Date(preferredDate);
    if (isNaN(appDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid date format for appointment." },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(appDate);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) {
      return NextResponse.json(
        { success: false, message: "Appointment date cannot be in the past." },
        { status: 400 }
      );
    }

    // Verify doctor exists and is active
    const doctorRecord = await Doctor.findById(docId).lean();
    if (!doctorRecord || doctorRecord.status === "inactive") {
      return NextResponse.json(
        { success: false, message: "The selected doctor is currently unavailable." },
        { status: 404 }
      );
    }

    // Check doctor day-of-week availability
    if (
      doctorRecord.available_day &&
      !isDoctorAvailableOnDay(doctorRecord.available_day, appDate)
    ) {
      const requestedDay = DAYS_OF_WEEK[appDate.getDay()];
      return NextResponse.json(
        {
          success: false,
          message: `Dr. ${doctorRecord.name} is available on (${doctorRecord.available_day}). The requested date is a ${requestedDay.toUpperCase()}.`,
        },
        { status: 400 }
      );
    }

    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `APT-${datePart}-${randPart}`;

    const appointment = await Appointment.create({
      doctor: doctorRecord._id,
      patient: {
        name: patient.name.trim(),
        phone: normalizedPhone,
        age: patient.age ? parseInt(patient.age, 10) : undefined,
        gender: ["male", "female", "other"].includes(patient.gender?.toLowerCase())
          ? patient.gender.toLowerCase()
          : undefined,
        email: patient.email ? String(patient.email).trim().toLowerCase() : undefined,
      },
      preferredDate: appDate,
      preferredSlot,
      referenceCode,
      notes: notes ? notes.trim() : "",
      status: "requested",
      feeSnapshot: {
        consultation: Number(doctorRecord.consultation_fee) || 0,
        followUp: Number(doctorRecord.follow_up_fee) || 0,
      },
      source,
      history: [
        {
          status: "requested",
          note: "Appointment request submitted by patient.",
          changedBy: "patient",
          timestamp: new Date(),
        },
      ],
    });

    // Send confirmation email asynchronously (never throws)
    if (patient.email) {
      sendMail({
        to: patient.email,
        subject: `Appointment Requested - Dr. ${doctorRecord.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2>Appointment Request Received</h2>
            <p>Dear ${patient.name},</p>
            <p>Your appointment request with <strong>Dr. ${doctorRecord.name}</strong> (${doctorRecord.specialty || doctorRecord.department}) has been received.</p>
            <ul>
              <li><strong>Date:</strong> ${appDate.toDateString()}</li>
              <li><strong>Time Slot:</strong> ${preferredSlot}</li>
              <li><strong>Consultation Fee:</strong> ৳${doctorRecord.consultation_fee || 0}</li>
              <li><strong>Hospital/Clinic:</strong> ${doctorRecord.hospital_name || "Online / Clinic"}</li>
            </ul>
            <p>Our team will contact you at <strong>${normalizedPhone}</strong> to confirm the exact time.</p>
            <p>Thank you for choosing Mem Service Healthcare.</p>
          </div>
        `,
        text: `Dear ${patient.name}, your appointment request with Dr. ${doctorRecord.name} on ${appDate.toDateString()} has been received. Our team will contact you shortly.`,
      }).catch((err) => console.error("Appointment email notification error:", err.message));
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your appointment request has been submitted successfully.",
        appointment,
        referenceCode: appointment.referenceCode || String(appointment._id),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/appointments error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Staff endpoint: List and filter appointments
export async function GET(request) {
  await connectMongo();

  const staff = await getStaff(request);
  if (!staff) {
    return unauthorized("Staff access required.");
  }

  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctor");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit"), 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
      filter.doctor = doctorId;
    }
    if (status && status !== "all") {
      filter.status = status;
    }

    if (from || to) {
      filter.preferredDate = {};
      if (from) filter.preferredDate.$gte = new Date(from);
      if (to) filter.preferredDate.$lte = new Date(to);
    }

    if (search) {
      filter.$or = [
        { "patient.name": { $regex: search, $options: "i" } },
        { "patient.phone": { $regex: search, $options: "i" } },
        { "patient.email": { $regex: search, $options: "i" } },
      ];
    }

    const [total, appointments] = await Promise.all([
      Appointment.countDocuments(filter),
      Appointment.find(filter)
        .sort({ preferredDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "doctor",
          model: Doctor,
          select: "name specialty department hospital_name consultation_fee image doctor_code",
        })
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      appointments,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("GET /api/appointments staff error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
