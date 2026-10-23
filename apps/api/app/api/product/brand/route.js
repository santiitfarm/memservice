import { Brand } from "@/app/models/brand-model";
import Category from "@/app/models/category-model";
import Product from "@/app/models/product-model";
import { cloudinary } from "@/lib/utils";
import connectMongo from "@/services/mongo";
import { revalidateStorefront } from "@/lib/revalidate";
import { NextResponse } from "next/server";

function slugify(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadBrandLogo(file) {
  const fileBuffer = await file.arrayBuffer();
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "brands",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result?.secure_url);
        }
      )
      .end(Buffer.from(fileBuffer));
  });
}

export async function POST(req) {
  try {
    await connectMongo();

    const contentType = req.headers.get("content-type") || "";
    let title = "";
    let category = null;
    let status = "active";
    let order = 0;
    let logoUrl = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      title = formData.get("title") || "";
      category = formData.get("category") || null;
      status = formData.get("status") || "active";
      order = parseInt(formData.get("order") || "0", 10) || 0;

      const file = formData.get("file");
      if (file && typeof file !== "string" && file.size > 0) {
        logoUrl = await uploadBrandLogo(file);
      } else if (formData.get("logo")) {
        logoUrl = formData.get("logo");
      }
    } else {
      const body = await req.json();
      title = body.title || "";
      category = body.category || null;
      status = body.status || "active";
      order = parseInt(body.order || "0", 10) || 0;
      logoUrl = body.logo || "";
    }

    if (!title.trim()) {
      return NextResponse.json({ message: "Brand title is required" }, { status: 400 });
    }

    const slug = slugify(title);

    const brandData = {
      title: title.trim(),
      slug,
      status,
      order,
    };

    if (logoUrl) brandData.logo = logoUrl;
    if (category) brandData.category = category;

    const brand = await Brand.create(brandData);

    await revalidateStorefront({ tag: "cms-home", path: "/" });

    return NextResponse.json(
      { brand, success: true, message: "Successfully created brand" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in brand creation:", error);
    return NextResponse.json(
      {
        message: error.message || "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectMongo();
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");

    const query = {};
    if (category) {
      query.category = category.toLowerCase();
    }

    const brands = await Brand.find(query)
      .sort({ order: 1, createdAt: 1 })
      .populate({
        path: "category",
        model: Category,
        select: "categoryName",
      })
      .lean();

    return NextResponse.json({ success: true, brands }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectMongo();

    const contentType = req.headers.get("content-type") || "";
    let brandId = "";
    let title;
    let category;
    let status;
    let order;
    let logoUrl = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      brandId = formData.get("id") || formData.get("brandId");
      if (formData.has("title")) title = formData.get("title");
      if (formData.has("category")) category = formData.get("category");
      if (formData.has("status")) status = formData.get("status");
      if (formData.has("order")) order = parseInt(formData.get("order"), 10);

      const file = formData.get("file");
      if (file && typeof file !== "string" && file.size > 0) {
        logoUrl = await uploadBrandLogo(file);
      } else if (formData.get("logo")) {
        logoUrl = formData.get("logo");
      }
    } else {
      const body = await req.json();
      brandId = body.id || body.brandId;
      if (body.title !== undefined) title = body.title;
      if (body.category !== undefined) category = body.category;
      if (body.status !== undefined) status = body.status;
      if (body.order !== undefined) order = parseInt(body.order, 10);
      if (body.logo) logoUrl = body.logo;
    }

    if (!brandId) {
      return NextResponse.json({ message: "Brand ID is required" }, { status: 400 });
    }

    const existingBrand = await Brand.findById(brandId);
    if (!existingBrand) {
      return NextResponse.json({ message: "Brand not found" }, { status: 404 });
    }

    const updateObj = {};
    if (title !== undefined && title.trim()) {
      updateObj.title = title.trim();
      updateObj.slug = slugify(title);
    }
    if (category !== undefined) updateObj.category = category || null;
    if (status !== undefined) updateObj.status = status;
    if (order !== undefined && !isNaN(order)) updateObj.order = order;
    if (logoUrl) updateObj.logo = logoUrl;

    const brand = await Brand.findByIdAndUpdate(brandId, { $set: updateObj }, { new: true });

    await revalidateStorefront({ tag: "cms-home", path: "/" });

    return NextResponse.json(
      { success: true, message: "Successfully updated brand", brand },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT request:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectMongo();
    const body = await req.json().catch(() => ({}));
    const brandId = body.brandId || body.id;
    if (!brandId) {
      return NextResponse.json({ message: "Brand ID is required" }, { status: 400 });
    }

    const productCount = await Product.countDocuments({
      brand: brandId,
      status: { $ne: "deleted" },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete brand. ${productCount} products are currently linked to this brand.`,
        },
        { status: 400 }
      );
    }

    const brand = await Brand.findOneAndDelete({ _id: brandId });

    await revalidateStorefront({ tag: "cms-home", path: "/" });

    return NextResponse.json(
      { success: true, message: "Brand deleted successfully", brand },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
