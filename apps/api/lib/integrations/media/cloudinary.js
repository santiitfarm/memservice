import { v2 as cloudinary } from "cloudinary";
import { getIntegration } from "../resolver.js";

const FETCH_TIMEOUT_MS = 15000;

export const meta = {
  key: "cloudinary",
  name: "Cloudinary",
  category: "media",
  type: "storage",
  logo: "/assets/logo/cloudinary.png",
};

async function configureCloudinary() {
  const integration = await getIntegration("cloudinary");
  const cloudName =
    integration?.config?.cloudName ||
    process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey =
    integration?.secrets?.apiKey ||
    process.env.CLOUDINARY_API_KEY;
  const apiSecret =
    integration?.secrets?.apiSecret ||
    process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials missing: cloudName, apiKey, and apiSecret are required");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function uploadBuffer(buffer, options = {}) {
  const cld = await configureCloudinary();
  const folder = options.folder || "memservice";

  return new Promise((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        folder,
        resource_type: options.resourceType || "auto",
        public_id: options.publicId,
        overwrite: options.overwrite ?? true,
      },
      (error, result) => {
        if (error) {
          reject(new Error(error.message || "Failed to upload to Cloudinary"));
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Pings Cloudinary API to test connectivity and credential validity.
 */
export async function test() {
  try {
    const cld = await configureCloudinary();
    const result = await Promise.race([
      cld.api.ping(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Cloudinary ping timed out")), FETCH_TIMEOUT_MS)
      ),
    ]);

    if (result && result.status === "ok") {
      return {
        ok: true,
        message: "Cloudinary API credentials verified successfully",
      };
    }
    return {
      ok: false,
      error: `Cloudinary ping returned status: ${result?.status || "unknown"}`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message,
    };
  }
}

const cloudinaryAdapter = {
  meta,
  uploadBuffer,
  test,
  configureCloudinary,
};

export default cloudinaryAdapter;
