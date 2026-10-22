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

// ==========================================
// --- CMS Data Layer & Settings Seeds ---
// ==========================================

// 1. Site Settings (Singleton)
await db.collection("sitesettings").updateOne(
  { key: "site" },
  {
    $set: {
      siteName: "Mem Service",
      tagline: "Genuine Medicines, Healthcare & Consultations Across Bangladesh",
      logoLight: "/assets/logo/logo.png",
      logoDark: "/assets/logo/logo.png",
      favicon: "/favicon.ico",
      contact: {
        phone: "+8801711655686",
        whatsapp: "+8801711655686",
        email: "support@memservice.com",
        address: "Suite #402, Sena Kalyan Bhaban, Motijheel C/A, Dhaka-1000",
        mapUrl: "https://maps.google.com/?q=Motijheel+Dhaka",
        workingHours: "9:00 AM - 10:00 PM (Everyday)",
      },
      social: {
        facebook: "https://facebook.com/memservicebd",
        instagram: "https://instagram.com/memservicebd",
        youtube: "https://youtube.com/@memservicebd",
        tiktok: "",
        x: "",
        linkedin: "https://linkedin.com/company/memservice",
      },
      seo: {
        defaultTitle: "Mem Service - Healthcare, Medicines & Consultations in Bangladesh",
        titleTemplate: "%s | Mem Service",
        defaultDescription: "Order genuine prescription medicines, OTC health products, and book verified specialist doctor consultations online across Bangladesh.",
        ogImage: "/assets/logo/logo.png",
      },
      header: {
        topBarText: "Express delivery inside Dhaka within 24 hours | Call +8801711655686",
        showSearch: true,
        showThemeToggle: true,
      },
      footer: {
        about: "Mem Service provides authentic medicines, medical equipment, and telemedicine consultations with licensed physicians throughout Bangladesh.",
        copyrightText: "Mem Service. All rights reserved.",
        showPaymentBadges: true,
      },
      announcement: {
        text: "Flat 10% discount on all wellness devices this week!",
        link: "/shop?category=Medical%20Devices",
        enabled: true,
      },
      maintenance: {
        enabled: false,
        message: "We are currently undergoing scheduled maintenance. Please check back shortly.",
      },
      updatedAt: now,
    },
    $setOnInsert: { createdAt: now, __v: 0 },
  },
  { upsert: true }
);

// 2. Navigation Menus
const SEED_MENUS = [
  {
    location: "header",
    title: "Main Navigation",
    items: [
      { label: "Home", url: "/", type: "custom", openInNewTab: false, status: "active" },
      { label: "Shop", url: "/shop", type: "custom", openInNewTab: false, status: "active" },
      { label: "Consultation", url: "/consultation/doctor", type: "consultation", openInNewTab: false, status: "active" },
      { label: "Offers", url: "/offer", type: "custom", openInNewTab: false, status: "active" },
    ],
  },
  {
    location: "mobile",
    title: "Mobile Bottom Bar",
    items: [
      { label: "Home", url: "/", type: "custom", status: "active" },
      { label: "Account", url: "/account", type: "custom", status: "active" },
      { label: "Cart", url: "/cart", type: "custom", status: "active" },
      { label: "Wishlist", url: "/wishlist", type: "custom", status: "active" },
      { label: "Shop", url: "/shop", type: "custom", status: "active" },
    ],
  },
  {
    location: "footer-1",
    title: "Company",
    items: [
      { label: "About Us", url: "/about-us", type: "page", status: "active" },
      { label: "Our Doctors", url: "/consultation/doctor", type: "consultation", status: "active" },
      { label: "Privacy Policy", url: "/privacy-policy", type: "page", status: "active" },
      { label: "Terms & Conditions", url: "/terms-and-conditions", type: "page", status: "active" },
    ],
  },
  {
    location: "footer-2",
    title: "Customer Service",
    items: [
      { label: "FAQs", url: "/faq", type: "page", status: "active" },
      { label: "Refund & Return Policy", url: "/refund-and-return-policy", type: "page", status: "active" },
      { label: "My Account", url: "/account", type: "custom", status: "active" },
      { label: "Order Tracking", url: "/account", type: "custom", status: "active" },
    ],
  },
];

for (const menu of SEED_MENUS) {
  await db.collection("menus").updateOne(
    { location: menu.location },
    { $set: { ...menu, updatedAt: now }, $setOnInsert: { createdAt: now, __v: 0 } },
    { upsert: true }
  );
}

