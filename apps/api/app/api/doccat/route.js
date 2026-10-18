import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/mongo";
import { doccategoriesModel } from "@/app/models/doccategories-model";

// Ensure database connection

// GET: Fetch all medical categories
export async function GET() {
  await dbConnect();
  try {
    const categories = await doccategoriesModel.find({});
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching categories", error },
      { status: 500 }
    );
  }
}

// POST: Create a new medical category
export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { id, categoryName, specialties } = body;

    // Validation (optional but recommended)
    if (!id || !categoryName || !specialties) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const newCategory = new doccategoriesModel({
      id,
      categoryName,
      specialties,
    });
    await newCategory.save();
    return NextResponse.json(
      { message: "Category created successfully", newCategory },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating category", error },
      { status: 500 }
    );
  }
}

// PUT: Update a medical category by ID
export async function PUT(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const updates = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "ID is required for updating" },
        { status: 400 }
      );
    }

    const updatedCategory = await doccategoriesModel.findOneAndUpdate(
      { id: parseInt(id) },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Category updated successfully", updatedCategory },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating category", error },
      { status: 500 }
    );
  }
}
