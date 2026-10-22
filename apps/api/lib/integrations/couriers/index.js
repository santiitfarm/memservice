import steadfast from "./steadfast.js";
import pathao from "./pathao.js";
import redx from "./redx.js";
import paperfly from "./paperfly.js";
import ecourier from "./ecourier.js";
import { normalizeCourierStatus, COURIER_STATUSES } from "./status.js";

export const courierAdapters = {
  steadfast,
  pathao,
  redx,
  paperfly,
  ecourier,
};

/**
 * Resolves a courier logistics adapter by key.
 * @param {string} providerKey - e.g. 'steadfast', 'pathao', 'redx'
 * @returns {Object|null}
 */
export function getCourierAdapter(providerKey) {
  if (!providerKey) return null;
  const key = providerKey.trim().toLowerCase();
  return courierAdapters[key] || null;
}

/**
 * Returns metadata of all supported courier delivery providers.
 * @returns {Array<Object>}
 */
export function listCourierAdapters() {
  const seen = new Set();
  const list = [];

  for (const adapter of Object.values(courierAdapters)) {
    if (adapter.meta && !seen.has(adapter.meta.key)) {
      seen.add(adapter.meta.key);
      list.push(adapter.meta);
    }
  }

  return list;
}

const couriersRegistry = {
  getCourierAdapter,
  listCourierAdapters,
  courierAdapters,
  normalizeCourierStatus,
  COURIER_STATUSES,
};

export default couriersRegistry;
