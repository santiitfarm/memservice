/**
 * Normalizes and validates Bangladeshi mobile phone numbers.
 * Converts "+88017...", "88017...", "017..." (with optional spaces/dashes) into 11-digit "01XXXXXXXXX".
 * Returns the 11-digit phone string if valid, or null if invalid.
 *
 * @param {string|number} raw
 * @returns {string|null}
 */
export function normalizeBdPhone(raw) {
  if (raw === undefined || raw === null) return null;
  let digits = String(raw).replace(/\D/g, "");

  // If starts with 8801... (13 digits), strip country code 88
  if (digits.startsWith("8801") && digits.length === 13) {
    digits = digits.slice(2);
  }

  // Valid BD mobile number: starts with 01[3-9] and has exactly 11 digits
  const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;
  if (BD_PHONE_REGEX.test(digits)) {
    return digits;
  }

  return null;
}
