// app/api/doctors/route.js
import Doctor from "@/app/models/doctor-model";
import { dbConnect } from "@/utils/mongo";
import { NextResponse } from "next/server";

// GET: Retrieve all doctors
export async function GET() {
  await dbConnect();
  try {
    const doctors = await Doctor.find({});
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
