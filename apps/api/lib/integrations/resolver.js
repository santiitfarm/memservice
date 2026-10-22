import connectMongo from "@/services/mongo";
import Integration from "@/app/models/Integration";
import { decryptSecret } from "@/lib/secrets";

// In-memory cache: { [key]: { data: Object, expiresAt: number } }
const cacheStore = new Map();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

/**
 * Invalidates the in-memory cache for a specific integration key or all keys.
 * @param {string} [key]
 */
export function invalidateIntegrationCache(key) {
  if (key) {
    cacheStore.delete(key.toLowerCase());
  } else {
    cacheStore.clear();
  }
}

/**
 * Fallback values from environment variables when DB integration is unconfigured or absent.
 */
function getEnvFallback(key) {
  const k = key.toLowerCase();

  switch (k) {
    case "bkash": {
      const appKey = process.env.BKASH_APP_KEY;
      const appSecret = process.env.BKASH_APP_SECRET;
      const username = process.env.BKASH_USERNAME;
      const password = process.env.BKASH_PASSWORD;
      const baseUrl =
        process.env.BKASH_BASE_URL ||
        "https://tokenized.sandbox.bka.sh/v2.0.0-beta";

      const hasCreds = Boolean(appKey && appSecret && username && password);
      return {
        key: "bkash",
        category: "payment",
        enabled: hasCreds,
        mode: baseUrl.includes("sandbox") ? "sandbox" : "live",
        config: {
          baseUrl,
          displayName: "bKash",
        },
        secrets: {
          appKey: appKey || "",
          appSecret: appSecret || "",
          username: username || "",
          password: password || "",
        },
      };
    }

    case "nagad": {
      const merchantId = process.env.NAGAD_MERCHANT_ID;
      const publicKey = process.env.NAGAD_PUBLIC_KEY;
      const privateKey = process.env.NAGAD_PRIVATE_KEY;
      const baseUrl =
        process.env.NAGAD_BASE_URL ||
        "http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs";

      return {
        key: "nagad",
        category: "payment",
        enabled: Boolean(merchantId && privateKey),
        mode: baseUrl.includes("sandbox") ? "sandbox" : "live",
        config: {
          merchantId: merchantId || "",
          baseUrl,
          displayName: "Nagad",
        },
        secrets: {
          publicKey: publicKey || "",
          privateKey: privateKey || "",
        },
      };
    }

    case "sslcommerz": {
      const storeId = process.env.SSLCOMMERZ_STORE_ID;
      const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
      const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";

      return {
        key: "sslcommerz",
        category: "payment",
        enabled: Boolean(storeId && storePassword),
        mode: isLive ? "live" : "sandbox",
        config: {
          storeId: storeId || "",
          displayName: "Cards / Mobile Banking (SSLCommerz)",
        },
        secrets: {
          storePassword: storePassword || "",
        },
      };
    }

    case "aamarpay": {
      const storeId = process.env.AAMARPAY_STORE_ID;
      const signatureKey = process.env.AAMARPAY_SIGNATURE_KEY;
      const isLive = process.env.AAMARPAY_IS_LIVE === "true";

      return {
        key: "aamarpay",
        category: "payment",
        enabled: Boolean(storeId && signatureKey),
        mode: isLive ? "live" : "sandbox",
        config: {
          storeId: storeId || "",
          displayName: "aamarPay",
        },
        secrets: {
          signatureKey: signatureKey || "",
        },
      };
    }

    case "shurjopay": {
      const username = process.env.SHURJOPAY_USERNAME;
      const password = process.env.SHURJOPAY_PASSWORD;
      const prefix = process.env.SHURJOPAY_PREFIX || "NOK";
      const endpoint =
        process.env.SHURJOPAY_ENDPOINT ||
        "https://sandbox.shurjopayment.com/api";

      return {
        key: "shurjopay",
        category: "payment",
        enabled: Boolean(username && password),
        mode: endpoint.includes("sandbox") ? "sandbox" : "live",
        config: {
          username: username || "",
          prefix,
          endpoint,
          displayName: "ShurjoPay",
        },
        secrets: {
          password: password || "",
        },
      };
    }

    case "cod": {
      return {
        key: "cod",
        category: "payment",
        enabled: true,
        mode: "live",
        config: {
          displayName: "Cash on Delivery",
        },
        secrets: {},
      };
    }

    case "manual_mfs":
    case "manual-mfs": {
      return {
        key: "manual_mfs",
        category: "payment",
        enabled: true,
        mode: "live",
        config: {
          displayName: "Manual Send Money (bKash / Nagad / Rocket)",
          bkashNumber: process.env.MANUAL_MFS_BKASH || "01711655686",
          nagadNumber: process.env.MANUAL_MFS_NAGAD || "01711655686",
          rocketNumber: process.env.MANUAL_MFS_ROCKET || "017116556868",
          instructions:
            "Send money to our merchant/personal number and provide the Transaction ID below.",
        },
        secrets: {},
      };
    }

    case "resend": {
      const apiKey = process.env.RESEND_API_KEY || process.env.RESEND_KEY;
      const from = process.env.EMAIL_FROM || "Mem Service <onboarding@resend.dev>";
      const replyTo = process.env.EMAIL_REPLY_TO || "support@memservice.com";

      return {
        key: "resend",
        category: "email",
        enabled: Boolean(apiKey),
        mode: "live",
        config: {
          from,
          replyTo,
        },
        secrets: {
          apiKey: apiKey || "",
        },
      };
    }

    case "pathao": {
      const clientId = process.env.PATHAO_CLIENT_ID;
      const clientSecret = process.env.PATHAO_CLIENT_SECRET;
      const username = process.env.PATHAO_USERNAME;
      const password = process.env.PATHAO_PASSWORD;
      const storeId = process.env.PATHAO_STORE_ID;
      const baseUrl =
        process.env.PATHAO_BASE_URL ||
        "https://courier-api-sandbox.pathao.net";

      return {
        key: "pathao",
        category: "courier",
        enabled: Boolean(clientId && clientSecret && username && password),
        mode: baseUrl.includes("sandbox") ? "sandbox" : "live",
        config: {
          baseUrl,
          clientId: clientId || "",
          username: username || "",
          storeId: storeId || "",
          displayName: "Pathao Courier",
        },
        secrets: {
          clientSecret: clientSecret || "",
          password: password || "",
        },
      };
    }

    case "steadfast": {
      const apiKey = process.env.STEADFAST_API_KEY;
      const secretKey = process.env.STEADFAST_SECRET_KEY;
      const baseUrl =
        process.env.STEADFAST_BASE_URL ||
        "https://portal.steadfast.com.bd/api/v1";

      return {
        key: "steadfast",
        category: "courier",
        enabled: Boolean(apiKey && secretKey),
        mode: "live",
        config: {
          baseUrl,
          displayName: "Steadfast Courier",
        },
        secrets: {
          apiKey: apiKey || "",
          secretKey: secretKey || "",
        },
      };
    }

    case "redx": {
      const accessToken = process.env.REDX_ACCESS_TOKEN;
      const baseUrl =
        process.env.REDX_BASE_URL ||
        "https://openapi.redx.com.bd/v1.0.0-beta";

      return {
        key: "redx",
        category: "courier",
        enabled: Boolean(accessToken),
        mode: baseUrl.includes("sandbox") ? "sandbox" : "live",
        config: {
          baseUrl,
          displayName: "RedX Delivery",
        },
        secrets: {
          accessToken: accessToken || "",
        },
      };
    }

    case "paperfly": {
      const username = process.env.PAPERFLY_USERNAME;
      const password = process.env.PAPERFLY_PASSWORD;
      const paperflyKey = process.env.PAPERFLY_KEY;
      const baseUrl =
        process.env.PAPERFLY_BASE_URL ||
        "https://api.paperfly.com.bd";

      return {
        key: "paperfly",
        category: "courier",
        enabled: Boolean(username && password && paperflyKey),
        mode: baseUrl.includes("sandbox") ? "sandbox" : "live",
        config: {
          baseUrl,
          username: username || "",
          displayName: "Paperfly Logistics",
        },
        secrets: {
          password: password || "",
          paperflyKey: paperflyKey || "",
        },
      };
    }

    case "ecourier": {
      const apiKey = process.env.ECOURIER_API_KEY;
      const apiSecret = process.env.ECOURIER_API_SECRET;
      const userId = process.env.ECOURIER_USER_ID;
      const baseUrl =
        process.env.ECOURIER_BASE_URL ||
        "https://backoffice.ecourier.com.bd/api";

      return {
        key: "ecourier",
        category: "courier",
        enabled: Boolean(apiKey && apiSecret && userId),
        mode: baseUrl.includes("sandbox") ? "sandbox" : "live",
        config: {
          baseUrl,
          userId: userId || "",
          displayName: "eCourier",
        },
        secrets: {
          apiKey: apiKey || "",
          apiSecret: apiSecret || "",
        },
      };
    }

    case "cloudinary": {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      return {
        key: "cloudinary",
        category: "media",
        enabled: Boolean(cloudName && apiKey && apiSecret),
        mode: "live",
        config: {
          cloudName: cloudName || "",
          displayName: "Cloudinary Media",
        },
        secrets: {
          apiKey: apiKey || "",
          apiSecret: apiSecret || "",
        },
      };
    }

    case "google_oauth":
    case "google-auth":
    case "google": {
      const clientId =
        process.env.AUTH_GOOGLE_ID ||
        process.env.GOOGLE_CLIENT_ID;
      const clientSecret =
        process.env.AUTH_GOOGLE_SECRET ||
        process.env.GOOGLE_CLIENT_SECRET;

      return {
        key: "google_oauth",
        category: "auth",
        enabled: Boolean(clientId),
        mode: "live",
        config: {
          clientId: clientId || "",
          displayName: "Google OAuth",
        },
        secrets: {
          clientSecret: clientSecret || "",
        },
      };
    }

    case "meta_capi":
    case "meta-capi":
    case "meta": {
      const pixelId = process.env.META_PIXEL_ID;
      const accessToken = process.env.META_ACCESS_TOKEN;
      const testEventCode = process.env.META_TEST_EVENT_CODE;

      return {
        key: "meta_capi",
        category: "tracking",
        enabled: Boolean(pixelId && accessToken),
        mode: testEventCode ? "test" : "live",
        config: {
          pixelId: pixelId || "",
          testEventCode: testEventCode || "",
          displayName: "Meta Conversions API (CAPI)",
        },
        secrets: {
          accessToken: accessToken || "",
        },
      };
    }

    default:
      return null;
  }
}

