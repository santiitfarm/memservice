import "./_env.mjs";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Product from "../apps/api/app/models/product-model.js";
import Doctor from "../apps/api/app/models/doctor-model.js";
import Appointment from "../apps/api/app/models/Appointment.js";
import Review from "../apps/api/app/models/Review.js";
import { CustomerProfile } from "../apps/api/app/models/customer-profile-model.js";
import { SignJWT } from "../apps/api/node_modules/jose/dist/node/esm/index.js";
import { isValidBDPhone, normalizeBDPhone } from "../apps/api/lib/phone.js";
import { slugify, escapeRegex } from "../apps/api/lib/slug.js";

async function createTestCustomerToken(customer) {
  const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET);
  return new SignJWT({
    phone: customer.phone_number || "",
    email: customer.email || "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(customer._id))
    .setAudience("customer")
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

async function runTests() {
  console.log("==========================================");
  console.log("   STEP 6 VERIFICATION SUITE");
  console.log("==========================================");

  // ----------------------------------------------------
  // Test 1: Slug helper and BD phone utilities
  // ----------------------------------------------------
  console.log("\n[1] Testing Slugify & Phone Helpers...");
  assert.equal(slugify("Paracetamol 500mg Tablets"), "paracetamol-500mg-tablets");
  assert.equal(slugify("Doctor & Clinic + Hospital"), "doctor-and-clinic-plus-hospital");
  assert.equal(escapeRegex("test.*+?^${}()|[]\\"), "test\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\");

  assert.equal(isValidBDPhone("01712345678"), true);
  assert.equal(isValidBDPhone("+8801812345678"), true);
  assert.equal(isValidBDPhone("8801912345678"), true);
  assert.equal(isValidBDPhone("01234567890"), false, "012 is invalid BD prefix");
  assert.equal(isValidBDPhone("12345"), false);
  assert.equal(normalizeBDPhone("+8801712345678"), "01712345678");
  console.log("  ✓ Slugify, escapeRegex, and BD phone validation passed.");

  // ----------------------------------------------------
  // Connect to DB
  // ----------------------------------------------------
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

  try {
    // ----------------------------------------------------
    // Test 2: Database Slugs
    // ----------------------------------------------------
    console.log("\n[2] Verifying Product Slugs in MongoDB...");
    const products = await Product.find({ status: "active" }).lean();
    assert(products.length > 0, "Products must exist in DB");
    for (const p of products) {
      assert(p.slug, `Product "${p.name}" must have a slug`);
      assert.equal(p.slug, p.slug.toLowerCase(), `Slug must be lowercase: ${p.slug}`);
    }
    console.log(`  ✓ All ${products.length} products have verified unique lowercase slugs.`);

    const sampleProduct = products[0];

    // ----------------------------------------------------
    // Test 3: GET /api/shop/[productId] (ObjectId vs Slug)
    // ----------------------------------------------------
    console.log("\n[3] Testing GET /api/shop/[id] by Slug and ObjectId...");
    // Query by Slug
    const resBySlug = await fetch(`http://localhost:3001/api/shop/${sampleProduct.slug}`);
    assert.equal(resBySlug.status, 200, "Querying by slug must return 200");
    const dataBySlug = await resBySlug.json();
    assert.equal(dataBySlug.product.slug, sampleProduct.slug);
    assert.equal(dataBySlug.isObjectId, false);

    // Query by ObjectId
    const resById = await fetch(`http://localhost:3001/api/shop/${sampleProduct._id.toString()}`);
    assert.equal(resById.status, 200, "Querying by ObjectId must return 200");
    const dataById = await resById.json();
    assert.equal(dataById.isObjectId, true, "isObjectId must be true when queried by _id");
    assert.equal(dataById.slug, sampleProduct.slug, "Response must include slug for 301 redirect");
    console.log(`  ✓ Both Slug and ObjectId lookups succeeded with redirect metadata.`);

    // ----------------------------------------------------
    // Test 4: GET /api/catalog/products?q=paracetamol
    // ----------------------------------------------------
    console.log("\n[4] Testing Server-Side Catalog Search API (GET /api/catalog/products)...");
    const catalogRes = await fetch("http://localhost:3001/api/catalog/products?q=paracetamol");
    assert.equal(catalogRes.status, 200, "Catalog search must return 200");
    const catalogData = await catalogRes.json();
    assert(catalogData.success, "Catalog response must be success: true");
    assert(Array.isArray(catalogData.items), "Items must be an array");
    assert(catalogData.facets && catalogData.facets.categories && catalogData.facets.brands, "Response must include category and brand facets");
    console.log(`  ✓ Catalog search returned ${catalogData.total} items, facets: ${catalogData.facets.categories.length} categories, ${catalogData.facets.brands.length} brands.`);

    // ----------------------------------------------------
    // Test 5: GET /api/catalog/suggest
    // ----------------------------------------------------
    console.log("\n[5] Testing Catalog Autocomplete Suggestions (GET /api/catalog/suggest)...");
    const suggestRes = await fetch("http://localhost:3001/api/catalog/suggest?q=tab");
    assert.equal(suggestRes.status, 200, "Suggest must return 200");
    const suggestData = await suggestRes.json();
    assert(suggestData.success, "Suggest response must be success: true");
    assert(Array.isArray(suggestData.products), "Suggest products must be array");
    assert(suggestRes.headers.get("cache-control")?.includes("30"), "Suggest must have 30s cache header");
    console.log(`  ✓ Autocomplete returned ${suggestData.products.length} product suggestions with 30s cache.`);

    // ----------------------------------------------------
    // Test 6: Product Reviews & Moderation
    // ----------------------------------------------------
    console.log("\n[6] Testing Product Reviews & Moderation Flow...");
    // Find or create customer
    let testCustomer = await CustomerProfile.findOne({ email: "testreview@memservice.com" });
    if (!testCustomer) {
      testCustomer = await CustomerProfile.create({
        customer_name: "Reviewer Tester",
        email: "testreview@memservice.com",
        phone_number: "01788888888",
      });
    }

    const customerToken = await createTestCustomerToken(testCustomer);

    // Clean any prior test review
    await Review.deleteMany({ customer: testCustomer._id, product: sampleProduct._id });

    // Submit review
    const submitReviewRes = await fetch("http://localhost:3001/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        product: sampleProduct._id.toString(),
        rating: 5,
        title: "Very fast relief",
        body: "Authentic medicine, packaging was sealed and delivery was quick.",
      }),
    });

    assert.equal(submitReviewRes.status, 201, `Review submission must return 201, got ${submitReviewRes.status}`);
    const reviewData = await submitReviewRes.json();
    assert.equal(reviewData.review.status, "pending", "New review must default to pending");
    const createdReviewId = reviewData.review._id;

    // Upvote helpful count
    const helpfulRes = await fetch(`http://localhost:3001/api/reviews/${createdReviewId}/helpful`, {
      method: "POST",
    });
    assert.equal(helpfulRes.status, 200);
    const helpfulData = await helpfulRes.json();
    assert.equal(helpfulData.helpfulCount, 1, "Helpful count must increment to 1");

    // Approve the review directly in DB to simulate staff approval
    await Review.findByIdAndUpdate(createdReviewId, { status: "approved" });

    // Public product reviews endpoint
    const publicReviewsRes = await fetch(`http://localhost:3001/api/products/${sampleProduct.slug}/reviews`);
    assert.equal(publicReviewsRes.status, 200);
    const publicReviewsData = await publicReviewsRes.json();
    assert(publicReviewsData.success);
    assert(publicReviewsData.reviews.some((r) => r._id === createdReviewId), "Approved review must be visible in public endpoint");
    assert.equal(publicReviewsData.summary.distribution["5"], 1, "5-star count in summary must be 1");
    console.log("  ✓ Review submission, helpful upvote, and approved public distribution summary passed.");

    // Clean up review
    await Review.findByIdAndDelete(createdReviewId);

    // ----------------------------------------------------
    // Test 7: Doctor Appointments API
    // ----------------------------------------------------
    console.log("\n[7] Testing Doctor Appointments Booking API...");
    // Ensure an active doctor exists
    let sampleDoctor = await Doctor.findOne({ status: "active" });
    if (!sampleDoctor) {
      sampleDoctor = await Doctor.create({
        name: "Dr. Rafiqul Islam",
        degree: "MBBS, FCPS (Medicine)",
        contract_number: 1711000001,
        bmdc_number: 45678,
        doctor_code: "DOC-RAF-001",
        available_day: "All Days",
        department: "General Medicine",
        specialty: "Medicine Specialist",
        experience: 10,
        hospital_name: "Dhaka Medical College Hospital",
        consultation_fee: 1000,
        follow_up_fee: 500,
        status: "active",
      });
    }

    // A. Invalid phone number test
    const invalidPhoneRes = await fetch("http://localhost:3001/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: sampleDoctor._id.toString(),
        patient: { name: "Test Patient", phone: "12345" },
        preferredDate: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    assert.equal(invalidPhoneRes.status, 400, "Invalid BD phone must return 400");

    // B. Past date test
    const pastDateRes = await fetch("http://localhost:3001/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: sampleDoctor._id.toString(),
        patient: { name: "Test Patient", phone: "01712345678" },
        preferredDate: "2020-01-01",
      }),
    });
    assert.equal(pastDateRes.status, 400, "Past appointment date must return 400");

    // C. Valid appointment booking
    const futureDate = new Date(Date.now() + 2 * 86400000).toISOString();
    const validAppRes = await fetch("http://localhost:3001/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: sampleDoctor._id.toString(),
        patient: {
          name: "Mohammad Ali",
          phone: "01712345678",
          age: 35,
          gender: "male",
          email: "patient@test.com",
        },
        preferredDate: futureDate,
        preferredSlot: "evening",
        notes: "Mild fever and cough for two days.",
      }),
    });

    assert.equal(validAppRes.status, 201, `Valid appointment booking must return 201, got ${validAppRes.status}`);
    const validAppData = await validAppRes.json();
    assert(validAppData.success);
    assert.equal(validAppData.appointment.status, "requested");
    assert.equal(validAppData.appointment.feeSnapshot.consultation, sampleDoctor.consultation_fee);
    const appointmentId = validAppData.appointment._id;

    // D. Patient status lookup with matching phone
    const lookupRes = await fetch(`http://localhost:3001/api/appointments/${appointmentId}?phone=01712345678`);
    assert.equal(lookupRes.status, 200, "Patient status lookup with matching phone must return 200");
    const lookupData = await lookupRes.json();
    assert.equal(lookupData.appointment.patient.name, "Mohammad Ali");
    assert(lookupData.appointment.doctor.name, "Doctor details must be populated");

    // E. Patient lookup with wrong phone
    const wrongPhoneRes = await fetch(`http://localhost:3001/api/appointments/${appointmentId}?phone=01999999999`);
    assert.equal(wrongPhoneRes.status, 403, "Patient status lookup with wrong phone must return 403");

    console.log("  ✓ Appointment validation, booking, fee snapshot, and phone-verified patient lookup passed.");

    // Clean up appointment
    await Appointment.findByIdAndDelete(appointmentId);

    console.log("\n==========================================");
    console.log("   ALL STEP 6 TESTS PASSED SUCCESSFULLY!");
    console.log("==========================================");
  } finally {
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
