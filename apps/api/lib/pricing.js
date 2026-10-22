import Product from "../app/models/product-model.js";
import { calculateDeliveryQuote } from "./delivery.js";
import { add, mul, sum, toMoney } from "./money.js";
import connectMongo from "../services/mongo.js";
import mongoose from "mongoose";

/**
 * Authoritative server-side pricing engine.
 * Validates products in DB, enforces authoritative unit prices, checks stock,
 * and computes authoritative subtotals, delivery fees, and order totals.
 *
 * @param {Object} options
 * @param {Array<{id: string, quantity?: number, color?: string}>} options.items
 * @param {string} [options.zoneKey]
 * @param {string} [options.district]
 * @param {string} [options.area]
 * @param {string} [options.paymentMethod]
 * @param {string} [options.couponCode]
 * @param {any} [options.customer]
 * @param {mongoose.ClientSession} [options.session]
 * @param {boolean} [options.allowOutOfStock=false] - If true, does not throw on zero stock (used for cart preview)
 * @returns {Promise<{
 *   items: Array<any>,
 *   subtotal: number,
 *   discount: number,
 *   deliveryCharge: number,
 *   totalAmount: number,
 *   deliveryQuote: any
 * }>}
 */
export async function priceOrder({
  items = [],
  zoneKey,
  district,
  area,
  paymentMethod = "cod",
  couponCode = "",
  customer,
  session,
  allowOutOfStock = false,
} = {}) {
  await connectMongo();

  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("Cart must contain at least one item");
    err.code = "EMPTY_CART";
    throw err;
  }

  const repricedItems = [];

  for (const rawItem of items) {
    const productId = rawItem.id || rawItem._id || rawItem.productId;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      if (allowOutOfStock) {
        repricedItems.push({
          id: productId || "invalid",
          title: rawItem.title || rawItem.name || "Unknown Product",
          price: 0,
          quantity: Math.max(1, Number(rawItem.quantity) || 1),
          totalPrice: 0,
          stock: 0,
          inStock: false,
          maxQty: 0,
          error: "Invalid product identifier",
        });
        continue;
      }
      const err = new Error(`Invalid product ID: ${productId}`);
      err.code = "INVALID_PRODUCT";
      throw err;
    }

    const query = Product.findById(productId);
    if (session) {
      query.session(session);
    }
    const product = await query.exec();

    if (!product || product.status === "deleted") {
      if (allowOutOfStock) {
        repricedItems.push({
          id: productId,
          title: rawItem.title || rawItem.name || "Unavailable Product",
          price: 0,
          quantity: Math.max(1, Number(rawItem.quantity) || 1),
          totalPrice: 0,
          stock: 0,
          inStock: false,
          maxQty: 0,
          error: "Product not found or removed",
        });
        continue;
      }
      const err = new Error(
        `Product "${rawItem.title || rawItem.name || productId}" is no longer available`
      );
      err.code = "PRODUCT_NOT_FOUND";
      throw err;
    }

    if (product.status !== "active") {
      if (allowOutOfStock) {
        repricedItems.push({
          id: productId,
          title: product.name,
          price: 0,
          quantity: Math.max(1, Number(rawItem.quantity) || 1),
          totalPrice: 0,
          stock: 0,
          inStock: false,
          maxQty: 0,
          error: "Product is currently inactive",
        });
        continue;
      }
      const err = new Error(`Product "${product.name}" is currently inactive`);
      err.code = "PRODUCT_INACTIVE";
      throw err;
    }

    const quantity = Math.max(1, parseInt(rawItem.quantity, 10) || 1);
    const stock = Math.max(0, Number(product.stock) || 0);
    const inStock = stock >= quantity;

    if (!allowOutOfStock && !inStock) {
      const err = new Error(
        `Insufficient stock for "${product.name}". Available: ${stock}, Requested: ${quantity}`
      );
      err.code = "OUT_OF_STOCK";
      err.productId = product._id.toString();
      err.availableStock = stock;
      throw err;
    }

    // Authoritative server unit price: discount_price when set and > 0, else regular_price
    const regularPrice = toMoney(product.regular_price);
    const discountPrice = toMoney(product.discount_price);
    const unitPrice = discountPrice > 0 ? discountPrice : regularPrice;
    const lineTotal = mul(unitPrice, quantity);

    repricedItems.push({
      id: product._id.toString(),
      title: product.name,
      price: unitPrice,
      regularPrice,
      discountPrice,
      quantity,
      totalPrice: lineTotal,
      stock,
      inStock,
      maxQty: stock,
      image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
      manufacturer: product.manufacturer_name || "",
      color: rawItem.color || (Array.isArray(product.color) ? product.color[0] : ""),
    });
  }

  // Calculate authoritative subtotal
  const subtotal = sum(repricedItems, (item) => item.totalPrice);

  // Compute delivery charge via single source of truth delivery quote engine
  const deliveryQuote = await calculateDeliveryQuote({
    zoneKey,
    subtotal,
    paymentMethod,
    district,
    area,
  });

  const deliveryCharge = toMoney(deliveryQuote.charge);
  const discount = 0; // Reserved for coupon promotion engine
  const totalAmount = toMoney(add(subtotal, deliveryCharge) - discount);

  return {
    items: repricedItems,
    subtotal,
    discount,
    deliveryCharge,
    totalAmount,
    deliveryQuote,
  };
}

export default priceOrder;
