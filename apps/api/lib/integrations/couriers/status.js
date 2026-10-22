/**
 * Standard normalized status enum for all courier delivery providers.
 */
export const COURIER_STATUSES = [
  "pending",
  "picked_up",
  "in_transit",
  "delivered",
  "returned",
  "cancelled",
];

/**
 * Normalizes raw gateway statuses into standard enum:
 * pending | picked_up | in_transit | delivered | returned | cancelled
 *
 * @param {string} raw
 * @returns {"pending" | "picked_up" | "in_transit" | "delivered" | "returned" | "cancelled"}
 */
export function normalizeCourierStatus(raw) {
  if (!raw) return "pending";
  const s = String(raw).trim().toLowerCase().replace(/[-_\s]+/g, " ");

  if (
    s.includes("delivered") ||
    s.includes("successful") ||
    s.includes("complete")
  ) {
    return "delivered";
  }

  if (
    s.includes("return") ||
    s.includes("rto") ||
    s.includes("lost") ||
    s.includes("damage")
  ) {
    return "returned";
  }

  if (s.includes("cancel") || s.includes("reject")) {
    return "cancelled";
  }

  if (
    s.includes("transit") ||
    s.includes("dispatched") ||
    s.includes("out for delivery") ||
    s.includes("on delivery") ||
    s.includes("assigned") ||
    s.includes("hub")
  ) {
    return "in_transit";
  }

  if (
    s.includes("picked") ||
    s.includes("pickup") ||
    s.includes("collected") ||
    s.includes("received")
  ) {
    return "picked_up";
  }

  return "pending";
}

const statusModule = {
  COURIER_STATUSES,
  normalizeCourierStatus,
};

export default statusModule;
