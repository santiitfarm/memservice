// Idempotent migration: generates unique lowercase slugs for all products without a slug,
// sets up slugHistory, and creates compound text indexes for search.
// Run via: pnpm db:migrate-product-slugs
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { root } from "./_env.mjs";
import { slugify } from "../apps/api/lib/slug.js";

export async function migrateProductSlugs(db, { dryRun = false } = {}) {
  console.log(`[migrate-slugs] Starting product slug migration (dryRun=${dryRun})...`);

  const productsColl = db.collection("products");
  const allProducts = await productsColl.find({}).toArray();
  console.log(`[migrate-slugs] Found ${allProducts.length} total products.`);

  const usedSlugs = new Set();
  // First record existing valid slugs
  for (const p of allProducts) {
    if (p.slug && typeof p.slug === "string") {
      usedSlugs.add(p.slug.toLowerCase());
    }
  }

  let generatedCount = 0;
  let alreadyHadSlugCount = 0;

  for (const p of allProducts) {
    if (p.slug && typeof p.slug === "string" && p.slug.trim()) {
      alreadyHadSlugCount++;
      continue;
    }

    const title = p.name || p.model || "product";
    let baseSlug = slugify(title);
    if (!baseSlug) {
      baseSlug = `product-${p._id.toString().slice(-6)}`;
    }

    let candidate = baseSlug;
    let suffix = 1;

    while (usedSlugs.has(candidate)) {
      suffix += 1;
      candidate = `${baseSlug}-${suffix}`;
    }

    usedSlugs.add(candidate);
    generatedCount++;

    console.log(`[migrate-slugs] Product "${title}" (${p._id}) -> slug: "${candidate}"`);

    if (!dryRun) {
      await productsColl.updateOne(
        { _id: p._id },
        {
          $set: {
            slug: candidate,
            slugHistory: [candidate],
          },
        }
      );
    }
  }

  console.log(
    `[migrate-slugs] Slugs generated: ${generatedCount}, already had slug: ${alreadyHadSlugCount}.`
  );

  // Reconcile MongoDB text indexes: Drop legacy text index if present so compound text search works
  if (!dryRun) {
    try {
      const indexes = await productsColl.indexes();
      for (const idx of indexes) {
        if (
          idx.name &&
          idx.name.includes("text") &&
          idx.name !== "product_text_search"
        ) {
          console.log(`[migrate-slugs] Dropping legacy text index: ${idx.name}`);
          try {
            await productsColl.dropIndex(idx.name);
          } catch (dropErr) {
            console.warn(`[migrate-slugs] Failed to drop ${idx.name}:`, dropErr.message);
          }
        }
      }

      console.log(`[migrate-slugs] Ensuring unique index on slug and compound text search index...`);
      await productsColl.createIndex({ slug: 1 }, { unique: true, sparse: true, name: "slug_1" });
      await productsColl.createIndex(
        {
          name: "text",
          generic_name: "text",
          manufacturer_name: "text",
          tags: "text",
          slug: "text",
        },
        {
          weights: {
            name: 10,
            slug: 8,
            generic_name: 6,
            manufacturer_name: 4,
            tags: 2,
          },
          name: "product_text_search",
        }
      );
      console.log(`[migrate-slugs] Indexes ensured successfully.`);
    } catch (idxErr) {
      console.warn(`[migrate-slugs] Index creation note:`, idxErr.message);
    }
  }

  console.log(`[migrate-slugs] Migration completed successfully.`);
  return { generatedCount, alreadyHadSlugCount };
}

// Allow direct CLI execution
const isDirectCall =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectCall) {
  const uri = process.env.MONGODB_CONNECTION_STRING;
  if (!uri) throw new Error("MONGODB_CONNECTION_STRING is not set in .env");

  const dryRun = process.argv.includes("--dry-run");
  console.log(`[migrate-slugs] Connecting to MongoDB... (dryRun=${dryRun})`);
  await mongoose.connect(uri);

  try {
    await migrateProductSlugs(mongoose.connection.db, { dryRun });
    console.log("[migrate-slugs] Completed without errors.");
  } finally {
    await mongoose.disconnect();
  }
}
