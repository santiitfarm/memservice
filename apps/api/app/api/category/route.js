import Category from "@/app/models/category-model";
import Product from "@/app/models/product-model";
import { cloudinary } from "@/lib/utils";
import connectMongo from "@/services/mongo";
import { dbConnect } from "@/utils/mongo";
import { generateUniqueSlug } from "@/lib/slug";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();
    const formData = await req.formData();
    const categoryName = formData.get("title") || formData.get("categoryName");
    const categoryNameBn = formData.get("categoryNameBn") || "";
    const description = formData.get("description") || "";
    const featured = formData.get("featured") === "true";
    const status = formData.get("status") || "active";
    const order = Number(formData.get("order")) || 0;
    const file = formData.get("file");

    if (!categoryName) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    let secure_url = "";
    if (file) {
      if (typeof file === "string") {
        secure_url = file;
      } else {
        const fileBuffer = await file.arrayBuffer();
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "auto",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(Buffer.from(fileBuffer));
        });
        secure_url = uploadResult?.secure_url || "";
      }
    }

    const slug = await generateUniqueSlug(Category, categoryName);

    const categoryObj = {
      categoryImg: secure_url,
      categoryName,
      categoryNameBn,
      description,
      slug,
      featured,
      status,
      order,
    };

    const category = await Category.create(categoryObj);

    return NextResponse.json(
      { category, message: "Successfully created category" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST category request:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const categoryName = formData.get("title") || formData.get("categoryName");
    const categoryId = formData.get("id") || formData.get("_id");
    const categoryNameBn = formData.get("categoryNameBn") || "";
    const description = formData.get("description") || "";
    const featured = formData.get("featured") === "true";
    const status = formData.get("status") || "active";
    const order = Number(formData.get("order")) || 0;
    const file = formData.get("file");

    if (!categoryName) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { message: "Category ID is required" },
        { status: 400 }
      );
    }

    let secure_url = "";
    if (file && typeof file !== "string") {
      const fileBuffer = await file.arrayBuffer();
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(Buffer.from(fileBuffer));
      });
      secure_url = uploadResult?.secure_url;
      if (!secure_url) {
        return NextResponse.json(
          { message: "Failed to upload image to Cloudinary" },
          { status: 400 }
        );
      }
    } else if (typeof file === "string") {
      secure_url = file;
    }

    const categoryObj = {
      categoryName,
      categoryNameBn,
      description,
      featured,
      status,
      order,
    };
    if (secure_url) {
      categoryObj.categoryImg = secure_url;
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      categoryObj,
      { new: true }
    );

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Successfully updated category", category },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT category request:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  await connectMongo();
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const categoryId = body.categoryId || body.id;

    if (!categoryId) {
      return NextResponse.json(
        { message: "Category ID is required" },
        { status: 400 }
      );
    }

    const productCount = await Product.countDocuments({
      category: categoryId,
      status: { $ne: "deleted" },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete category. ${productCount} products are currently linked to this category.`,
        },
        { status: 400 }
      );
    }

    const category = await Category.findOneAndDelete({ _id: categoryId });
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Category deleted successfully", category },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE category request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
