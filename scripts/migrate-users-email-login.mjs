// Idempotent migration: drops username index & compound index, unsets username,
// normalizes emails to lowercase, checks for duplicates, and ensures email & phone unique indexes.
//   pnpm db:migrate
import mongoose from "mongoose";
import { fileURLToPath, pathToFileURL } from "node:url";
import { root } from "./_env.mjs";

export async function migrateUsers(db) {
  const collections = await db.listCollections({ name: "users" }).toArray();
  if (collections.length === 0) {
    console.log("[migrate-users] 'users' collection does not exist yet. Skipping index drop.");
    return;
  }

  const usersCollection = db.collection("users");
  const indexes = await usersCollection.indexes();

  // 1. Drop username and old compound indexes if present
  for (const idx of indexes) {
    const isUsername = idx.name === "username_1" || (idx.key && idx.key.username === 1 && Object.keys(idx.key).length === 1);
    const isCompound = idx.key && idx.key.username && idx.key.email && idx.key.phone;
    if (isUsername || isCompound) {
      console.log(`[migrate-users] Dropping legacy index: ${idx.name}`);
      try {
        await usersCollection.dropIndex(idx.name);
      } catch (err) {
        console.warn(`[migrate-users] Warning: Failed to drop index ${idx.name}:`, err.message);
      }
    }
  }

  // 2. Normalize emails and phones, unset username, check for duplicates
  const allUsers = await usersCollection.find({}).toArray();
  const emailCounts = new Map();
  const phoneCounts = new Map();

  for (const u of allUsers) {
    const normalizedEmail = (u.email || "").trim().toLowerCase();
    const normalizedPhone = (u.phone || "").trim();

    if (normalizedEmail) {
      emailCounts.set(normalizedEmail, (emailCounts.get(normalizedEmail) || 0) + 1);
    }
    if (normalizedPhone) {
      phoneCounts.set(normalizedPhone, (phoneCounts.get(normalizedPhone) || 0) + 1);
    }
  }

  const duplicateEmails = [...emailCounts.entries()].filter(([_, count]) => count > 1);
  const duplicatePhones = [...phoneCounts.entries()].filter(([_, count]) => count > 1);

  if (duplicateEmails.length > 0) {
    console.error("[migrate-users] DUPLICATE EMAILS FOUND:", duplicateEmails);
  }
  if (duplicatePhones.length > 0) {
    console.error("[migrate-users] DUPLICATE PHONES FOUND:", duplicatePhones);
  }

  // 3. Update documents to lowercase email and unset username
  let updatedCount = 0;
  for (const u of allUsers) {
    const normalizedEmail = (u.email || "").trim().toLowerCase();
    const normalizedPhone = (u.phone || "").trim();

    const updateOps = {
      $unset: { username: "" },
    };
    const setOps = {};
    if (normalizedEmail && normalizedEmail !== u.email) setOps.email = normalizedEmail;
    if (normalizedPhone && normalizedPhone !== u.phone) setOps.phone = normalizedPhone;
    if (Object.keys(setOps).length > 0) updateOps.$set = setOps;

    const res = await usersCollection.updateOne({ _id: u._id }, updateOps);
    if (res.modifiedCount > 0) updatedCount++;
  }

  console.log(`[migrate-users] Cleaned ${updatedCount} user documents (unset username, normalized email/phone).`);

  // 4. Ensure email and phone unique indexes
  try {
    await usersCollection.createIndex({ email: 1 }, { unique: true, name: "email_1" });
    await usersCollection.createIndex({ phone: 1 }, { unique: true, name: "phone_1" });
    console.log("[migrate-users] Ensured unique indexes on email and phone.");
  } catch (err) {
    console.error("[migrate-users] Failed to create unique index on email/phone:", err.message);
    throw err;
  }
}

// Allow direct CLI execution
const isDirectCall = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectCall) {
  const uri = process.env.MONGODB_CONNECTION_STRING;
  if (!uri) throw new Error("MONGODB_CONNECTION_STRING is not set in .env");

  console.log("[migrate-users] Connecting to MongoDB...");
  await mongoose.connect(uri);
  try {
    await migrateUsers(mongoose.connection.db);
    console.log("[migrate-users] Migration completed successfully.");
  } finally {
    await mongoose.disconnect();
  }
}
