import Coupon from "@/app/models/Coupon";
import CouponRedemption from "@/app/models/CouponRedemption";
import Product from "@/app/models/product-model";
import { normalizeBDPhone } from "@/lib/phone";
import { toMoney } from "@/lib/money";
import mongoose from "mongoose";

/**
 * Validates a coupon and computes the discount amount based on cart items, subtotal, and customer info.
 *
 * @param {Object} options
 * @param {string} options.couponCode
 * @param {Array<any>} options.items - Evaluated cart items
 * @param {number} options.subtotal - Current cart subtotal
 * @param {number} [options.deliveryCharge=0]
 * @param {string} [options.customerId]
 * @param {string} [options.phone]
 * @param {mongoose.ClientSession} [options.session]
 * @returns {Promise<{
 *   valid: boolean,
 *   discount: number,
 *   coupon?: any,
 *   error?: string,
 *   type?: string,
 *   value?: number
 * }>}
 */
export async function evaluateCoupon({
  couponCode,
  items = [],
  subtotal = 0,
  deliveryCharge = 0,
  customerId = null,
  phone = null,
  session = null,
}) {
  if (!couponCode || typeof couponCode !== "string") {
    return { valid: false, discount: 0 };
  }

  const code = couponCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, discount: 0 };
  }

  const query = Coupon.findOne({ code, status: "active" });
  if (session) query.session(session);
  const coupon = await query.exec();

  if (!coupon) {
    return {
      valid: false,
      discount: 0,
      error: `Coupon "${code}" is invalid or expired`,
    };
  }

  const now = new Date();
  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return {
      valid: false,
      discount: 0,
      error: `Coupon "${code}" is not yet active`,
    };
  }

  if (coupon.endsAt && new Date(coupon.endsAt) < now) {
    return {
      valid: false,
      discount: 0,
      error: `Coupon "${code}" expired on ${new Date(coupon.endsAt).toLocaleDateString()}`,
    };
  }

  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    return {
      valid: false,
      discount: 0,
      error: `Coupon "${code}" has reached its maximum usage limit`,
    };
  }

  if (coupon.minSubtotal > 0 && subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      discount: 0,
      error: `Minimum order subtotal of ৳${coupon.minSubtotal} required to use coupon "${code}"`,
    };
  }

  // Check per-customer or per-phone usage limit
  const normalizedPhone = phone ? normalizeBDPhone(phone) : null;
  if (coupon.perCustomerLimit && (customerId || normalizedPhone)) {
    const filter = { coupon: coupon._id };
    const orConditions = [];
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      orConditions.push({ customer: customerId });
    }
    if (normalizedPhone) {
      orConditions.push({ phone: normalizedPhone });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
      const countQuery = CouponRedemption.countDocuments(filter);
      if (session) countQuery.session(session);
      const priorUses = await countQuery.exec();

      if (priorUses >= coupon.perCustomerLimit) {
        return {
          valid: false,
          discount: 0,
          error: `You have already redeemed coupon "${code}" the maximum number of times (${coupon.perCustomerLimit})`,
        };
      }
    }
  }

  // Filter items by applicability rules
  let eligibleSubtotal = subtotal;

  const hasCatFilter = Array.isArray(coupon.applicableCategories) && coupon.applicableCategories.length > 0;
  const hasBrandFilter = Array.isArray(coupon.applicableBrands) && coupon.applicableBrands.length > 0;
  const hasExclusion = Array.isArray(coupon.excludedProducts) && coupon.excludedProducts.length > 0;

  if (hasCatFilter || hasBrandFilter || hasExclusion) {
    // Collect product documents for category/brand verification
    const itemIds = items.map((i) => i.id || i._id).filter((id) => mongoose.Types.ObjectId.isValid(id));
    const prodsQuery = Product.find({ _id: { $in: itemIds } }).select("category brand");
    if (session) prodsQuery.session(session);
    const prodDocs = await prodsQuery.lean().exec();
    const prodMap = new Map(prodDocs.map((p) => [String(p._id), p]));

    const excludedIds = new Set((coupon.excludedProducts || []).map((id) => String(id)));
    const allowedCats = new Set((coupon.applicableCategories || []).map((id) => String(id)));
    const allowedBrands = new Set((coupon.applicableBrands || []).map((id) => String(id)));

    eligibleSubtotal = 0;
    for (const item of items) {
      const pId = String(item.id || item._id);
      if (excludedIds.has(pId)) continue;

      const pDoc = prodMap.get(pId);
      if (!pDoc) continue;

      const matchesCat = !hasCatFilter || (pDoc.category && allowedCats.has(String(pDoc.category)));
      const matchesBrand = !hasBrandFilter || (pDoc.brand && allowedBrands.has(String(pDoc.brand)));

      if (matchesCat && matchesBrand) {
        eligibleSubtotal += Number(item.totalPrice) || 0;
      }
    }

    if (eligibleSubtotal <= 0) {
      return {
        valid: false,
        discount: 0,
        error: `None of the items in your cart are eligible for coupon "${code}"`,
      };
    }
  }

  // Calculate discount amount
  let discount = 0;
  if (coupon.type === "percent") {
    discount = eligibleSubtotal * (Number(coupon.value) / 100);
    if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === "fixed") {
    discount = Math.min(Number(coupon.value), eligibleSubtotal);
  } else if (coupon.type === "free_shipping") {
    discount = deliveryCharge;
  }

  discount = toMoney(Math.max(0, discount));

  return {
    valid: true,
    discount,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    maxDiscount: coupon.maxDiscount,
    minSubtotal: coupon.minSubtotal,
    coupon,
  };
}
