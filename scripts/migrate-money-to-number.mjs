// Idempotent migration: converts string prices/money fields to real Numbers across
// products, orders, and delivery zones.
// Supports --dry-run flag and creates *_backup_money collections.
// Run via: pnpm db:migrate-money
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { root } from "./_env.mjs";

export function toMoney(val) {
  if (val === null || val === undefined || val === "") return 0;
  const num = typeof val === "number" ? val : Number(val);
  if (!Number.isFinite(num)) return null;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export async function migrateMoney(db, { dryRun = false } = {}) {
  console.log(`[migrate-money] Starting migration (dryRun=${dryRun})...`);

  // ----------------------------------------------------
  // 1. PRODUCTS MIGRATION
  // ----------------------------------------------------
  const productsColl = db.collection("products");
  const products = await productsColl.find({}).toArray();
  console.log(`[migrate-money] Found ${products.length} products to check.`);

  // Backup products if not dry run
  if (!dryRun && products.length > 0) {
    const backupColl = db.collection("products_backup_money");
    const backupCount = await backupColl.countDocuments();
    if (backupCount === 0) {
      console.log(`[migrate-money] Creating backup collection 'products_backup_money'...`);
      await backupColl.insertMany(products);
    } else {
      console.log(`[migrate-money] 'products_backup_money' already exists (${backupCount} docs).`);
    }
  }

  let productsModified = 0;
  let unparsableProductFields = 0;

  for (const prod of products) {
    const updates = {};
    const moneyFields = ["regular_price", "discount_price", "purchase_price"];

    for (const field of moneyFields) {
      const val = prod[field];
      if (typeof val === "string") {
        const parsed = toMoney(val);
        if (parsed === null) {
          console.warn(`[migrate-money] Warning: Unparsable ${field}="${val}" in product ${prod._id} (${prod.name})`);
          unparsableProductFields++;
          updates[field] = 0;
        } else {
          updates[field] = parsed;
        }
      } else if (val === undefined || val === null) {
        updates[field] = 0;
      } else if (typeof val === "number") {
        // Ensure rounded to 2 decimals
        const rounded = toMoney(val);
        if (rounded !== val) updates[field] = rounded;
      }
    }

    if (Object.keys(updates).length > 0) {
      productsModified++;
      if (!dryRun) {
        await productsColl.updateOne({ _id: prod._id }, { $set: updates });
      }
    }
  }

  console.log(
    `[migrate-money] Products: ${productsModified} modified (${unparsableProductFields} unparsable warnings).`
  );

  // ----------------------------------------------------
  // 2. ORDERS MIGRATION
  // ----------------------------------------------------
  const ordersColl = db.collection("orders");
  const orders = await ordersColl.find({}).toArray();
  console.log(`[migrate-money] Found ${orders.length} orders to check.`);

  // Backup orders if not dry run
  if (!dryRun && orders.length > 0) {
    const backupOrdersColl = db.collection("orders_backup_money");
    const backupOrdersCount = await backupOrdersColl.countDocuments();
    if (backupOrdersCount === 0) {
      console.log(`[migrate-money] Creating backup collection 'orders_backup_money'...`);
      await backupOrdersColl.insertMany(orders);
    } else {
      console.log(`[migrate-money] 'orders_backup_money' already exists (${backupOrdersCount} docs).`);
    }
  }

  let ordersModified = 0;
  let unparsableOrderFields = 0;

  for (const ord of orders) {
    const setUpdates = {};
    let needsUpdate = false;

    // total_amount
    if (typeof ord.total_amount === "string") {
      const parsed = toMoney(ord.total_amount);
      if (parsed === null) {
        console.warn(`[migrate-money] Warning: Unparsable total_amount="${ord.total_amount}" in order ${ord._id} (${ord.order_number})`);
        unparsableOrderFields++;
        setUpdates.total_amount = 0;
      } else {
        setUpdates.total_amount = parsed;
      }
      needsUpdate = true;
    }

    // shipping_details
    if (ord.shipping_details) {
      const sc = ord.shipping_details.shipping_charge;
      if (typeof sc === "string") {
        const parsed = toMoney(sc) ?? 0;
        setUpdates["shipping_details.shipping_charge"] = parsed;
        needsUpdate = true;
      }
      const ch = ord.shipping_details.charge;
      if (typeof ch === "string") {
        const parsed = toMoney(ch) ?? 0;
        setUpdates["shipping_details.charge"] = parsed;
        needsUpdate = true;
      }
    }

    // payment_info
    if (ord.payment_info) {
      const amt = ord.payment_info.amount;
      if (typeof amt === "string") {
        const parsed = toMoney(amt);
        if (parsed === null) {
          console.warn(`[migrate-money] Warning: Unparsable payment_info.amount="${amt}" in order ${ord._id}`);
          unparsableOrderFields++;
          setUpdates["payment_info.amount"] = 0;
        } else {
          setUpdates["payment_info.amount"] = parsed;
        }
        needsUpdate = true;
      }

      const txAmt = ord.payment_info.transaction_amount;
      if (typeof txAmt === "string") {
        const parsed = toMoney(txAmt);
        if (parsed !== null) {
          setUpdates["payment_info.transaction_amount"] = parsed;
          needsUpdate = true;
        }
      }
    }

    // items array
    if (Array.isArray(ord.items)) {
      let itemsChanged = false;
      const updatedItems = ord.items.map((item) => {
        let price = item.price;
        let totalPrice = item.totalPrice;
        const qty = Number(item.quantity) || 1;

        if (typeof price === "string") {
          price = toMoney(price) ?? 0;
          itemsChanged = true;
        }
        if (typeof totalPrice === "string" || totalPrice === undefined) {
          totalPrice = toMoney(price * qty);
          itemsChanged = true;
        }

        return {
          ...item,
          price,
          totalPrice,
        };
      });

      if (itemsChanged) {
        setUpdates.items = updatedItems;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      ordersModified++;
      if (!dryRun) {
        await ordersColl.updateOne({ _id: ord._id }, { $set: setUpdates });
      }
    }
  }

  console.log(
    `[migrate-money] Orders: ${ordersModified} modified (${unparsableOrderFields} unparsable warnings).`
  );

  // ----------------------------------------------------
  // 3. DELIVERY ZONES MIGRATION
  // ----------------------------------------------------
  const zonesColl = db.collection("deliveryzones");
  const zonesCount = await zonesColl.countDocuments();
  if (zonesCount > 0) {
    const zones = await zonesColl.find({}).toArray();
    let zonesModified = 0;

    for (const zone of zones) {
      const setUpdates = {};
      if (typeof zone.charge === "string") {
        setUpdates.charge = toMoney(zone.charge) ?? 0;
      }
      if (typeof zone.freeAbove === "string") {
        setUpdates.freeAbove = toMoney(zone.freeAbove);
      }
      if (typeof zone.minOrder === "string") {
        setUpdates.minOrder = toMoney(zone.minOrder) ?? 0;
      }

      if (Object.keys(setUpdates).length > 0) {
        zonesModified++;
        if (!dryRun) {
          await zonesColl.updateOne({ _id: zone._id }, { $set: setUpdates });
        }
      }
    }
    console.log(`[migrate-money] DeliveryZones: ${zonesModified} modified.`);
  }

  console.log(`[migrate-money] Migration finished successfully.`);
  return {
    productsModified,
    ordersModified,
    unparsableProductFields,
    unparsableOrderFields,
  };
}

// Allow direct CLI execution
const isDirectCall = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectCall) {
  const uri = process.env.MONGODB_CONNECTION_STRING;
  if (!uri) throw new Error("MONGODB_CONNECTION_STRING is not set in .env");

  const dryRun = process.argv.includes("--dry-run");
  console.log(`[migrate-money] Connecting to MongoDB... (dryRun=${dryRun})`);
  await mongoose.connect(uri);

  try {
    await migrateMoney(mongoose.connection.db, { dryRun });
    console.log("[migrate-money] Completed without errors.");
  } finally {
    await mongoose.disconnect();
  }
}
