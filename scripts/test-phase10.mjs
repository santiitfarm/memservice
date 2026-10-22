// Verification script for Step 10: Storefront Shell & Dynamic CMS Homepage
import assert from "node:assert/strict";

const API_BASE = process.env.API_URL || "http://localhost:3001";

async function runTests() {
  console.log("🚀 Starting Step 10 Verification Tests on:", API_BASE);
  let passCount = 0;

  // Test 1: CMS Bootstrap API
  console.log("\n🧪 Test 1: Verifying GET /api/cms/bootstrap...");
  const bootRes = await fetch(`${API_BASE}/api/cms/bootstrap`);
  assert.equal(bootRes.status, 200, "Bootstrap should return 200 OK");
  const bootData = await bootRes.json();
  assert.equal(bootData.success, true, "Bootstrap success should be true");
  assert.ok(bootData.bootstrap, "bootstrap payload must exist");
  assert.ok(bootData.bootstrap.site, "site settings must exist in bootstrap");
  assert.ok(bootData.bootstrap.site.contact?.phone, "contact phone must exist in site settings");
  assert.ok(bootData.bootstrap.menus, "menus must exist in bootstrap");
  assert.ok(Array.isArray(bootData.bootstrap.paymentMethods), "paymentMethods array must exist");
  console.log("   ✅ Bootstrap contains site info, menus, and payment methods:", {
    siteName: bootData.bootstrap.site.siteName,
    phone: bootData.bootstrap.site.contact?.phone,
    paymentMethodsCount: bootData.bootstrap.paymentMethods.length,
  });
  passCount++;

  // Test 2: Search Autocomplete Suggestions API
  console.log("\n🧪 Test 2: Verifying GET /api/catalog/suggest?q=...");
  const suggestRes = await fetch(`${API_BASE}/api/catalog/suggest?q=a`);
  assert.equal(suggestRes.status, 200, "Suggest should return 200 OK");
  const suggestData = await suggestRes.json();
  assert.equal(suggestData.success, true, "Suggest success should be true");
  assert.ok(Array.isArray(suggestData.products), "products array must exist");
  assert.ok(Array.isArray(suggestData.categories), "categories array must exist");
  assert.ok(Array.isArray(suggestData.brands), "brands array must exist");
  console.log("   ✅ Suggest returned results:", {
    query: suggestData.query,
    products: suggestData.products.length,
    categories: suggestData.categories.length,
    brands: suggestData.brands.length,
  });
  passCount++;

  // Test 3: Dynamic Home Layout API
  console.log("\n🧪 Test 3: Verifying GET /api/cms/home...");
  const homeRes = await fetch(`${API_BASE}/api/cms/home`);
  assert.equal(homeRes.status, 200, "Home layout endpoint should return 200 OK");
  const homeData = await homeRes.json();
  assert.equal(homeData.success, true, "Home layout success should be true");
  assert.ok(homeData.home, "home payload must exist");
  assert.ok(Array.isArray(homeData.home.sliders), "sliders must be an array");
  assert.ok(Array.isArray(homeData.home.categories), "categories must be an array");
  assert.ok(Array.isArray(homeData.home.brands), "brands must be an array");
  assert.ok(Array.isArray(homeData.home.banners), "banners must be an array");
  assert.ok(Array.isArray(homeData.home.testimonials), "testimonials must be an array");
  console.log("   ✅ Home data contains content for all sections:", {
    slidersCount: homeData.home.sliders.length,
    categoriesCount: homeData.home.categories.length,
    brandsCount: homeData.home.brands.length,
    bannersCount: homeData.home.banners.length,
    testimonialsCount: homeData.home.testimonials.length,
  });
  passCount++;

  // Test 4: Newsletter Subscription API
  console.log("\n🧪 Test 4: Verifying POST /api/newsletter...");
  const testEmail = `test_customer_${Date.now()}@example.com`;
  const newsRes = await fetch(`${API_BASE}/api/newsletter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  assert.equal(newsRes.status, 200, "Valid newsletter signup should return 200");
  const newsData = await newsRes.json();
  assert.ok(newsData.message, "Should return subscription message");
  console.log("   ✅ Newsletter subscription successful:", newsData.message);

  // Test 4b: Invalid email rejection
  const invalidRes = await fetch(`${API_BASE}/api/newsletter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "invalid-email" }),
  });
  assert.equal(invalidRes.status, 400, "Invalid email must return 400");
  console.log("   ✅ Invalid email correctly rejected with 400");
  passCount++;

  console.log(`\n🎉 All ${passCount} Step 10 test suites PASSED successfully!\n`);
}

runTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