/**
 * Resolves an integration by key:
 * 1. Checks 30-second in-memory cache.
 * 2. Fetches from MongoDB `Integration` collection.
 * 3. Decrypts AES-256-GCM encrypted secrets into plaintext for backend use.
 * 4. Falls back to environment variables if not configured in DB.
 *
 * @param {string} key - e.g. 'bkash', 'nagad', 'sslcommerz', 'resend'
 * @returns {Promise<{
 *   key: string,
 *   category: string,
 *   enabled: boolean,
 *   mode: string,
 *   config: Object,
 *   secrets: Object
 * }|null>}
 */
export async function getIntegration(key) {
  if (!key) return null;
  const cleanKey = key.trim().toLowerCase();

  // 1. Check in-memory cache
  const cached = cacheStore.get(cleanKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // 2. Fetch from MongoDB
  try {
    await connectMongo();
    const doc = await Integration.findOne({ key: cleanKey }).lean();

    if (doc) {
      // Decrypt secrets
      const decryptedSecrets = {};
      if (doc.secrets && typeof doc.secrets === "object") {
        for (const [sKey, cipherObj] of Object.entries(doc.secrets)) {
          decryptedSecrets[sKey] = decryptSecret(cipherObj);
        }
      }

      // Merge with env fallback if DB fields are blank
      const envFallback = getEnvFallback(cleanKey);
      const mergedSecrets = { ...(envFallback?.secrets || {}), ...decryptedSecrets };
      const mergedConfig = { ...(envFallback?.config || {}), ...(doc.config || {}) };

      const resolved = {
        key: doc.key,
        category: doc.category,
        enabled: doc.enabled !== undefined ? doc.enabled : envFallback?.enabled ?? false,
        mode: doc.mode || envFallback?.mode || "sandbox",
        config: mergedConfig,
        secrets: mergedSecrets,
      };

      cacheStore.set(cleanKey, {
        data: resolved,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return resolved;
    }
  } catch (err) {
    console.error(`getIntegration('${cleanKey}') DB error:`, err.message);
  }

  // 3. Fallback to environment variables
  const envData = getEnvFallback(cleanKey);
  if (envData) {
    cacheStore.set(cleanKey, {
      data: envData,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return envData;
  }

  return null;
}

export default getIntegration;
