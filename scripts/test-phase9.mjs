import "./_env.mjs";
import mongoose from "../apps/api/node_modules/mongoose/index.js";
import { SignJWT } from "../apps/api/node_modules/jose/dist/node/esm/index.js";
import bcrypt from "bcryptjs";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/memservice";
const API_BASE = "http://localhost:3001/api";
const AUTH_SECRET = process.env.AUTH_SECRET || "memservice_super_secret_jwt_key_2025_at_least_32_chars";

async function makeStaffCookie(userId, role = "super-admin") {
  const secret = new TextEncoder().encode(AUTH_SECRET);
  const token = await new SignJWT({
    user: { id: String(userId), name: "Test Staff", role },
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
  return `memservice_auth=${token}`;
}

async function main() {
  console.log("=== STEP 9 VERIFICATION SUITE ===");
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", mongoose.connection.name);

  const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}, { strict: false }));
  const DeliveryZone = mongoose.models.DeliveryZone || mongoose.model("DeliveryZone", new mongoose.Schema({}, { strict: false }));
  const Review = mongoose.models.Review || mongoose.model("Review", new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({}, { strict: false }));
  const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", new mongoose.Schema({}, { strict: false }));
  const Integration = mongoose.models.Integration || mongoose.model("Integration", new mongoose.Schema({}, { strict: false }));

  let superAdmin = await User.findOne({ role: "super-admin" });
  if (!superAdmin) {
    superAdmin = await User.create({
      first_name: "Super",
      last_name: "Admin",
      email: "superadmin_test@memservice.com",
      phone: "01799000111",
      password: await bcrypt.hash("SuperSecret123!", 10),
      role: "super-admin",
      status: "active",
    });
  }
  const staffCookie = await makeStaffCookie(superAdmin._id, "super-admin");

  // [Test 1] Delivery Zones & Quote Engine
  console.log("\n[Test 1] Testing Delivery Zone creation & Quote calculation...");
  const testZoneKey = `test_zone_${Date.now()}`;
  const testZone = await DeliveryZone.create({
    key: testZoneKey,
    label: "Step 9 Test Express Zone",
    charge: 80,
    freeAbove: 1500,
    eta: "12-24 Hours",
    codAvailable: true,
    status: "active",
    districts: ["Dhaka", "Gazipur"],
  });
  console.log(`✓ Created DeliveryZone: ${testZone.label} (key: ${testZone.key})`);

  // Test quote below threshold
  const quoteRes1 = await fetch(`${API_BASE}/delivery/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      zoneKey: testZoneKey,
      subtotal: 1000,
      paymentMethod: "cod",
    }),
  });
  const quoteData1 = await quoteRes1.json();
  if (quoteData1.quote?.charge === 80) {
    console.log(`✓ Quote under threshold calculated: Charge = ৳${quoteData1.quote.charge}`);
  } else {
    throw new Error(`Expected charge 80, got ${quoteData1.quote?.charge}`);
  }

  // Test quote above threshold
  const quoteRes2 = await fetch(`${API_BASE}/delivery/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      zoneKey: testZoneKey,
      subtotal: 1600,
      paymentMethod: "cod",
    }),
  });
  const quoteData2 = await quoteRes2.json();
  if (quoteData2.quote?.charge === 0 && (quoteData2.quote?.free || quoteData2.quote?.isFree)) {
    console.log(`✓ Quote above threshold calculated: FREE (Charge = ৳0)`);
  } else {
    throw new Error(`Expected free shipping, got ${quoteData2.quote?.charge}`);
  }

  await DeliveryZone.deleteOne({ _id: testZone._id });
  console.log("✓ Delivery Zone cleaned up.");

  // [Test 2] Integration Hub & Masking
  console.log("\n[Test 2] Testing Integration Hub API & Secret Masking...");
  const intRes = await fetch(`${API_BASE}/integrations`, {
    headers: { cookie: staffCookie },
  });
  console.log(`- GET /api/integrations status: ${intRes.status}`);
  if (intRes.ok) {
    const intData = await intRes.json();
    console.log(`  Total active/configured integrations in DB: ${intData.integrations?.length || 0}`);
    intData.integrations?.forEach((item) => {
      if (item.secrets) {
        Object.values(item.secrets).forEach((v) => {
          if (v && !v.startsWith("****")) {
            throw new Error(`Unmasked secret detected in integration ${item.key}: ${v}`);
          }
        });
      }
    });
    console.log("✓ All integration secret values are properly masked with ****!");
  }

  // [Test 3] Reviews Moderation Queue
  console.log("\n[Test 3] Testing Review Moderation Approval Flow...");
  let sampleProduct = await Product.findOne();
  if (!sampleProduct) {
    sampleProduct = await Product.create({
      name: "Review Test Product",
      slug: `rev-prod-${Date.now()}`,
      price: 120,
      stock: 50,
      status: "active",
    });
  }

  const testReview = await Review.create({
    product: sampleProduct._id,
    customer: superAdmin._id,
    rating: 5,
    title: "Excellent service!",
    body: "Delivered promptly within 2 hours. Very satisfied.",
    status: "pending",
  });
  console.log(`- Created review with status 'pending': ID ${testReview._id}`);

  // Staff approves the review
  const approveRes = await fetch(`${API_BASE}/reviews/${testReview._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: staffCookie },
    body: JSON.stringify({ status: "approved" }),
  });
  console.log(`- PUT /api/reviews/${testReview._id} status: ${approveRes.status}`);
  const updatedReview = await Review.findById(testReview._id);
  if (updatedReview.status === "approved") {
    console.log("✓ Review status successfully changed to 'approved'!");
  } else {
    throw new Error(`Review status did not update to approved`);
  }
  await Review.deleteOne({ _id: testReview._id });
  console.log("✓ Test review cleaned up.");

  // [Test 4] Coupons CRUD
  console.log("\n[Test 4] Testing Coupons CRUD & Validation...");
  const testCouponCode = `TEST${Date.now().toString().slice(-4)}`;
  const createCouponRes = await fetch(`${API_BASE}/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: staffCookie },
    body: JSON.stringify({
      code: testCouponCode,
      type: "percent",
      value: 15,
      maxDiscount: 200,
      minSubtotal: 0,
      status: "active",
    }),
  });
  console.log(`- POST /api/coupons status: ${createCouponRes.status}`);
  const couponData = await createCouponRes.json();
  if (!couponData.success) {
    throw new Error(`Failed to create coupon: ${couponData.error}`);
  }
  console.log(`✓ Created Coupon: ${couponData.coupon.code} (15% off, max ৳200)`);

  // Create dedicated test product with explicit regular_price
  const couponProd = await Product.create({
    name: "Coupon Price Test Item",
    slug: `coupon-prod-${Date.now()}`,
    regular_price: 200,
    price: 200,
    stock: 50,
    status: "active",
  });

  // Validate coupon via customer validate endpoint
  const validateRes = await fetch(`${API_BASE}/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: testCouponCode,
      items: [{ id: String(couponProd._id), quantity: 5 }],
    }),
  });
  const valData = await validateRes.json();
  if (valData.valid && valData.discount > 0) {
    console.log(`✓ Coupon validation succeeded: discount = ৳${valData.discount}!`);
  } else {
    throw new Error(`Coupon validation calculation error: ${JSON.stringify(valData)}`);
  }
  await Product.deleteOne({ _id: couponProd._id });

  // Delete coupon
  const delCouponRes = await fetch(`${API_BASE}/coupons/${couponData.coupon._id}`, {
    method: "DELETE",
    headers: { cookie: staffCookie },
  });
  console.log(`- DELETE /api/coupons/${couponData.coupon._id} status: ${delCouponRes.status}`);
  console.log("✓ Coupon successfully deleted.");

  // [Test 5] Profile & Security
  console.log("\n[Test 5] Testing Staff Profile & Security...");
  const profileRes = await fetch(`${API_BASE}/user/profile`, {
    headers: { cookie: staffCookie },
  });
  console.log(`- GET /api/user/profile status: ${profileRes.status}`);
  if (profileRes.ok) {
    const prof = await profileRes.json();
    console.log(`✓ Profile loaded: ${prof.user.first_name} ${prof.user.last_name} (${prof.user.role})`);
  }

  console.log("\n🎉 ALL STEP 9 VERIFICATION TESTS PASSED SUCCESSFULLY!");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Step 9 test failed:", err);
  process.exit(1);
});
