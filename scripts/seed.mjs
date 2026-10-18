// Idempotent local seed: role-based dashboard users + a small sample catalog.
//   pnpm db:seed
// Safe to re-run: users are upserted (passwords reset to the values below),
// catalog documents are only inserted when missing.
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { root } from "./_env.mjs";
import { migrateUsers } from "./migrate-users-email-login.mjs";

const uri = process.env.MONGODB_CONNECTION_STRING;
if (!uri) throw new Error("MONGODB_CONNECTION_STRING is not set in .env");

// Local development accounts only. Never seed these into a real environment.
const USERS = [
  { role: "super-admin", status: "active", password: "SuperAdmin@123", first_name: "Sara", last_name: "Super", email: "superadmin@memservice.local", phone: "01700000001" },
  { role: "admin", status: "active", password: "Admin@12345", first_name: "Adam", last_name: "Admin", email: "admin@memservice.local", phone: "01700000002" },
  { role: "manager", status: "active", password: "Manager@123", first_name: "Mia", last_name: "Manager", email: "manager@memservice.local", phone: "01700000003" },
  // Negative tests: these two must be refused by the dashboard login.
  { role: "manager", status: "inactive", password: "Inactive@123", first_name: "Ian", last_name: "Inactive", email: "inactive@memservice.local", phone: "01700000004" },
  { role: "user", status: "active", password: "User@12345", first_name: "Uma", last_name: "User", email: "user@memservice.local", phone: "01700000005" },
];

await mongoose.connect(uri);
const db = mongoose.connection.db;
const now = new Date();

// Run schema and index migration first
await migrateUsers(db);

// --- dashboard users (model: apps/admin/app/models/user-model.js) ---
for (const { password, role, status, ...u } of USERS) {
  await db.collection("users").updateOne(
    { email: u.email },
    {
      // role/status/password are always reset so re-seeding restores a known state
      $set: { password: await bcrypt.hash(password, 10), role, status, updatedAt: now },
      $setOnInsert: { ...u, createdAt: now, __v: 0 },
      $unset: { username: "" },
    },
    { upsert: true }
  );
}

// --- catalog ---
const findOrCreate = async (coll, key, doc) => {
  const found = await db.collection(coll).findOne({ [key]: doc[key] });
  if (found) return found._id;
  const { insertedId } = await db.collection(coll).insertOne({ ...doc, createdAt: now, updatedAt: now, __v: 0 });
  return insertedId;
};

const categories = {};
for (const name of ["Medicine", "Medical Devices", "Personal Care"]) {
  categories[name] = await findOrCreate("categories", "categoryName", { categoryName: name, brandList: [] });
}

const brands = {};
for (const [title, category] of [
  ["PharmaTech", "Medicine"],
  ["Wellness Pharma", "Medicine"],
  ["CareMed", "Medical Devices"],
]) {
  brands[title] = await findOrCreate("brands", "title", { title, status: "active", category: categories[category], product: [] });
  await db.collection("categories").updateOne({ _id: categories[category] }, { $addToSet: { brandList: brands[title] } });
}

// Images shipped with the storefront (apps/web/public/assets); real images come from Cloudinary via the dashboard.
const IMAGES = ["/assets/packaging.jpg", "/assets/phone.jpg", "/assets/04.jpg"];

const sample = JSON.parse(fs.readFileSync(path.join(root, "apps/api/memservice.products.json"), "utf8"));
const extra = [
  ["Digital Thermometer", "CareMed", "Medical Devices", "Device", 450, 380, { is_new: true, top_seller: true }],
  ["Blood Pressure Monitor", "CareMed", "Medical Devices", "Device", 2800, 2400, { is_trending: true, best_seller: true }],
  ["Paracetamol 500mg Tablets", "Wellness Pharma", "Medicine", "Analgesic", 40, 35, { is_offer: true, best_seller: true }],
  ["Vitamin C 1000mg", "PharmaTech", "Personal Care", "Supplement", 600, 520, { is_new: true, is_trending: true }],
].map(([name, brand, category, products_type, regular, discount, flags], i) => ({
  _id: { $oid: new mongoose.Types.ObjectId().toHexString() },
  name, manufacturer_name: brand, products_type, generic_name: name.split(" ")[0], strength: "", pack_size: ["1 pack"],
  brand, category, color: [], regular_price: String(regular), discount_price: String(discount), purchase_price: String(Math.round(discount * 0.7)),
  short_description: `${name} - genuine product from ${brand}.`, product_features: [], additional_info: "", specificationsHtml: "",
  special_tag: "", tags: [products_type.toLowerCase()], status: "active", stock: 100, sold_out: 0,
  is_new: false, is_trending: false, is_offer: false, top_seller: false, best_seller: false, ...flags, _seedExtra: i,
}));

