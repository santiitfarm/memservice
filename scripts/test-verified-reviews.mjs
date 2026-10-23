import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { SignJWT } from "../apps/api/node_modules/jose/dist/node/esm/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
nextEnv.loadEnvConfig(path.resolve(__dirname, ".."));

async function main() {
  const API_BASE = "http://localhost:3001/api";
  const uri = process.env.MONGODB_CONNECTION_STRING;
  const authSecret = new TextEncoder().encode(
    process.env.AUTH_SECRET || "memservice_super_secret_jwt_key_2025_at_least_32_chars"
  );

  await mongoose.connect(uri);
  const productsCol = mongoose.connection.collection("products");
  const customersCol = mongoose.connection.collection("customerprofiles");
  const ordersCol = mongoose.connection.collection("orders");
  const reviewsCol = mongoose.connection.collection("reviews");
  const usersCol = mongoose.connection.collection("users");

  const product = await productsCol.findOne({});
  if (!product) throw new Error("No product found in DB");

  // Create a non-buyer customer token
  const nonBuyerId = new mongoose.Types.ObjectId();
  await customersCol.insertOne({
    _id: nonBuyerId,
    customer_name: "Non Buyer Customer",
    email: `nonbuyer_${Date.now()}@example.com`,
  });

  const nonBuyerToken = await new SignJWT({
    phone: "01700000000",
    email: "nonbuyer@example.com",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(nonBuyerId))
    .setAudience("customer")
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(authSecret);

  console.log("\n[Test 1] Testing Non-Buyer Review Submission...");
  const nonBuyerRes = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${nonBuyerToken}`,
    },
    body: JSON.stringify({
      product: product._id.toString(),
      rating: 5,
      title: "Should Fail",
      body: "I have not bought this product.",
    }),
  });

  const nonBuyerData = await nonBuyerRes.json();
  console.log(`- Status: ${nonBuyerRes.status} (expected 403)`);
  console.log(`- Code: ${nonBuyerData.code} (expected VERIFIED_PURCHASE_REQUIRED)`);
  console.log(`- Message: ${nonBuyerData.message}`);

  if (nonBuyerRes.status !== 403 || nonBuyerData.code !== "VERIFIED_PURCHASE_REQUIRED") {
    throw new Error("Verified buyer constraint failed: non-buyer was not rejected with 403");
  }
  console.log("✓ Non-buyer review correctly blocked with 403 Forbidden!");

  // Create staff cookie for moderation
  const staffUser =
    (await usersCol.findOne({ role: "super-admin" })) ||
    (await usersCol.findOne({ role: "admin" })) ||
    (await usersCol.findOne({}));

  const staffToken = await new SignJWT({
    user: { id: String(staffUser._id), name: "Staff Admin", role: staffUser.role || "super-admin" },
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(authSecret);

  console.log("\n[Test 2] Testing Admin Homepage Toggle on Existing Review...");
  const existingReview = await reviewsCol.findOne({});
  if (!existingReview) throw new Error("No existing review found");

  const toggleRes = await fetch(`${API_BASE}/reviews/${existingReview._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: `memservice_auth=${staffToken}`,
    },
    body: JSON.stringify({
      showOnHome: true,
      status: "approved",
    }),
  });

  const toggleData = await toggleRes.json();
  console.log(`- Status: ${toggleRes.status} (expected 200)`);
  console.log(`- Success: ${toggleData.success}, showOnHome: ${toggleData.review?.showOnHome}`);

  if (!toggleData.success || toggleData.review?.showOnHome !== true) {
    throw new Error("Admin review toggle failed");
  }
  console.log("✓ Admin review showOnHome toggle succeeded!");

  console.log("\n[Test 3] Testing CMS Home Endpoint...");
  const cmsRes = await fetch(`${API_BASE}/cms/home`);
  const cmsData = await cmsRes.json();
  console.log(`- Brands count: ${cmsData.home?.brands?.length}`);
  console.log(`- Testimonials count: ${cmsData.home?.testimonials?.length}`);
  console.log(`- First brand: ${cmsData.home?.brands?.[0]?.title}`);
  console.log(`- First testimonial product: ${cmsData.home?.testimonials?.[0]?.product?.name}`);

  // Clean up test customer
  await customersCol.deleteOne({ _id: nonBuyerId });

  await mongoose.disconnect();
  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY 100%!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
