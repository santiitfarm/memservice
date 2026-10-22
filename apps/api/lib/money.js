/**
 * Central money math helper with strict 2-decimal rounding.
 * Prevents IEEE 754 floating point drift across prices, subtotals, and delivery charges.
 */

/**
 * Rounds a number to exactly 2 decimal places using standard financial half-up rounding.
 * @param {number|string} val
 * @returns {number}
 */
export function round(val) {
  const num = typeof val === "number" ? val : Number(val);
  if (!Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Normalizes any value into a valid non-negative 2-decimal money number.
 * @param {number|string|null|undefined} val
 * @param {boolean} [allowNegative=false]
 * @returns {number}
 */
export function toMoney(val, allowNegative = false) {
  if (val === null || val === undefined || val === "") return 0;
  const num = round(val);
  if (!allowNegative && num < 0) return 0;
  return num;
}

/**
 * Adds two money amounts with 2-decimal precision.
 * @param {number|string} a
 * @param {number|string} b
 * @returns {number}
 */
export function add(a, b) {
  return round(toMoney(a, true) + toMoney(b, true));
}

/**
 * Subtracts b from a with 2-decimal precision.
 * @param {number|string} a
 * @param {number|string} b
 * @param {boolean} [allowNegative=false]
 * @returns {number}
 */
export function sub(a, b, allowNegative = false) {
  const result = round(toMoney(a, true) - toMoney(b, true));
  if (!allowNegative && result < 0) return 0;
  return result;
}

/**
 * Multiplies a money amount by a quantity or factor with 2-decimal precision.
 * @param {number|string} a
 * @param {number|string} b
 * @returns {number}
 */
export function mul(a, b) {
  const qty = Number(b) || 0;
  return round(toMoney(a, true) * qty);
}

/**
 * Sums an array of items with 2-decimal precision.
 * @param {Array<any>} array
 * @param {Function} [selector]
 * @returns {number}
 */
export function sum(array, selector = (x) => x) {
  if (!Array.isArray(array)) return 0;
  const total = array.reduce((acc, item) => acc + toMoney(selector(item), true), 0);
  return round(total);
}

const money = {
  round,
  toMoney,
  add,
  sub,
  mul,
  sum,
};

export default money;
