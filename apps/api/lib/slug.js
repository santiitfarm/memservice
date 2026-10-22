/**
 * Slug generator and transliteration helper.
 * Generates clean, lowercase, URL-safe slugs with Bengali transliteration fallback.
 */

const BENGALI_DIGITS = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

/**
 * Converts any string into a clean lowercase URL-safe slug.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  if (!text || typeof text !== "string") return "";

  let cleaned = text.trim();

  // Replace Bengali digits with English digits
  cleaned = cleaned.replace(/[০-৯]/g, (d) => BENGALI_DIGITS[d] || d);

  // Normalize unicode accents
  cleaned = cleaned.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Convert to lowercase
  cleaned = cleaned.toLowerCase();

  // Replace symbols like +, &, %, @ with text or spaces
  cleaned = cleaned
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/@/g, " at ")
    .replace(/%/g, " percent ");

  // Replace any character that is not alphanumeric (Latin or Bengali) with a hyphen
  // Keeps a-z, 0-9, and Bengali script \u0980-\u09FF
  cleaned = cleaned.replace(/[^a-z0-9\u0980-\u09FF\s-]/g, "");

  // Replace whitespace and consecutive hyphens with a single hyphen
  cleaned = cleaned.replace(/[\s_-]+/g, "-");

  // Trim leading and trailing hyphens
  cleaned = cleaned.replace(/^-+|-+$/g, "");

  return cleaned;
}

/**
 * Escapes regex special characters to prevent ReDoS attacks.
 * @param {string} str
 * @returns {string}
 */
export function escapeRegex(str) {
  return String(str || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Generates a guaranteed unique slug for a product model.
 * If the base slug already exists on a different document, appends -2, -3, etc.
 *
 * @param {import("mongoose").Model} Model
 * @param {string} name
 * @param {string} [currentDocId]
 * @returns {Promise<string>}
 */
export async function generateUniqueSlug(Model, name, currentDocId = null) {
  let baseSlug = slugify(name);
  if (!baseSlug) {
    baseSlug = `product-${Math.random().toString(36).slice(2, 8)}`;
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (currentDocId) {
      query._id = { $ne: currentDocId };
    }
    const exists = await Model.findOne(query).select("_id").lean();
    if (!exists) {
      return slug;
    }
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}

const slugUtils = {
  slugify,
  escapeRegex,
  generateUniqueSlug,
};

export default slugUtils;