// 3. CMS Pages (Migrated legal and informational pages)
const SEED_PAGES = [
  {
    slug: "about-us",
    title: "About Mem Service",
    template: "about",
    status: "published",
    publishedAt: now,
    content: `<h2>About Mem Service BD</h2><p>Mem Service BD is Bangladesh's trusted digital healthcare and medicine delivery platform. Through our digital platform, customers across Bangladesh receive authentic prescription medicines, health essentials, and medical devices directly at their doorstep.</p><p>We partner with top pharmaceutical manufacturers and licensed physicians to guarantee 100% genuine products, affordable prices, and prompt doorstep delivery.</p>`,
    seo: { title: "About Us | Mem Service BD", description: "Learn about Mem Service BD, our mission, genuine medicine delivery, and verified doctor consultations." },
  },
  {
    slug: "terms-and-conditions",
    title: "Terms and Conditions",
    template: "legal",
    status: "published",
    publishedAt: now,
    content: `<h2>Terms of Service</h2><p>By accessing and placing orders through Mem Service BD, you agree to comply with our healthcare fulfillment and telemedicine terms of service. Prescription drugs require a valid prescription from a registered medical practitioner.</p><p>Standard delivery inside Dhaka operates within 12-24 hours. Outside Dhaka orders are securely fulfilled via our partner express couriers.</p>`,
    seo: { title: "Terms and Conditions | Mem Service BD", description: "Terms and conditions governing orders, deliveries, and healthcare consultations on Mem Service BD." },
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    template: "legal",
    status: "published",
    publishedAt: now,
    content: `<h2>Privacy and Data Protection</h2><p>Mem Service BD respects your privacy. All customer health information, medical prescriptions, and transaction data are strictly confidential and protected with enterprise-grade encryption.</p><p>We never share personal or medical records with third-party marketing services.</p>`,
    seo: { title: "Privacy Policy | Mem Service BD", description: "How Mem Service BD protects and manages your personal and health consultation records." },
  },
  {
    slug: "refund-and-return-policy",
    title: "Refund & Return Policy",
    template: "legal",
    status: "published",
    publishedAt: now,
    content: `<h2>Returns & Refunds</h2><p>Customers can request a replacement or return within 48 hours of delivery if a product arrives damaged, unsealed, or incorrect. Unopened wellness items and sealed medical devices are eligible for exchange.</p><p>Due to health safety regulations, opened or temperature-sensitive medicines cannot be returned once accepted.</p>`,
    seo: { title: "Refund & Return Policy | Mem Service BD", description: "Guidelines for returns, exchanges, and refunds at Mem Service BD." },
  },
];

for (const page of SEED_PAGES) {
  await db.collection("pages").updateOne(
    { slug: page.slug },
    { $set: { ...page, updatedAt: now }, $setOnInsert: { createdAt: now, __v: 0 } },
    { upsert: true }
  );
}

// 4. FAQ Groups & FAQs
const generalGroup = await db.collection("faqgroups").findOneAndUpdate(
  { slug: "general" },
  { $set: { title: "General Questions", slug: "general", order: 1, status: "active", updatedAt: now }, $setOnInsert: { createdAt: now, __v: 0 } },
  { upsert: true, returnDocument: "after" }
);

const deliveryGroup = await db.collection("faqgroups").findOneAndUpdate(
  { slug: "delivery" },
  { $set: { title: "Orders & Delivery", slug: "delivery", order: 2, status: "active", updatedAt: now }, $setOnInsert: { createdAt: now, __v: 0 } },
  { upsert: true, returnDocument: "after" }
);

const SEED_FAQS = [
  {
    question: "Are medicines sold on Mem Service authentic?",
    answer: "Yes, 100%. All medicines and medical equipment are procured directly from registered pharmaceutical companies and verified distributors.",
    groupId: generalGroup?._id || null,
    order: 1,
    status: "active",
  },
  {
    question: "How long does delivery take inside Dhaka?",
    answer: "Delivery inside Dhaka takes between 12 to 24 hours. Express same-day delivery is available for urgent orders.",
    groupId: deliveryGroup?._id || null,
    order: 1,
    status: "active",
  },
  {
    question: "Can I pay with Cash on Delivery (COD)?",
    answer: "Yes, Cash on Delivery is available across all 64 districts in Bangladesh.",
    groupId: deliveryGroup?._id || null,
    order: 2,
    status: "active",
  },
];

for (const faq of SEED_FAQS) {
  await db.collection("faqs").updateOne(
    { question: faq.question },
    { $set: { ...faq, updatedAt: now }, $setOnInsert: { createdAt: now, __v: 0 } },
    { upsert: true }
  );
}

// 5. Delivery Zones
const SEED_ZONES = [
  {
    key: "dhaka-inside",
    label: "Inside Dhaka City",
    description: "Standard delivery within Dhaka metropolitan area",
    charge: 60,
    freeAbove: 2000,
    eta: "24-48 Hours",
    etaDaysMin: 1,
    etaDaysMax: 2,
    codAvailable: true,
    allowedPaymentMethods: ["cod", "bkash", "nagad", "sslcommerz"],
    districts: ["Dhaka"],
    areas: ["Mirpur", "Uttara", "Dhanmondi", "Gulshan", "Banani", "Motijheel", "Mohammadpur", "Badda"],
    minOrder: 0,
    status: "active",
    order: 1,
    isDefault: true,
  },
  {
    key: "dhaka-outside",
    label: "Dhaka Suburbs",
    description: "Gazipur, Narayanganj, Savar, Keraniganj",
    charge: 90,
    freeAbove: 2500,
    eta: "48-72 Hours",
    etaDaysMin: 2,
    etaDaysMax: 3,
    codAvailable: true,
    allowedPaymentMethods: ["cod", "bkash", "nagad", "sslcommerz"],
    districts: ["Gazipur", "Narayanganj", "Munshiganj", "Narsingdi", "Manikganj"],
    areas: ["Savar", "Tongi", "Keraniganj"],
    minOrder: 0,
    status: "active",
    order: 2,
    isDefault: false,
  },
  {
    key: "all-bangladesh",
    label: "All Bangladesh (Courier)",
    description: "Nationwide express delivery to any district",
    charge: 120,
    freeAbove: 3000,
    eta: "3-5 Business Days",
    etaDaysMin: 3,
    etaDaysMax: 5,
    codAvailable: true,
    allowedPaymentMethods: ["cod", "bkash", "nagad", "sslcommerz"],
    districts: [],
    areas: [],
    minOrder: 0,
    status: "active",
    order: 3,
    isDefault: false,
  },
];

