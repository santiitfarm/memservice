import bkash from "./bkash.js";
import sslcommerz from "./sslcommerz.js";
import nagad from "./nagad.js";
import aamarpay from "./aamarpay.js";
import shurjopay from "./shurjopay.js";
import cod from "./cod.js";
import manualMfs from "./manual-mfs.js";

export const paymentAdapters = {
  bkash,
  sslcommerz,
  nagad,
  aamarpay,
  shurjopay,
  cod,
  manual_mfs: manualMfs,
  "manual-mfs": manualMfs,
};

/**
 * Resolves a payment gateway adapter by provider key.
 * @param {string} providerKey - e.g. 'bkash', 'sslcommerz', 'cod', 'nagad'
 * @returns {Object|null} Adapter implementing { meta, createPayment, executeOrVerify, test }
 */
export function getPaymentAdapter(providerKey) {
  if (!providerKey) return null;
  const normalized = providerKey.trim().toLowerCase();
  return paymentAdapters[normalized] || null;
}

/**
 * Returns metadata of all supported payment gateway providers.
 * @returns {Array<Object>}
 */
export function listPaymentAdapters() {
  const seen = new Set();
  const list = [];

  for (const adapter of Object.values(paymentAdapters)) {
    if (adapter.meta && !seen.has(adapter.meta.key)) {
      seen.add(adapter.meta.key);
      list.push(adapter.meta);
    }
  }

  return list;
}

const paymentRegistry = {
  getPaymentAdapter,
  listPaymentAdapters,
  paymentAdapters,
};

export default paymentRegistry;
