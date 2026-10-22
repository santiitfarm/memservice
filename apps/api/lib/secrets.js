import crypto from "crypto";

function getEncryptionKey() {
  const rawKey =
    process.env.SETTINGS_ENCRYPTION_KEY ||
    process.env.AUTH_SECRET ||
    "memservice-default-dev-secret-key-32bytes-fallback";
  return crypto.createHash("sha256").update(rawKey).digest();
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * @param {string} text - Raw secret string
 * @returns {{ iv: string, tag: string, data: string }|null}
 */
export function encryptSecret(text) {
  if (text == null || text === "") return null;
  const stringValue = String(text);

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(stringValue, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    data: encrypted,
  };
}

/**
 * Decrypts an AES-256-GCM encrypted secret object.
 * @param {{ iv: string, tag: string, data: string }} cipherObj
 * @returns {string} Plaintext secret
 */
export function decryptSecret(cipherObj) {
  if (!cipherObj || !cipherObj.iv || !cipherObj.tag || !cipherObj.data) {
    return "";
  }

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(cipherObj.iv, "hex");
    const tag = Buffer.from(cipherObj.tag, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(cipherObj.data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("decryptSecret error:", err.message);
    return "";
  }
}

/**
 * Masks a secret string showing only the last 4 characters.
 * @param {string} text
 * @returns {string} e.g. '****89ab'
 */
export function maskSecret(text) {
  if (!text || typeof text !== "string") return "";
  if (text.length <= 4) return "****";
  return `****${text.slice(-4)}`;
}

/**
 * Transforms an integration's encrypted secrets map into a safe masked representation for admin UI.
 * @param {Object} secretsMap - Stored secrets map
 * @returns {Object} Masked metadata map
 */
export function maskSecretsMap(secretsMap = {}) {
  const result = {};
  if (!secretsMap || typeof secretsMap !== "object") return result;

  for (const [key, cipherObj] of Object.entries(secretsMap)) {
    if (!cipherObj || !cipherObj.data) {
      result[key] = { masked: "", hasValue: false };
      continue;
    }

    const decrypted = decryptSecret(cipherObj);
    result[key] = {
      masked: maskSecret(decrypted),
      hasValue: Boolean(decrypted),
    };
  }

  return result;
}

const secretsHelper = {
  encryptSecret,
  decryptSecret,
  maskSecret,
  maskSecretsMap,
};

export default secretsHelper;