for (const zone of SEED_ZONES) {
  await db.collection("deliveryzones").updateOne(
    { key: zone.key },
    { $set: { ...zone, updatedAt: now }, $setOnInsert: { createdAt: now, __v: 0 } },
    { upsert: true }
  );
}

// 6. Home Layout (Singleton)
await db.collection("homelayouts").updateOne(
  { key: "home" },
  {
    $set: {
      key: "home",
      sections: [
        { key: "hero", type: "hero_slider", title: "Main Carousel", subtitle: "", enabled: true, order: 1 },
        { key: "categories", type: "category_grid", title: "Shop by Category", subtitle: "Browse health essentials", enabled: true, order: 2 },
        { key: "deals", type: "flash_deals", title: "Limited Time Offers", subtitle: "Save up to 30%", enabled: true, order: 3 },
        { key: "banners", type: "banner_grid", title: "Promotions", subtitle: "", enabled: true, order: 4 },
        { key: "doctors", type: "doctor_consultations", title: "Specialist Consultations", subtitle: "Talk with top doctors online", enabled: true, order: 5 },
        { key: "testimonials", type: "testimonials", title: "What Our Patients Say", subtitle: "Real feedback from genuine customers", enabled: true, order: 6 },
        { key: "features", type: "features_ribbon", title: "Why Choose Us", subtitle: "", enabled: true, order: 7 },
      ],
      updatedAt: now,
    },
    $setOnInsert: { createdAt: now, __v: 0 },
  },
  { upsert: true }
);

// 7. Departments for Consultations
const SEED_DEPTS = [
  { name: "General Medicine", slug: "general-medicine", description: "Internal medicine, fevers, infections & primary health", icon: "Stethoscope", order: 1, status: "active" },
  { name: "Cardiology", slug: "cardiology", description: "Heart health, hypertension & cardiovascular care", icon: "HeartPulse", order: 2, status: "active" },
  { name: "Orthopedics", slug: "orthopedics", description: "Bone joints, fractures & spine management", icon: "Activity", order: 3, status: "active" },
  { name: "Gynecology", slug: "gynecology", description: "Women's health, maternity & reproductive care", icon: "Users", order: 4, status: "active" },
  { name: "Pediatrics", slug: "pediatrics", description: "Child wellness, newborn care & vaccinations", icon: "Smile", order: 5, status: "active" },
  { name: "Dermatology", slug: "dermatology", description: "Skin, hair, allergy & cosmetic dermatology", icon: "Sparkles", order: 6, status: "active" },
];

for (const dept of SEED_DEPTS) {
  await db.collection("departments").updateOne(
    { slug: dept.slug },
    { $set: { ...dept, updatedAt: now }, $setOnInsert: { createdAt: now, __v: 0 } },
    { upsert: true }
  );
}

// 8. Sample Testimonials
const SEED_TESTIMONIALS = [
  { name: "Rafiqul Islam", role: "Patient", company: "Dhaka", content: "I ordered my father's regular cardiac medications at 10 AM, and it arrived by 4 PM sealed with a cooling pack. Exceptional service!", rating: 5, order: 1, status: "active" },
  { name: "Shamima Akhter", role: "Verified Customer", company: "Chittagong", content: "Doctor consultation over video was quick and very detailed. The prescription was instantly available on my profile for medicine ordering.", rating: 5, order: 2, status: "active" },
];

for (const item of SEED_TESTIMONIALS) {
  await db.collection("testimonials").updateOne(
    { name: item.name },
    { $set: { ...item, updatedAt: now }, $setOnInsert: { createdAt: now, __v: 0 } },
    { upsert: true }
  );
}

console.log("\nDashboard accounts (http://localhost:3002/admin-login)");
console.table(USERS.map(({ email, password, role, status }) => ({ email, password, role, status })));
console.log(`catalog: ${added} product(s) added, ${all.length - added} already present`);
console.log(`doctors: ${sampleDoctors.length} sample doctor(s) configured`);
console.log(`cms: SiteSettings, Menus, Pages, FAQs, DeliveryZones (${SEED_ZONES.length}), HomeLayout, and Departments seeded.`);

await mongoose.disconnect();


