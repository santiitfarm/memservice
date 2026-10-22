import http from "node:http";

const BASE_URL = process.env.WEB_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:3001";

const STATIC_ROUTES = [
  "/",
  "/shop",
  "/offer",
  "/trending",
  "/best-seller",
  "/cart",
  "/checkout",
  "/track-order",
  "/consultation",
  "/consultation/doctor",
  "/consultation/Cardiology",
  "/visit/checkout",
  "/appointment/book",
  "/appointment/status",
  "/about-us",
  "/faq",
  "/privacy-policy",
  "/terms-and-conditions",
  "/refund-and-return-policy",
  "/account/login",
  "/account/register",
  "/wishlist",
];

// Helper to fetch HTTP url with redirect following
async function fetchPage(urlPath) {
  const fullUrl = `${BASE_URL}${urlPath}`;
  const response = await fetch(fullUrl, {
    headers: {
      "User-Agent": "MemserviceRouteCrawler/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });

  const status = response.status;
  const html = await response.text();

  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // Check for rendering artifacts
  const anomalies = [];
  if (html.includes("[object Object]")) {
    anomalies.push("Contains '[object Object]' rendering bug");
  }
  // Check for isolated 'undefined' or 'NaN' in user-visible HTML
  if (/>\s*(undefined|NaN)\s*</i.test(html)) {
    anomalies.push("Contains rendered 'undefined' or 'NaN' text");
  }

  return {
    urlPath,
    fullUrl,
    status,
    title,
    anomalies,
    size: html.length,
  };
}

async function getDynamicRoutes() {
  const dynamicRoutes = [];

  // 1. Fetch sample product slug
  try {
    const res = await fetch(`${API_URL}/api/catalog/products?limit=1`);
    if (res.ok) {
      const data = await res.json();
      const product = data.products?.[0] || data.items?.[0];
      if (product?.slug) {
        dynamicRoutes.push(`/product/${product.slug}`);
      }
    }
  } catch (e) {
    console.warn("Could not fetch product for dynamic crawl:", e.message);
  }

  // 2. Fetch sample doctor ID
  try {
    const res = await fetch(`${API_URL}/api/doctors`);
    if (res.ok) {
      const doctors = await res.json();
      const doc = Array.isArray(doctors) ? doctors[0] : null;
      if (doc?._id) {
        dynamicRoutes.push(`/doctors/${doc._id}`);
      }
    }
  } catch (e) {
    console.warn("Could not fetch doctor for dynamic crawl:", e.message);
  }

  return dynamicRoutes;
}

async function main() {
  console.log(`\n🕷️  Starting Storefront Route Crawler against: ${BASE_URL}\n`);

  const dynamicRoutes = await getDynamicRoutes();
  const allRoutes = [...STATIC_ROUTES, ...dynamicRoutes];

  let passed = 0;
  let failed = 0;
  const failureDetails = [];

  for (const route of allRoutes) {
    process.stdout.write(`  Crawling ${route.padEnd(36)} `);
    try {
      const result = await fetchPage(route);

      const is200 = result.status === 200;
      const hasTitle = Boolean(result.title && result.title.length > 2);
      const noAnomalies = result.anomalies.length === 0;

      if (is200 && hasTitle && noAnomalies) {
        console.log(`✅ 200 OK | "${result.title.slice(0, 32)}..." (${result.size} bytes)`);
        passed++;
      } else {
        const issues = [];
        if (!is200) issues.push(`HTTP ${result.status}`);
        if (!hasTitle) issues.push("Missing <title>");
        if (!noAnomalies) issues.push(result.anomalies.join(", "));

        console.log(`❌ FAIL [${issues.join("; ")}]`);
        failed++;
        failureDetails.push({ route, issues });
      }
    } catch (err) {
      console.log(`💥 ERROR: ${err.message}`);
      failed++;
      failureDetails.push({ route, issues: [err.message] });
    }
  }

  console.log("\n=======================================================");
  console.log(`Crawler Summary: Total: ${allRoutes.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log("=======================================================\n");

  if (failed > 0) {
    console.error("❌ Crawl Failures Detected:");
    failureDetails.forEach((f) => console.error(`  - ${f.route}: ${f.issues.join(", ")}`));
    process.exit(1);
  } else {
    console.log("🎉 All storefront routes verified successfully with HTTP 200, valid titles, and zero rendering bugs!\n");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal crawler error:", err);
  process.exit(1);
});