let added = 0;
const all = [...sample.map((p) => ({ ...p, brand: "PharmaTech", category: "Medicine" })), ...extra];
for (const [i, p] of all.entries()) {
  const { _id, reviews, _seedExtra, brand, category, ...rest } = p;
  const doc = { ...rest, brand: brands[brand], category: categories[category], images: [IMAGES[i % IMAGES.length]] };
  // Extra products get a stable id derived from their name so re-runs do not duplicate them.
  const existing = await db.collection("products").findOne({ name: doc.name });
  if (existing) {
    await db.collection("products").updateOne({ _id: existing._id }, { $set: { images: doc.images, brand: doc.brand, category: doc.category } });
    continue;
  }
  await db.collection("products").insertOne({
    _id: new mongoose.Types.ObjectId(_id.$oid), ...doc, createdAt: now, updatedAt: now, __v: 0,
  });
  added++;
}

// --- promotional banners (storefront shows 3 + 2) ---
const firstProduct = await db.collection("products").findOne({}, { sort: { createdAt: 1 } });
const bannerImages = ["/assets/banner/banner1.jpg", "/assets/banner/banner2.jpg", "/assets/banner/banner3.jpg"];
for (const [i, image] of bannerImages.entries()) {
  const title = `Sample banner ${i + 1}`;
  if (!(await db.collection("banners").findOne({ title }))) {
    await db.collection("banners").insertOne({ title, image, productId: firstProduct._id, description: "Sample promotional banner" });
  }
}

// --- sample doctor categories & doctors (idempotent) ---
const docCategories = [
  { id: 1, categoryName: "General Medicine", specialties: ["Internal Medicine", "Family Medicine"] },
  { id: 2, categoryName: "Cardiology", specialties: ["Interventional Cardiology", "Electrophysiology"] },
  { id: 3, categoryName: "Orthopedics", specialties: ["Orthopedic Surgery", "Trauma"] },
  { id: 4, categoryName: "Gynecology", specialties: ["Obstetrics & Gynecology"] },
];

for (const cat of docCategories) {
  await db.collection("doccategories").updateOne(
    { id: cat.id },
    { $set: cat },
    { upsert: true }
  );
}

const sampleDoctors = [
  {
    name: "Dr. Farhan Ahmed",
    degree: "MBBS, FCPS (Cardiology)",
    contract_number: 8801711000001,
    available_day: "Sat - Thu",
    department: "Cardiology",
    specialty: "Interventional Cardiology",
    experience: 12,
    hospital_name: "Dhaka Medical College Hospital",
    bmdc_number: 10452,
    consultation_fee: 1000,
    follow_up_fee: 500,
    doctor_code: "DOC-001",
    doctor_info: "Senior Consultant in Cardiology with over a decade of clinical experience in interventional cardiac procedures.",
    status: "active",
  },
  {
    name: "Dr. Nusrat Jahan",
    degree: "MBBS, FCPS (Medicine)",
    contract_number: 8801711000002,
    available_day: "Sun - Thu",
    department: "General Medicine",
    specialty: "Internal Medicine",
    experience: 8,
    hospital_name: "Square Hospital",
    bmdc_number: 12890,
    consultation_fee: 800,
    follow_up_fee: 400,
    doctor_code: "DOC-002",
    doctor_info: "Specialist in internal medicine and chronic disease management.",
    status: "active",
  },
  {
    name: "Dr. Tanvir Hossain",
    degree: "MBBS, MS (Orthopedics)",
    contract_number: 8801711000003,
    available_day: "Mon - Fri",
    department: "Orthopedics",
    specialty: "Orthopedic Surgery",
    experience: 15,
    hospital_name: "Apollo Hospitals Dhaka",
    bmdc_number: 9541,
    consultation_fee: 1200,
    follow_up_fee: 600,
    doctor_code: "DOC-003",
    doctor_info: "Expert orthopedic surgeon specializing in trauma and joint reconstruction.",
    status: "active",
  },
  {
    name: "Dr. Sabrina Rahman",
    degree: "MBBS, DGO, FCPS (Gynecology)",
    contract_number: 8801711000004,
    available_day: "Sat - Wed",
    department: "Gynecology",
    specialty: "Obstetrics & Gynecology",
    experience: 10,
    hospital_name: "United Hospital",
    bmdc_number: 11234,
    consultation_fee: 900,
    follow_up_fee: 450,
    doctor_code: "DOC-004",
    doctor_info: "Experienced gynecologist and obstetrician dedicated to maternal and women's health.",
    status: "active",
  },
];

for (const doc of sampleDoctors) {
  await db.collection("doctors").updateOne(
    { doctor_code: doc.doctor_code },
    { $set: { ...doc, updatedAt: now }, $setOnInsert: { createdAt: now, __v: 0 } },
    { upsert: true }
  );
}

console.log("\nDashboard accounts (http://localhost:3002/admin-login)");
console.table(USERS.map(({ email, password, role, status }) => ({ email, password, role, status })));
console.log(`catalog: ${added} product(s) added, ${all.length - added} already present`);
console.log(`doctors: ${sampleDoctors.length} sample doctor(s) configured`);

await mongoose.disconnect();

