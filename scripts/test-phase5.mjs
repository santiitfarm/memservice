import "./_env.mjs";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { toMoney, add, sub, mul, sum } from "../apps/api/lib/money.js";
import { getNextOrderNumber } from "../apps/api/app/models/Counter.js";
import { priceOrder } from "../apps/api/lib/pricing.js";
import Product from "../apps/api/app/models/product-model.js";
import { Order } from "../apps/api/app/models/order-model.js";
import IdempotencyKey from "../apps/api/app/models/IdempotencyKey.js";

async function runTests() {
  console.log("==========================================");
  console.log("   STEP 5 VERIFICATION SUITE");
  console.log("==========================================");

  // ----------------------------------------------------
  // Test 1: Money helper functions
  // ----------------------------------------------------
  console.log("\n[1] Testing Money Math Helper (lib/money.js)...");
  assert.equal(toMoney("12.345"), 12.35, "toMoney should round half up");
  assert.equal(toMoney(null), 0, "toMoney(null) should be 0");
  assert.equal(toMoney(undefined), 0, "toMoney(undefined) should be 0");
  assert.equal(toMoney(""), 0, "toMoney('') should be 0");
  assert.equal(add(0.1, 0.2), 0.3, "add(0.1, 0.2) should be exactly 0.3");
  assert.equal(sub(1, 0.9), 0.1, "sub(1, 0.9) should be exactly 0.1");
  assert.equal(mul(10.55, 3), 31.65, "mul(10.55, 3) should round correctly");
  assert.equal(
    sum([{ p: 10.2 }, { p: 5.3 }, { p: 2.15 }], (x) => x.p),
    17.65,
    "sum should handle selectors with 2 decimals"
  );
  console.log("  ✓ Money math helper passed all precision assertions.");

  // ----------------------------------------------------
  // Connect to DB for remaining tests
  // ----------------------------------------------------
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
  const db = mongoose.connection.db;

  try {
    // ----------------------------------------------------
    // Test 2: Database money types
    // ----------------------------------------------------
    console.log("\n[2] Testing MongoDB Money Fields as Numbers...");
    const sampleProduct = await Product.findOne({ status: "active" }).lean();
    assert(sampleProduct, "Active product must exist in database");
    assert.equal(typeof sampleProduct.regular_price, "number", "regular_price must be number");
    assert.equal(typeof sampleProduct.discount_price, "number", "discount_price must be number");
    console.log(`  ✓ Product "${sampleProduct.name}" prices: regular=${sampleProduct.regular_price} (${typeof sampleProduct.regular_price}), discount=${sampleProduct.discount_price} (${typeof sampleProduct.discount_price})`);

    // ----------------------------------------------------
    // Test 3: Daily Order Number Counter
    // ----------------------------------------------------
    console.log("\n[3] Testing Atomic Server Order Number Generator...");
    const orderNumber1 = await getNextOrderNumber();
    const orderNumber2 = await getNextOrderNumber();
    console.log(`  Generated: ${orderNumber1}, ${orderNumber2}`);
    assert(/^MS-\d{6}-\d{6}$/.test(orderNumber1), `Order number ${orderNumber1} must match pattern MS-YYMMDD-######`);
    assert(/^MS-\d{6}-\d{6}$/.test(orderNumber2), `Order number ${orderNumber2} must match pattern MS-YYMMDD-######`);
    const seq1 = parseInt(orderNumber1.split("-")[2], 10);
    const seq2 = parseInt(orderNumber2.split("-")[2], 10);
    assert.equal(seq2, seq1 + 1, "Order numbers must increment monotonically");
    console.log("  ✓ Order number format and monotonic increment passed.");

    // ----------------------------------------------------
    // Test 4: Authoritative Server Pricing Engine
    // ----------------------------------------------------
    console.log("\n[4] Testing Authoritative Server Pricing Engine (priceOrder)...");
    const priced = await priceOrder({
      items: [{ id: sampleProduct._id.toString(), quantity: 2 }],
      zoneKey: "dhaka-inside",
      paymentMethod: "cod",
    });

    const expectedUnitPrice = sampleProduct.discount_price > 0 ? sampleProduct.discount_price : sampleProduct.regular_price;
    const expectedSubtotal = expectedUnitPrice * 2;
    assert.equal(priced.subtotal, expectedSubtotal, `Subtotal must match server calculation: ${expectedSubtotal}`);
    assert.equal(typeof priced.deliveryCharge, "number", "Delivery charge must be a number");
    assert.equal(priced.totalAmount, expectedSubtotal + priced.deliveryCharge, "Total amount must equal subtotal + deliveryCharge");
    console.log(`  ✓ Authoritative pricing: Unit=৳${expectedUnitPrice}, Qty=2, Subtotal=৳${priced.subtotal}, Delivery=৳${priced.deliveryCharge}, Total=৳${priced.totalAmount}`);

    // ----------------------------------------------------
    // Test 5: Out of stock validation
    // ----------------------------------------------------
    console.log("\n[5] Testing Out-of-Stock Validation...");
    let outOfStockCaught = false;
    try {
      await priceOrder({
        items: [{ id: sampleProduct._id.toString(), quantity: 999999 }],
        zoneKey: "dhaka-inside",
        allowOutOfStock: false,
      });
    } catch (err) {
      if (err.code === "OUT_OF_STOCK") {
        outOfStockCaught = true;
      }
    }
    assert(outOfStockCaught, "Ordering 999999 items must throw OUT_OF_STOCK error");
    console.log("  ✓ Out of stock error thrown correctly.");

    // ----------------------------------------------------
    // Test 6: POST /api/cart/price endpoint
    // ----------------------------------------------------
    console.log("\n[6] Testing POST /api/cart/price via HTTP...");
    const cartPriceRes = await fetch("http://localhost:3001/api/cart/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id: sampleProduct._id.toString(), quantity: 1 }],
        zoneKey: "dhaka-inside",
      }),
    });
    assert.equal(cartPriceRes.status, 200, "POST /api/cart/price must return 200");
    const cartPriceData = await cartPriceRes.json();
    assert(cartPriceData.success, "Response must be success: true");
    assert(Array.isArray(cartPriceData.items) && cartPriceData.items[0].inStock, "Item must be marked inStock: true");
    assert.equal(cartPriceData.items[0].price, expectedUnitPrice, "Price must match unit price");
    console.log("  ✓ POST /api/cart/price returned valid repriced lines and totals.");

    // ----------------------------------------------------
    // Test 7: Tampered order payload returns 409 PRICE_CHANGED
    // ----------------------------------------------------
    console.log("\n[7] Testing Tampered Order Payload Protection (submitting 1 BDT for a 500+ BDT order)...");
    const tamperedRes = await fetch("http://localhost:3001/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          customer_name: "Test Tamperer",
          phone_number: "01799999999",
          address: "Test Address, Dhaka",
        },
        shipping_details: {
          address: "Test Address, Dhaka",
          zoneKey: "dhaka-inside",
          district: "Dhaka",
        },
        payment_info: {
          method: "cod",
        },
        total_amount: 1.0, // Tampered client total!
        items: [{ id: sampleProduct._id.toString(), quantity: 2 }],
      }),
    });

    assert.equal(tamperedRes.status, 409, `Tampered order must return 409 Conflict, got ${tamperedRes.status}`);
    const tamperedData = await tamperedRes.json();
    assert.equal(tamperedData.code, "PRICE_CHANGED", "Response code must be PRICE_CHANGED");
    assert(tamperedData.total > 10, "Response must include true server total");
    console.log(`  ✓ Server rejected tampered total (1 BDT) with 409 PRICE_CHANGED (Server Total: ৳${tamperedData.total}).`);

    // ----------------------------------------------------
    // Test 8: Valid Order Placement & Idempotency Key Replay
    // ----------------------------------------------------
    console.log("\n[8] Testing Valid Order Placement & Idempotency Key Replay...");
    const testIdempotencyKey = `test-idemp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pricedSingle = await priceOrder({
      items: [{ id: sampleProduct._id.toString(), quantity: 1 }],
      zoneKey: "dhaka-inside",
      paymentMethod: "cod",
    });

    const validOrderPayload = {
      customer: {
        customer_name: "Idempotent Buyer",
        phone_number: "01711223344",
        address: "Banani, Dhaka",
      },
      shipping_details: {
        address: "Banani, Dhaka",
        zoneKey: "dhaka-inside",
        district: "Dhaka",
      },
      payment_info: {
        method: "cod",
      },
      total_amount: pricedSingle.totalAmount, // Legitimate server total for 1 item
      items: [{ id: sampleProduct._id.toString(), quantity: 1 }],
    };

    const initialStock = (await Product.findById(sampleProduct._id)).stock;

    // First order creation request
    const orderRes1 = await fetch("http://localhost:3001/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": testIdempotencyKey,
      },
      body: JSON.stringify(validOrderPayload),
    });

    assert.equal(orderRes1.status, 200, `Initial order creation must return 200, got ${orderRes1.status}`);
    const orderData1 = await orderRes1.json();
    assert(orderData1.success, "Initial order must be successful");
    assert(orderData1.order?.order_number?.startsWith("MS-"), "Order number must be generated server-side with MS- prefix");
    const createdOrderId = orderData1.order._id;

    // Check inventory was decremented by 1
    const stockAfterFirst = (await Product.findById(sampleProduct._id)).stock;
    assert.equal(stockAfterFirst, initialStock - 1, "Stock must be decremented by 1");

    // Second order request with identical Idempotency-Key
    const orderRes2 = await fetch("http://localhost:3001/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": testIdempotencyKey,
      },
      body: JSON.stringify(validOrderPayload),
    });

    assert.equal(orderRes2.status, 200, "Replayed order must return 200 OK");
    assert.equal(orderRes2.headers.get("x-idempotent-replay"), "true", "Replayed response must have X-Idempotent-Replay header");
    const orderData2 = await orderRes2.json();
    assert.equal(orderData2.order._id, createdOrderId, "Replayed response must return the exact same order ID");

    // Verify inventory was NOT decremented again
    const stockAfterSecond = (await Product.findById(sampleProduct._id)).stock;
    assert.equal(stockAfterSecond, stockAfterFirst, "Stock must NOT be decremented a second time on idempotent replay");
    console.log(`  ✓ Idempotent replay verified: Same Order ID (${createdOrderId}), X-Idempotent-Replay header present, zero double-decrement.`);

    console.log("\n==========================================");
    console.log("   ALL STEP 5 TESTS PASSED SUCCESSFULLY!");
    console.log("==========================================");
  } finally {
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
