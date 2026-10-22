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
