// app/api/doctors/route.js
import Doctor from "@/app/models/doctor-model";
import { dbConnect } from "@/utils/mongo";
import { NextResponse } from "next/server";

import { escapeRegex } from "@/lib/slug";

// GET: Retrieve all doctors with optional department & search filtering
export async function GET(req) {
  await dbConnect();
  try {
    const url = new URL(req.url);
    const department = url.searchParams.get("department");
    const search = url.searchParams.get("search") || url.searchParams.get("q");

    const query = {};
    if (department && department.toLowerCase() !== "all") {
      query.department = { $regex: new RegExp(`^${escapeRegex(department.trim())}$`, "i") };
    }
    if (search && search.trim()) {
      const esc = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: esc, $options: "i" } },
        { specialty: { $regex: esc, $options: "i" } },
        { hospital_name: { $regex: esc, $options: "i" } },
        { degree: { $regex: esc, $options: "i" } },
        { department: { $regex: esc, $options: "i" } },
      ];
    }

    const doctors = await Doctor.find(query).sort({ createdAt: -1 });
    return NextResponse.json(doctors, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch doctors." },
      { status: 500 }
    );
  }
}

// POST: Add a new doctor
export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const newDoctor = await Doctor.create(body);
    return NextResponse.json(newDoctor, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create doctor." },
      { status: 500 }
    );
  }
}

// PUT: Update a doctor by ID
export async function PUT(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const updatedDoctor = await Doctor.findByIdAndUpdate(body._id, body, {
      new: true,
    });
    if (!updatedDoctor) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }
    return NextResponse.json(updatedDoctor, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update doctor." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a doctor by ID
export async function DELETE(req) {
  await connectToDB();
  try {
    const { id } = req.query;
    const deletedDoctor = await Doctor.findByIdAndDelete(id);
    if (!deletedDoctor) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Doctor deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete doctor." },
      { status: 500 }
    );
  }
}
