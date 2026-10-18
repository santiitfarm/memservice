import { getCustomer, getStaff, forbidden, unauthorized } from "@/lib/auth";

// Never expose credentials or reset tokens to API consumers.
export const SAFE_CUSTOMER_FIELDS =
  "-password -passwordResetToken -passwordResetExpires";

export const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const MIN_PASSWORD_LENGTH = 6;

/**
 * Resolves who is calling and whether they may act on `customerId`.
 * Staff may act on any customer; a customer only on their own profile.
 * Returns `{ staff }`, `{ customer }` or `{ error: NextResponse }`.
 */
export async function authorizeCustomerAccess(request, customerId) {
  const staff = await getStaff(request);
  if (staff) return { staff };
  const customer = await getCustomer(request);
  if (!customer) return { error: unauthorized() };
  if (customerId && String(customerId) !== String(customer.id)) {
    return { error: forbidden() };
  }
  return { customer };
}
