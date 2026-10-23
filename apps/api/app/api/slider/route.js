import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import { Slider } from "@/app/models/slider-model";
import Product from "@/app/models/product-model";
import { v2 as cloudinary } from "cloudinary";
import { revalidateStorefront } from "@/lib/revalidate";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "sliders",
          allowed_formats: ["jpg", "png", "jpeg", "webp", "avif"],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      )
      .end(buffer);
  });
}

// GET all sliders
export async function GET() {
  try {
    await connectMongo();
    const sliders = await Slider.find()
      .sort({ order: 1, createdAt: -1 })
      .populate({
        path: "productId",
        model: Product,
        select: "name model slug",
      })
      .lean();

    return NextResponse.json(
      {
        success: true,
        slider: sliders,
        sliders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/slider error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create slider
export async function POST(req) {
  try {
    await connectMongo();

    const contentType = req.headers.get("content-type") || "";
    let title = "Banner";
    let link = "/shop";
    let order = 0;
    let status = "active";
    let productId = null;
    let description = "";
    let imageUrl = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      title = formData.get("title") || "Banner";
      link = formData.get("link") || "/shop";
      order = parseInt(formData.get("order") || "0", 10) || 0;
      status = formData.get("status") || "active";
      description = formData.get("description") || "";
      productId = formData.get("productId") || null;

      const file = formData.get("file");
      if (file && typeof file !== "string" && file.size > 0) {
        imageUrl = await uploadToCloudinary(file);
      } else if (formData.get("image")) {
        imageUrl = formData.get("image");
      }
    } else {
      const body = await req.json();
      title = body.title || "Banner";
      link = body.link || "/shop";
      order = parseInt(body.order || "0", 10) || 0;
      status = body.status || "active";
      description = body.description || "";
      productId = body.productId || null;
      imageUrl = body.image || "";
    }

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: "Banner image is required" },
        { status: 400 }
      );
    }

    const sliderObj = {
      image: imageUrl,
      title,
      link: link.trim(),
      order,
      status,
      description,
      placement: "home_main",
    };

    if (productId) {
      sliderObj.productId = productId;
    }

    const slider = await Slider.create(sliderObj);

    // Revalidate storefront cache immediately
    await Promise.all([
      revalidateStorefront({ tag: "cms-sliders", path: "/" }),
      revalidateStorefront({ tag: "cms-home", path: "/" }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully created slider",
        slider,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/slider error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create slider" },
      { status: 500 }
    );
  }
}

// PUT update slider
export async function PUT(req) {
  try {
    await connectMongo();

    const contentType = req.headers.get("content-type") || "";
    let sliderId = "";
    let title;
    let link;
    let order;
    let status;
    let imageUrl = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      sliderId = formData.get("id") || formData.get("sliderId");
      if (formData.has("title")) title = formData.get("title");
      if (formData.has("link")) link = formData.get("link");
      if (formData.has("order")) order = parseInt(formData.get("order"), 10);
      if (formData.has("status")) status = formData.get("status");

      const file = formData.get("file");
      if (file && typeof file !== "string" && file.size > 0) {
        imageUrl = await uploadToCloudinary(file);
      } else if (formData.get("image")) {
        imageUrl = formData.get("image");
      }
    } else {
      const body = await req.json();
      sliderId = body.id || body.sliderId;
      if (body.title !== undefined) title = body.title;
      if (body.link !== undefined) link = body.link;
      if (body.order !== undefined) order = parseInt(body.order, 10);
      if (body.status !== undefined) status = body.status;
      if (body.image) imageUrl = body.image;
    }

    if (!sliderId) {
      return NextResponse.json(
        { success: false, message: "Slider ID is required" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (link !== undefined) updateData.link = link.trim();
    if (order !== undefined && !isNaN(order)) updateData.order = order;
    if (status !== undefined) updateData.status = status;
    if (imageUrl) updateData.image = imageUrl;

    const updatedSlider = await Slider.findByIdAndUpdate(
      sliderId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedSlider) {
      return NextResponse.json(
        { success: false, message: "Slider not found" },
        { status: 404 }
      );
    }

    // Revalidate storefront cache immediately
    await Promise.all([
      revalidateStorefront({ tag: "cms-sliders", path: "/" }),
      revalidateStorefront({ tag: "cms-home", path: "/" }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully updated slider",
        slider: updatedSlider,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/slider error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update slider" },
      { status: 500 }
    );
  }
}

// DELETE slider
export async function DELETE(req) {
  try {
    await connectMongo();

    let sliderId = "";
    try {
      const body = await req.json();
      sliderId = body.sliderId || body.id;
    } catch (e) {
      const { searchParams } = new URL(req.url);
      sliderId = searchParams.get("sliderId") || searchParams.get("id");
    }

    if (!sliderId) {
      return NextResponse.json(
        { success: false, message: "Slider ID is required" },
        { status: 400 }
      );
    }

    const slider = await Slider.findByIdAndDelete(sliderId);

    // Revalidate storefront cache immediately
    await Promise.all([
      revalidateStorefront({ tag: "cms-sliders", path: "/" }),
      revalidateStorefront({ tag: "cms-home", path: "/" }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully deleted slider",
        slider,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/slider error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete slider" },
      { status: 500 }
    );
  }
}
