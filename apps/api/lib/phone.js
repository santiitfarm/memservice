/**
 * Bangladesh phone number validation and normalization utilities.
 */

// Regex for valid Bangladesh mobile operators: 013, 014, 015, 016, 017, 018, 019
const BD_PHONE_REGEX = /^(?:\+?880|880|0)?1[3-9]\d{8}$/;

/**
 * Validates whether an input string is a valid Bangladesh mobile number.
 * Accepts formats: +8801XXXXXXXXX, 8801XXXXXXXXX, 01XXXXXXXXX.
 * @param {string|number} phone
 * @returns {boolean}
 */
export function isValidBDPhone(phone) {
  if (!phone) return false;
  const cleaned = String(phone).trim().replace(/[\s-]/g, "");
  return BD_PHONE_REGEX.test(cleaned);
}

/**
 * Normalizes a Bangladesh phone number to standard local 11-digit format: 01XXXXXXXXX.
 * @param {string|number} phone
 * @returns {string|null}
 */
export function normalizeBDPhone(phone) {
  if (!phone) return null;
  const cleaned = String(phone).trim().replace(/[\s-]/g, "");
  if (!BD_PHONE_REGEX.test(cleaned)) return null;

  // Extract last 10 digits and prefix with 0
  const digits = cleaned.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  return `0${last10}`;
}

/**
 * Normalizes a Bangladesh phone number to E.164 international format: +8801XXXXXXXXX.
 * @param {string|number} phone
 * @returns {string|null}
 */
export function toE164BDPhone(phone) {
  const local = normalizeBDPhone(phone);
  if (!local) return null;
  return `+88${local}`;
}

export const normalizeBdPhone = normalizeBDPhone;
export const isValidBdPhone = isValidBDPhone;
export const toE164BdPhone = toE164BDPhone;

const phoneUtils = {
  isValidBDPhone,
  isValidBdPhone,
  normalizeBDPhone,
  normalizeBdPhone,
  toE164BDPhone,
  toE164BdPhone,
};

export default phoneUtils;
