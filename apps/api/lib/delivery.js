import connectMongo from "../services/mongo.js";
import DeliveryZone from "../app/models/DeliveryZone.js";

/**
 * Single source of truth for delivery pricing and qualification.
 *
 * @param {Object} params
 * @param {string} [params.zoneKey] - Slug of delivery zone (e.g. 'dhaka-inside')
 * @param {number} [params.subtotal=0] - Cart subtotal in BDT
 * @param {string} [params.paymentMethod] - Selected payment method ('cod', 'bkash', etc.)
 * @param {string} [params.district] - Delivery district name
 * @param {string} [params.area] - Delivery area name
 * @returns {Promise<{
 *   zoneKey: string,
 *   zoneLabel: string,
 *   charge: number,
 *   free: boolean,
 *   eta: string,
 *   etaDaysMin: number,
 *   etaDaysMax: number,
 *   codAvailable: boolean,
 *   allowedPaymentMethods: string[],
 *   reasons: string[]
 * }>}
 */
export async function calculateDeliveryQuote({
  zoneKey,
  subtotal = 0,
  paymentMethod,
  district,
  area,
} = {}) {
  await connectMongo();

  const numSubtotal = Math.max(0, Number(subtotal) || 0);
  const reasons = [];

  let zone = null;

  // 1. Direct key match
  if (zoneKey) {
    zone = await DeliveryZone.findOne({
      key: zoneKey.trim().toLowerCase(),
      status: "active",
    }).lean();
  }

  // 2. District / Area matching
  if (!zone && district) {
    const cleanDistrict = district.trim().toLowerCase();
    const cleanArea = area ? area.trim().toLowerCase() : "";

    const activeZones = await DeliveryZone.find({ status: "active" })
      .sort({ order: 1 })
      .lean();

    zone = activeZones.find((z) => {
      const matchDistrict = z.districts?.some(
        (d) => d.toLowerCase() === cleanDistrict
      );
      const matchArea = cleanArea
        ? z.areas?.some((a) => a.toLowerCase() === cleanArea)
        : false;
      return matchDistrict || matchArea;
    });

    // Fallback heuristic if not explicitly listed in districts array
    if (!zone) {
      if (cleanDistrict.includes("dhaka")) {
        zone = activeZones.find(
          (z) => z.key.includes("dhaka-inside") || z.key.includes("inside-dhaka")
        );
      } else {
        zone = activeZones.find(
          (z) => z.key.includes("outside") || z.key.includes("bangladesh")
        );
      }
    }
  }

  // 3. Default zone fallback
  if (!zone) {
    zone = await DeliveryZone.findOne({ isDefault: true, status: "active" }).lean();
  }

  // 4. Any first active zone fallback
  if (!zone) {
    zone = await DeliveryZone.findOne({ status: "active" })
      .sort({ order: 1 })
      .lean();
  }

  // 5. Ultimate fallback if DB is empty
  if (!zone) {
    const isDhaka = district && district.toLowerCase().includes("dhaka");
    const fallbackCharge = isDhaka ? 60 : 120;
    const isFree = numSubtotal >= 2000;
    return {
      zoneKey: isDhaka ? "dhaka-inside" : "all-bangladesh",
      zoneLabel: isDhaka ? "Inside Dhaka" : "All Bangladesh",
      charge: isFree ? 0 : fallbackCharge,
      free: isFree,
      eta: isDhaka ? "24-48 Hours" : "48-72 Hours",
      etaDaysMin: isDhaka ? 1 : 2,
      etaDaysMax: isDhaka ? 2 : 4,
      codAvailable: true,
      allowedPaymentMethods: ["cod", "bkash", "nagad", "sslcommerz"],
      reasons: isFree ? ["Free delivery applied for orders above ৳2,000"] : [],
    };
  }

  // Check minimum order requirement
  if (zone.minOrder && numSubtotal < zone.minOrder) {
    reasons.push(
      `Minimum order value for ${zone.label} is ৳${zone.minOrder.toLocaleString()}`
    );
  }

  // Calculate pricing & free shipping promotion
  let charge = Number(zone.charge) || 0;
  let free = false;

  if (zone.freeAbove != null && zone.freeAbove > 0 && numSubtotal >= zone.freeAbove) {
    charge = 0;
    free = true;
    reasons.push(
      `Free delivery promotion applied for order over ৳${zone.freeAbove.toLocaleString()}`
    );
  }

  // COD & Payment validation
  const codAvailable = Boolean(zone.codAvailable);
  const normalizedMethod = paymentMethod ? paymentMethod.trim().toLowerCase() : null;

  if (normalizedMethod === "cod" && !codAvailable) {
    reasons.push(`Cash on Delivery is currently unavailable for ${zone.label}`);
  }

  const allowedMethods =
    Array.isArray(zone.allowedPaymentMethods) && zone.allowedPaymentMethods.length > 0
      ? zone.allowedPaymentMethods
      : ["cod", "bkash", "nagad", "sslcommerz"];

  if (normalizedMethod && !allowedMethods.includes(normalizedMethod)) {
    reasons.push(
      `${paymentMethod} is not accepted for delivery in ${zone.label}`
    );
  }

  return {
    zoneKey: zone.key,
    zoneLabel: zone.label,
    charge,
    free,
    eta: zone.eta || "24-48 Hours",
    etaDaysMin: zone.etaDaysMin || 1,
    etaDaysMax: zone.etaDaysMax || 3,
    codAvailable,
    allowedPaymentMethods: allowedMethods,
    reasons,
  };
}
