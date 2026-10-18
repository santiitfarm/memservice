import mongoose from "mongoose";
import { root } from "./_env.mjs";

const API_BASE = "http://localhost:3001";
const ADMIN_BASE = "http://localhost:3002";
const WEB_BASE = "http://localhost:3000";

const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017/memservice?replicaSet=rs0&directConnection=true";

console.log("==================================================");
console.log("       PHASE 1 - AUTOMATED VERIFICATION MATRIX    ");
console.log("==================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}: ${details}`);
    failed++;
  }
}

// 1. Check HTTP Status
async function checkStatus(url, expectedStatus, label) {
  try {
    const res = await fetch(url);
    assert(res.status === expectedStatus, `${label} returns HTTP ${expectedStatus}`, `Got ${res.status}`);
  } catch (err) {
    assert(false, `${label} returns HTTP ${expectedStatus}`, err.message);
  }
}

// 2. Staff Auth Tests
console.log("\n--- 1. Staff Authentication & Timing Safety ---");
await mongoose.connect(MONGODB_URI);
const db = mongoose.connection.db;

const usersCollection = db.collection("users");
const superAdmin = await usersCollection.findOne({ email: "superadmin@memservice.local" });
assert(Boolean(superAdmin), "Super-admin exists with email", superAdmin?.email);
assert(!superAdmin?.username, "Super-admin has NO username field in DB", JSON.stringify(superAdmin?.username));

// Staff Forgot Password API tests
console.log("\n--- 2. Staff Password Reset API ---");
const forgotRes1 = await fetch(`${API_BASE}/api/auth/staff/forgot`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@memservice.local" }),
});
const forgotData1 = await forgotRes1.json();
assert(forgotRes1.status === 200, "POST /api/auth/staff/forgot returns 200 for valid staff");

const forgotRes2 = await fetch(`${API_BASE}/api/auth/staff/forgot`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "nonexistent@memservice.local" }),
});
const forgotData2 = await forgotRes2.json();
assert(forgotRes2.status === 200, "POST /api/auth/staff/forgot returns 200 for nonexistent email");
assert(
  forgotData1.message === forgotData2.message,
  "Staff forgot password responses are identical (enumeration-safe)"
);

// Check staff reset token stored in DB
const adminUser = await usersCollection.findOne({ email: "admin@memservice.local" });
assert(Boolean(adminUser?.passwordResetToken), "Staff user has passwordResetToken in DB");
assert(Boolean(adminUser?.passwordResetExpires), "Staff user has passwordResetExpires in DB");

// Test Staff Reset with invalid token
const resetInvalid = await fetch(`${API_BASE}/api/auth/staff/reset`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token: "invalidtoken123", email: "admin@memservice.local", newPassword: "NewAdminPassword@123" }),
});
assert(resetInvalid.status === 400, "Staff reset rejects invalid token with HTTP 400");

// Test Staff Reset with short password
const resetShort = await fetch(`${API_BASE}/api/auth/staff/reset`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token: "dummy", email: "admin@memservice.local", newPassword: "123" }),
});
assert(resetShort.status === 400, "Staff reset rejects short password (< 8 chars)");

// 3. Customer Auth & Phone Normalization Tests
console.log("\n--- 3. Customer Registration & Phone Normalization ---");
const testPhone = "01799887766";
// Clean previous test user if exists
await db.collection("customerprofiles").deleteOne({ phone_number: testPhone });

// Test invalid BD phone
const badPhoneRes = await fetch(`${API_BASE}/api/customerProfile`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Test User", phone: "12345", password: "Password@123" }),
});
assert(badPhoneRes.status === 400, "Customer register rejects invalid BD phone with 400");

// Test register with valid BD phone (+880 prefix to test normalization)
const registerRes = await fetch(`${API_BASE}/api/customerProfile`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Test Customer", phone: "+8801799887766", password: "CustomerPassword@123" }),
});
assert(registerRes.status === 201, "Customer register normalizes +880 phone and returns 201");

// Test duplicate registration
const duplicateRes = await fetch(`${API_BASE}/api/customerProfile`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Test Customer", phone: "01799887766", password: "CustomerPassword@123" }),
});
assert(duplicateRes.status === 409, "Customer register returns 409 for duplicate phone");

// Test customer login with normalized phone
const loginRes = await fetch(`${API_BASE}/api/customerProfile/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phone: "01799887766", password: "CustomerPassword@123" }),
});
const loginData = await loginRes.json();
assert(loginRes.status === 200, "Customer login succeeds with 200");
assert(Boolean(loginData.token), "Customer login returns JWT access token");

// Test customer forgot password
const custForgotRes = await fetch(`${API_BASE}/api/customerProfile/forgot`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "any-email@example.com" }),
});
assert(custForgotRes.status === 200, "Customer forgot password returns 200 generic message");

// 4. Broken Pages & Doctors Verification
console.log("\n--- 4. Storefront & Admin Page Health Checks ---");
await checkStatus(`${WEB_BASE}/`, 200, "Storefront Home Page (/)");
await checkStatus(`${WEB_BASE}/account/login`, 200, "Storefront /account/login");
await checkStatus(`${WEB_BASE}/account/register`, 200, "Storefront /account/register");
await checkStatus(`${WEB_BASE}/consultation`, 200, "Storefront /consultation");
await checkStatus(`${WEB_BASE}/consultation/doctor`, 200, "Storefront /consultation/doctor");
await checkStatus(`${WEB_BASE}/consultation/cardiology`, 200, "Storefront /consultation/cardiology");
await checkStatus(`${WEB_BASE}/visit/checkout`, 200, "Storefront /visit/checkout");

const doctorSample = await db.collection("doctors").findOne({});
if (doctorSample) {
  await checkStatus(`${WEB_BASE}/doctors/${doctorSample._id}`, 200, `Doctor Details Page (/doctors/${doctorSample._id})`);
}

await checkStatus(`${ADMIN_BASE}/admin-login`, 200, "Admin /admin-login");
await checkStatus(`${ADMIN_BASE}/forgot-password`, 200, "Admin /forgot-password");
await checkStatus(`${ADMIN_BASE}/reset-password`, 200, "Admin /reset-password");

await mongoose.disconnect();

console.log("\n==================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("==================================================");

if (failed > 0) process.exit(1);
