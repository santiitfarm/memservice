/**
 * Cache Tag/Path Revalidation Webhook Caller.
 * Calls storefront /api/revalidate to purge Next.js Data Cache & Full Route Cache.
 *
 * @param {Object} options
 * @param {string} [options.tag] - Cache tag to invalidate (e.g. 'cms-site', 'cms-home')
 * @param {string} [options.path] - Route path to invalidate (e.g. '/about-us')
 * @returns {Promise<boolean>} Success state
 */
export async function revalidateStorefront({ tag, path } = {}) {
  try {
    const storefrontUrl =
      process.env.STOREFRONT_URL ||
      process.env.NEXT_PUBLIC_WEB_URL ||
      "http://localhost:3000";
    const secret =
      process.env.REVALIDATE_SECRET ||
      process.env.AUTH_SECRET ||
      "memservice-revalidate-secret-dev";

    const res = await fetch(`${storefrontUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ tag, path }),
    }).catch(() => null);

    if (res && res.ok) {
      return true;
    }
    return false;
  } catch (err) {
    // Graceful silent fallback in local dev if web storefront is not running
    console.warn("revalidateStorefront warning:", err.message);
    return false;
  }
}

export default revalidateStorefront;
