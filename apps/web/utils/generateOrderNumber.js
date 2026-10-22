/**
 * Deprecated: Client-side order number generation has been removed.
 * All order numbers are generated atomically by the server (apps/api/app/models/Counter.js)
 * in the format MS-YYMMDD-######.
 */
export function generateOrderNumber() {
  return "";
}

export default generateOrderNumber;
