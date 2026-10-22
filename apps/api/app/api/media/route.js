import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import MediaAsset from "@/app/models/MediaAsset";
import { getStaff, rankOf } from "@/lib/auth";
import { uploadBuffer } from "@/lib/integrations/media/cloudinary";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function GET(request) {
  try {
    await connectMongo();

    const staff = await getStaff(request);
    if (!staff || rankOf(staff.role) < 1) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
    const folder = searchParams.get("folder") || "";
    const search = searchParams.get("search") || "";

    const filter = {};
    if (folder) filter.folder = folder;
    if (search) {
      filter.$or = [
        { fileName: { $regex: search, $options: "i" } },
        { publicId: { $regex: search, $options: "i" } },
      ];
    }

    const [assets, total] = await Promise.all([
      MediaAsset.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("uploadedBy", "name email")
        .lean(),
      MediaAsset.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      assets,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("GET /api/media error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch media assets" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectMongo();

    const staff = await getStaff(request);
    if (!staff || rankOf(staff.role) < 1) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "general";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No file provided for upload" },
        { status: 400 }
      );
    }

    // MIME type check
    const mimeType = (file.type || "").toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file format: "${mimeType}". Allowed formats: JPEG, PNG, WebP, AVIF, SVG.`,
        },
        { status: 400 }
      );
    }

    // Size check (max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await uploadBuffer(buffer, {
      folder: `memservice/${folder}`,
      resourceType: mimeType === "image/svg+xml" ? "raw" : "image",
    });

    const asset = await MediaAsset.create({
      url: result.secure_url || result.url,
      publicId: result.public_id || "",
      fileName: file.name || "upload",
      mimeType,
      size: result.bytes || file.size,
      width: result.width || null,
      height: result.height || null,
      folder,
      uploadedBy: staff.id || null,
    });

    return NextResponse.json({
      success: true,
      message: "Media uploaded successfully",
      asset,
    });
  } catch (error) {
    console.error("POST /api/media error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload media" },
      { status: 500 }
    );
  }
}
