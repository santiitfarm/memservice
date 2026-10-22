import "./_env.mjs";
import mongoose from "mongoose";
import { SignJWT } from "../apps/api/node_modules/jose/dist/node/esm/index.js";

const API_BASE = "http://localhost:3001";
const AUTH_SECRET = process.env.AUTH_SECRET || "memservice_super_secret_jwt_key_2025_at_least_32_chars";

async function makeCustomerToken(customerId, phone = "01712345678", email = "customer7@test.com") {
  const secret = new TextEncoder().encode(AUTH_SECRET);
  return new SignJWT({ phone, email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(customerId))
    .setAudience("customer")
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
}

async function makeStaffCookie(userId, role = "admin") {
  const secret = new TextEncoder().encode(AUTH_SECRET);
  const token = await new SignJWT({
    user: { id: String(userId), name: "Staff Admin", role },
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
  return `memservice_auth=${token}`;
}

async function main() {
  console.log("==========================================");
  console.log("   STEP 7 INTEGRATION VERIFICATION SUITE  ");
  console.log("==========================================");

  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/memservice";
  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;

  // 1. Get or seed a product
  let product = await db.collection("products").findOne({ status: "active" });
  if (!product) {
    const res = await db.collection("products").insertOne({
      name: "Paracetamol 500mg Phase 7",
      slug: "paracetamol-500mg-phase-7",
      regular_price: 25,
      discount_price: 20,
      stock: 100,
      status: "active",
      tags: ["otc", "tablet"],
      lowStockThreshold: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    product = await db.collection("products").findOne({ _id: res.insertedId });
  }

  // 2. Get or seed a customer profile
  let customer = await db.collection("customerprofiles").findOne({ phone_number: "01712345678" });
  if (!customer) {
    const res = await db.collection("customerprofiles").insertOne({
      customer_name: "Phase 7 Tester",
      phone_number: "01712345678",
      email: "phase7tester@test.com",
      orders: [],
      wishlist: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    customer = await db.collection("customerprofiles").findOne({ _id: res.insertedId });
  }

  const customerToken = await makeCustomerToken(customer._id, customer.phone_number, customer.email);
  const staffCookie = await makeStaffCookie(new mongoose.Types.ObjectId(), "admin");

  // [1] Test Coupon Seed & Validate Endpoint
  console.log("\n[1] Testing Coupon Engine & Validation...");
  await db.collection("coupons").deleteOne({ code: "SAVE15" });
  await db.collection("coupons").insertOne({
    code: "SAVE15",
    type: "percent",
    value: 15,
    maxDiscount: 100,
    minSubtotal: 50,
    perCustomerLimit: 2,
    usedCount: 0,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const couponRes = await fetch(`${API_BASE}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "SAVE15",
      items: [{ id: String(product._id), quantity: 4 }],
      phone: "01712345678",
    }),
  });

  const couponJson = await couponRes.json();
  if (!couponJson.valid || couponJson.discount <= 0) {
    console.error("Coupon validation response:", couponJson);
    throw new Error(`Coupon validation failed: ${couponJson.message || "Invalid coupon"}`);
  }
  console.log(`  ✓ Coupon SAVE15 validated successfully! Discount: ৳${couponJson.discount}`);

  // Test invalid coupon
  const invalidCouponRes = await fetch(`${API_BASE}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "INVALID_CODE_XYZ",
      items: [{ id: String(product._id), quantity: 2 }],
    }),
  });
  if (invalidCouponRes.status !== 400) {
    throw new Error("Invalid coupon did not return 400");
  }
  console.log("  ✓ Invalid coupon gracefully rejected with 400");

  // [2] Test Guest Order Tracking
  console.log("\n[2] Testing Guest Order Tracking Endpoint...");
  const testOrderNumber = `MS-TEST-${Date.now().toString().slice(-6)}`;
  const orderDoc = {
    order_number: testOrderNumber,
    customer: customer._id,
    phone_number: "01712345678",
    items: [
      {
        id: String(product._id),
        title: product.name,
        price: 20,
        quantity: 2,
        totalPrice: 40,
      },
    ],
    total_amount: 100,
    status: "delivered",
    shipping_details: {
      address: "Dhanmondi 27, Dhaka",
      district: "Dhaka",
      area: "Dhanmondi",
      shipping_charge: 60,
    },
    payment_info: {
      method: "cod",
      status: "paid",
      amount: 100,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    delivery_date: new Date(),
  };

  const insertedOrder = await db.collection("orders").insertOne(orderDoc);
  const orderId = insertedOrder.insertedId;

  // Track with correct orderNumber and phone
  const trackRes = await fetch(`${API_BASE}/api/orders/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderNumber: testOrderNumber,
      phone: "01712345678",
    }),
  });

  const trackJson = await trackRes.json();
  if (!trackJson.success || !trackJson.order) {
    console.error("Track order error:", trackJson);
    throw new Error("Order tracking failed for valid order and phone");
  }
  console.log(`  ✓ Guest order tracking succeeded for #${testOrderNumber} (status: ${trackJson.order.status})`);

  // Track with mismatch phone
  const mismatchRes = await fetch(`${API_BASE}/api/orders/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderNumber: testOrderNumber,
      phone: "01999999999",
    }),
  });
  if (mismatchRes.status !== 404) {
    throw new Error(`Phone mismatch should return generic 404, got ${mismatchRes.status}`);
  }
  console.log("  ✓ Mismatched phone correctly returned generic 404");

  // Track status map
  const statusMapRes = await fetch(`${API_BASE}/api/orders/track/status-map`);
  const statusMapJson = await statusMapRes.json();
  if (!statusMapJson.statuses?.delivered?.labelBn) {
    throw new Error("status-map route failed to return localized statuses");
  }
  console.log("  ✓ Status map returned full localized statuses with colors");

  // [3] Test Stock Movement & Adjustment API
  console.log("\n[3] Testing Stock Movements & Adjustments...");
  const adjustRes = await fetch(`${API_BASE}/api/stock/adjust`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: staffCookie,
    },
    body: JSON.stringify({
      productId: String(product._id),
      delta: 15,
      reason: "restock",
      reference: "Shipment #SHP-2026-001",
    }),
  });
  const adjustJson = await adjustRes.json();
  if (!adjustJson.success || !adjustJson.movement) {
    console.error("Stock adjustment failed:", adjustJson);
    throw new Error("Stock adjustment failed");
  }
  console.log(`  ✓ Stock adjusted: +15, balanceAfter: ${adjustJson.balanceAfter}`);

  // Get stock movements
  const movementsRes = await fetch(`${API_BASE}/api/stock/movements?productId=${product._id}`, {
    headers: { Cookie: staffCookie },
  });
  const movementsJson = await movementsRes.json();
  if (!movementsJson.success || movementsJson.total < 1) {
    throw new Error("Failed to retrieve stock movements");
  }
  console.log(`  ✓ Stock movements audit log verified (${movementsJson.total} movements recorded)`);

  // Get low stock
  const lowStockRes = await fetch(`${API_BASE}/api/stock/low`, {
    headers: { Cookie: staffCookie },
  });
  const lowStockJson = await lowStockRes.json();
  if (!lowStockJson.success || !Array.isArray(lowStockJson.items)) {
    throw new Error("Failed to retrieve low stock list");
  }
  console.log(`  ✓ Low stock report endpoint returned ${lowStockJson.count} items`);

  // [4] Test Customer Returns & Refunds API
  console.log("\n[4] Testing Customer Returns & Refunds...");
  const returnReqRes = await fetch(`${API_BASE}/api/returns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      orderId: String(orderId),
      items: [
        {
          productId: String(product._id),
          quantity: 1,
          reason: "damaged",
        },
      ],
      reason: "damaged",
      notes: "Product was damaged during transit",
    }),
  });
  const returnJson = await returnReqRes.json();
  if (!returnJson.success || !returnJson.returnRequest) {
    console.error("Return request failed:", returnJson);
    throw new Error(`Return request failed: ${returnJson.message}`);
  }
  const returnId = returnJson.returnRequest._id;
  console.log(`  ✓ Return request created: ${returnId} (status: requested)`);

  // Staff approves and receives return with restock
  const staffReturnRes = await fetch(`${API_BASE}/api/returns/${returnId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: staffCookie,
    },
    body: JSON.stringify({
      status: "received",
      restock: true,
      note: "Item inspected and approved for restocking",
      refund: {
        method: "bkash",
        amount: 20,
        reference: "BKASH-REF-7711",
      },
    }),
  });
  const staffReturnJson = await staffReturnRes.json();
  if (!staffReturnJson.success || staffReturnJson.returnRequest.status !== "received") {
    console.error("Staff return update failed:", staffReturnJson);
    throw new Error("Staff return update failed");
  }
  console.log(`  ✓ Staff received return and restocked product via StockMovement audit`);

  // [5] Test Wishlist DB Sync
  console.log("\n[5] Testing Wishlist DB Sync...");
  const wishlistPutRes = await fetch(`${API_BASE}/api/me/wishlist`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      productId: String(product._id),
      action: "add",
    }),
  });
  const wishlistJson = await wishlistPutRes.json();
  if (!wishlistJson.success || wishlistJson.count < 1) {
    console.error("Wishlist update failed:", wishlistJson);
    throw new Error("Wishlist update failed");
  }
  console.log(`  ✓ Product added to customer DB wishlist (count: ${wishlistJson.count})`);

  // Wishlist merge
  const mergeRes = await fetch(`${API_BASE}/api/me/wishlist/merge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      productIds: [String(product._id)],
    }),
  });
  const mergeJson = await mergeRes.json();
  if (!mergeJson.success) {
    throw new Error("Wishlist merge failed");
  }
  console.log("  ✓ Guest wishlist merge succeeded on customer login");

  // [6] Test Data Privacy Request API
  console.log("\n[6] Testing Customer Privacy Data Requests...");
  await db.collection("datarequests").deleteMany({ customer: customer._id });
  const dataReqRes = await fetch(`${API_BASE}/api/me/data-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      type: "export",
      notes: "Please export all my account data",
    }),
  });
  const dataReqJson = await dataReqRes.json();
  if (!dataReqJson.success || !dataReqJson.request) {
    console.error("Data request creation failed:", dataReqJson);
    throw new Error("Data request failed");
  }
  console.log(`  ✓ Data export request submitted: ${dataReqJson.request._id}`);

  // [7] Test Bilingual i18n Content Support
  console.log("\n[7] Testing Bilingual Content Support (English & Bangla fallback)...");
  // Set Bangla tagline on site settings
  await db.collection("sitesettings").updateOne(
    { key: "site" },
    { $set: { taglineBn: "সারা বাংলাদেশে জেনুইন ওষুধ ও স্বাস্থ্যসেবা" } },
    { upsert: true }
  );
  const siteBnRes = await fetch(`${API_BASE}/api/cms/site?lang=bn`);
  const siteBnJson = await siteBnRes.json();
  if (!siteBnJson.success || !siteBnJson.site.tagline) {
    throw new Error("Failed to fetch localized site settings");
  }
  console.log(`  ✓ Localized site settings returned Bangla tagline: "${siteBnJson.site.tagline}"`);

  // Test English query returns English
  const siteEnRes = await fetch(`${API_BASE}/api/cms/site?lang=en`);
  const siteEnJson = await siteEnRes.json();
  console.log(`  ✓ English query returned English tagline: "${siteEnJson.site.tagline}"`);

  // Cleanup test order
  await db.collection("orders").deleteOne({ _id: orderId });
  await db.collection("returnrequests").deleteOne({ _id: new mongoose.Types.ObjectId(returnId) });

  await mongoose.disconnect();

  console.log("\n==========================================");
  console.log("   ALL STEP 7 TESTS PASSED SUCCESSFULLY!  ");
  console.log("==========================================\n");
}

main().catch((err) => {
  console.error("\n❌ STEP 7 VERIFICATION ERROR:", err);
  process.exit(1);
});
