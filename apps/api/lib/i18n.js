/**
 * Bilingual / i18n localization helper for Mem Service (English & Bangla).
 * Provides graceful fallback to English when Bangla content is missing.
 */

/**
 * Extracts requested language ('en' | 'bn') from request query param or Accept-Language header.
 * @param {Request} request
 * @returns {'en' | 'bn'}
 */
export function getLocale(request) {
  if (!request) return "en";

  try {
    const url = new URL(request.url);
    const langParam = url.searchParams.get("lang")?.toLowerCase();
    if (langParam === "bn" || langParam === "bangla") return "bn";
    if (langParam === "en" || langParam === "english") return "en";

    const xLocale = request.headers.get("x-locale")?.toLowerCase();
    if (xLocale === "bn" || xLocale === "bangla") return "bn";
    if (xLocale === "en" || xLocale === "english") return "en";

    const acceptLang = request.headers.get("accept-language") || "";
    if (acceptLang.includes("bn")) return "bn";
  } catch {
    // fallback
  }

  return "en";
}

/**
 * Returns localized field value with graceful English fallback.
 *
 * @param {Object} doc - Raw or lean MongoDB document
 * @param {string} field - English field name (e.g. 'title', 'categoryName')
 * @param {string} [bnField] - Bangla field name override (e.g. 'titleBn', 'categoryNameBn')
 * @param {'en' | 'bn'} [lang='en']
 * @returns {any}
 */
export function resolveLocalized(doc, field, bnField = null, lang = "en") {
  if (!doc) return "";

  const enValue = doc[field];
  if (lang !== "bn") {
    return enValue;
  }

  const candidateBnKey = bnField || `${field}Bn` || `${field}Bangla`;
  const bnValue =
    doc[candidateBnKey] ||
    doc[`${field}Bangla`] ||
    doc[`${field}Bn`] ||
    doc[`${field}_bn`];

  // Return Bangla if present and non-empty, otherwise graceful fallback to English
  if (bnValue && typeof bnValue === "string" && bnValue.trim()) {
    return bnValue;
  }
  if (bnValue !== undefined && bnValue !== null && typeof bnValue !== "string") {
    return bnValue;
  }

  return enValue;
}

/**
 * Creates a localized projection of an object with an i18n helper property.
 *
 * @param {Object} doc
 * @param {Array<string | { en: string, bn: string }>} fields
 * @param {'en' | 'bn'} lang
 * @returns {Object}
 */
export function localizeDocument(doc, fields = [], lang = "en") {
  if (!doc || typeof doc !== "object") return doc;

  const result = Array.isArray(doc) ? [...doc] : { ...doc };

  for (const item of fields) {
    const enKey = typeof item === "string" ? item : item.en;
    const bnKey = typeof item === "string" ? `${enKey}Bn` : item.bn;

    const resolved = resolveLocalized(doc, enKey, bnKey, lang);
    result[enKey] = resolved;

    // Attach dual-language object
    if (!result._i18n) result._i18n = {};
    result._i18n[enKey] = {
      en: doc[enKey] || "",
      bn: doc[bnKey] || doc[`${enKey}Bangla`] || doc[enKey] || "",
    };
  }

  return result;
}

const i18nUtils = {
  getLocale,
  resolveLocalized,
  localizeDocument,
};

export default i18nUtils;
