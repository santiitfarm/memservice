// Verification script for Step 11: Storefront Catalog & Dynamic Checkout
import assert from "node:assert/strict";

const API_BASE = process.env.API_URL || "http://localhost:3001";

async function runTests() {
  console.log("🚀 Starting Step 11 Verification Tests on:", API_BASE);
  let passCount = 0;

  // Test 1: Catalog API Search, Filter & Facets
  console.log("\n🧪 Test 1: Verifying GET /api/catalog/products...");
  const catRes = await fetch(`${API_BASE}/api/catalog/products?limit=12&sort=newest`);
  assert.equal(catRes.status, 200, "Catalog should return 200 OK");
  const catData = await catRes.json();
  assert.equal(catData.success, true, "Catalog success should be true");
  assert.ok(Array.isArray(catData.items), "Items should be an array");
  assert.ok(catData.total >= 0, "Total count should be present");
  assert.ok(catData.facets, "Facets should be present");
  assert.ok(Array.isArray(catData.facets.categories), "Facets categories should be an array");
  assert.ok(Array.isArray(catData.facets.brands), "Facets brands should be an array");
  console.log("   ✅ Catalog API returned items and facets:", {
    itemsCount: catData.items.length,
    total: catData.total,
    facetsCategories: catData.facets.categories.length,
    facetsBrands: catData.facets.brands.length,
  });
  passCount++;

  // Test 2: Product Slug & ObjectId Redirect Resolution
  console.log("\n🧪 Test 2: Verifying Product Slug & ObjectId Resolution via /api/shop/...");
  const firstProduct = catData.items[0];
  if (firstProduct) {
    const slug = firstProduct.slug;
    const objectId = firstProduct._id;

    // Fetch by slug
    if (slug) {
      const slugRes = await fetch(`${API_BASE}/api/shop/${slug}`);
      assert.equal(slugRes.status, 200, "Slug fetch should return 200");
      const slugData = await slugRes.json();
      assert.equal(slugData.isObjectId, false, "Fetch by slug should have isObjectId = false");
      assert.equal(slugData.product?.name, firstProduct.name, "Product name should match");
      console.log("   ✅ Resolved product by slug:", slug);
    }

    // Fetch by ObjectId
    if (objectId) {
      const idRes = await fetch(`${API_BASE}/api/shop/${objectId}`);
      assert.equal(idRes.status, 200, "ObjectId fetch should return 200");
      const idData = await idRes.json();
      assert.equal(idData.isObjectId, true, "Fetch by ObjectId should have isObjectId = true");
      if (slug) {
        assert.equal(idData.slug, slug, "Should return product slug for 301 redirection");
      }
      console.log("   ✅ Resolved product by ObjectId with slug redirect target:", {
        id: objectId,
        redirectSlug: idData.slug,
      });
    }
  } else {
    console.log("   ⚠️ No products in catalog to test slug resolution (skipped)");
  }
  passCount++;

  // Test 3: Delivery Zones & Live Quote Calculation
  console.log("\n🧪 Test 3: Verifying Delivery Zones & Quote Calculation...");
  const zonesRes = await fetch(`${API_BASE}/api/delivery/zones`);
  assert.equal(zonesRes.status, 200, "Zones fetch should return 200");
  const zonesData = await zonesRes.json();
  assert.ok(Array.isArray(zonesData.zones), "Zones must be an array");

  const testZoneKey = zonesData.zones[0]?.key || "dhaka";
  const quoteRes = await fetch(`${API_BASE}/api/delivery/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      zoneKey: testZoneKey,
      subtotal: 500,
      paymentMethod: "cod",
    }),
  });
  assert.equal(quoteRes.status, 200, "Delivery quote should return 200");
  const quoteData = await quoteRes.json();
  assert.equal(quoteData.success, true, "Delivery quote success should be true");
  assert.ok(quoteData.quote != null, "Quote payload must exist");
  assert.ok(typeof quoteData.quote.charge === "number", "Delivery charge must be a number");
  console.log("   ✅ Live quote calculated successfully:", {
    zoneKey: testZoneKey,
    charge: quoteData.quote.charge,
    free: quoteData.quote.free,
    codAvailable: quoteData.quote.codAvailable,
  });
  passCount++;

  // Test 4: Server Cart Re-Pricing API
  console.log("\n🧪 Test 4: Verifying POST /api/cart/price...");
  const priceRes = await fetch(`${API_BASE}/api/cart/price`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: firstProduct
        ? [{ id: firstProduct._id, quantity: 2 }]
        : [],
    }),
  });
  assert.equal(priceRes.status, 200, "Cart price should return 200");
  const priceData = await priceRes.json();
  assert.equal(priceData.success, true, "Cart pricing success should be true");
  assert.ok(typeof priceData.subtotal === "number", "Subtotal must be a number");
  console.log("   ✅ Cart price calculated:", {
    itemsCount: priceData.items?.length || 0,
    subtotal: priceData.subtotal,
  });
  passCount++;

  // Test 5: Checkout Anti-Tampering (409 PRICE_CHANGED on client total mismatch)
  console.log("\n🧪 Test 5: Verifying Checkout Anti-Tampering Protection...");
  if (firstProduct) {
    const fakeTotal = 1.0; // Deliberate mismatch from actual item price
    const orderRes = await fetch(`${API_BASE}/api/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `test-idemp-${Date.now()}`,
      },
      body: JSON.stringify({
        customer: {
          customer_name: "Test Customer",
          phone_number: "01711000000",
          address: "Dhaka, Bangladesh",
        },
        shipping_details: {
          zoneKey: testZoneKey,
          address: "Dhaka, Bangladesh",
        },
        payment_info: {
          method: "cod",
          amount: fakeTotal,
        },
        total_amount: fakeTotal,
        items: [{ id: firstProduct._id, quantity: 1, price: 1.0 }],
      }),
    });

    assert.equal(
      orderRes.status,
      409,
      "Order with tampered total must be rejected with 409 PRICE_CHANGED"
    );
    const orderData = await orderRes.json();
    assert.equal(orderData.code, "PRICE_CHANGED", "Error code must be PRICE_CHANGED");
    console.log("   ✅ Anti-tampering check verified: 409 PRICE_CHANGED returned for tampered total");
  } else {
    console.log("   ⚠️ No products to test anti-tampering (skipped)");
  }
  passCount++;

  console.log(`\n🎉 All ${passCount} Step 11 test suites PASSED successfully!\n`);
}

runTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
