import assert from "node:assert";

const API_BASE = process.env.API_URL || "http://localhost:3001";

async function testAppointmentFlow() {
  console.log("🧪 Test 1: Testing Doctor Appointment Booking & Verification...");

  // 1. Fetch available doctor
  const docRes = await fetch(`${API_BASE}/api/doctors`);
  assert.strictEqual(docRes.status, 200, "Doctors list should return 200");
  const doctors = await docRes.json();
  assert.ok(Array.isArray(doctors) && doctors.length > 0, "Should have at least 1 doctor");

  const doctor = doctors[0];
  console.log(`   Found doctor: ${doctor.name} (${doctor.department})`);

  // 2. Book appointment
  const testPhone = "01799887766";
  const preferredDate = new Date();
  preferredDate.setDate(preferredDate.getDate() + 2); // 2 days ahead
  const dateStr = preferredDate.toISOString().split("T")[0];

  const bookRes = await fetch(`${API_BASE}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doctorId: doctor._id,
      patient: {
        name: "Test Patient Phase 12",
        phone: testPhone,
        age: 35,
        gender: "male",
      },
      preferredDate: dateStr,
      preferredSlot: "morning",
      notes: "Automated verification test appointment",
      source: "storefront",
    }),
  });

  const bookData = await bookRes.json();
  assert.strictEqual(bookRes.status, 201, `Booking should return 201: ${bookData.message}`);
  assert.ok(bookData.success, "Booking success should be true");
  assert.ok(bookData.referenceCode || bookData.appointment?._id, "Should return referenceCode");

  const refCode = bookData.referenceCode || bookData.appointment?.referenceCode || bookData.appointment?._id;
  console.log(`   ✅ Appointment booked successfully. Reference: ${refCode}`);

  // 3. Lookup appointment by reference and phone
  const lookupRes = await fetch(
    `${API_BASE}/api/appointments/${encodeURIComponent(refCode)}?phone=${encodeURIComponent(testPhone)}`
  );
  assert.strictEqual(lookupRes.status, 200, "Lookup should return 200 with matching phone");
  const lookupData = await lookupRes.json();
  assert.ok(lookupData.success, "Lookup success should be true");
  assert.strictEqual(lookupData.appointment?.patient?.name, "Test Patient Phase 12");
  console.log(`   ✅ Appointment lookup verified: status = ${lookupData.appointment?.status}`);
}

async function testGuestTracking() {
  console.log("\n🧪 Test 2: Testing Guest Order Tracking Endpoint...");

  // Lookup existing order from DB
  const trackRes = await fetch(`${API_BASE}/api/orders/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderNumber: "MS-INVALID-9999",
      phone: "01711000000",
    }),
  });

  // Should return 404 cleanly for invalid order without throwing 500
  assert.strictEqual(trackRes.status, 404, "Invalid order number should return 404");
  const trackData = await trackRes.json();
  assert.strictEqual(trackData.success, false);
  console.log(`   ✅ Invalid tracking returns clean 404: "${trackData.message}"`);
}

async function testCmsPages() {
  console.log("\n🧪 Test 3: Testing CMS Policy Pages (/api/cms/pages/...)...");
  const slugs = ["about-us", "terms-and-conditions", "privacy-policy", "refund-and-return-policy", "faq"];

  for (const slug of slugs) {
    const res = await fetch(`${API_BASE}/api/cms/pages/${slug}`);
    assert.strictEqual(res.status, 200, `CMS page /api/cms/pages/${slug} should return 200`);
    const data = await res.json();
    assert.ok(data.page?.title, `Page ${slug} should have a title`);
    console.log(`   ✅ CMS Page [${slug}]: "${data.page.title}" (${data.page.content?.length || 0} bytes)`);
  }
}

async function run() {
  console.log("🚀 Starting Step 12 Verification Tests...\n");
  await testAppointmentFlow();
  await testGuestTracking();
  await testCmsPages();
  console.log("\n🎉 Step 12 Functional Tests Passed Successfully!\n");
}

run().catch((err) => {
  console.error("❌ Step 12 Test Failed:", err);
  process.exit(1);
});
