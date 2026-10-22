#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import nextEnv from "@next/env";

const rootDir = process.cwd();
nextEnv.loadEnvConfig(rootDir, true);

const backupsDir = path.resolve(rootDir, "backups");

// Parse arguments
const args = process.argv.slice(2);
let fileArg = args.find((a) => !a.startsWith("--"));
const uriArg = args.find((a) => a.startsWith("--uri="))?.split("=")[1];
const autoConfirm = args.includes("--confirm") || args.includes("-y");

const targetUri =
  uriArg ||
  process.env.MONGODB_CONNECTION_STRING ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/memservice?replicaSet=rs0&directConnection=true";

// If file not specified, pick latest backup from backups/
if (!fileArg) {
  if (fs.existsSync(backupsDir)) {
    const files = fs
      .readdirSync(backupsDir)
      .filter((f) => f.endsWith(".gz") || f.endsWith(".archive"))
      .sort()
      .reverse();
    if (files.length > 0) {
      fileArg = path.resolve(backupsDir, files[0]);
      console.log(`ℹ️ No file specified. Auto-selecting latest backup: ${files[0]}`);
    }
  }
}

if (!fileArg || !fs.existsSync(fileArg)) {
  console.error("❌ Error: Backup archive file not found.");
  console.error("Usage: node scripts/restore-db.mjs <path-to-archive.gz> [--uri=<uri>] [--confirm]");
  process.exit(1);
}

const resolvedPath = path.resolve(fileArg);
const stats = fs.statSync(resolvedPath);

console.log(`\n⚠️  MONGODB RESTORE SAFETY WARNING`);
console.log(`=======================================================`);
console.log(`📄 Target Archive: ${resolvedPath} (${(stats.size / 1024).toFixed(2)} KB)`);
console.log(`🎯 Destination URI: ${targetUri.replace(/:([^@]+)@/, ":****@")}`);
console.log(`⚠️  This operation will OVERWRITE and DROP existing collections in the target database!`);
console.log(`=======================================================\n`);

async function runRestore() {
  console.log(`🚀 Executing restore operation...`);
  let success = false;

  // 1. Try local mongorestore CLI
  try {
    console.log("Attempting local mongorestore...");
    execSync(
      `mongorestore --uri="${targetUri}" --archive="${resolvedPath}" --gzip --drop`,
      { stdio: "inherit" }
    );
    success = true;
  } catch (localErr) {
    // 2. Try Docker container
    try {
      console.log("Local mongorestore not found. Trying via Docker container 'memservice-mongo'...");
      const filename = path.basename(resolvedPath);
      const containerTmp = `/tmp/${filename}`;
      execSync(`docker cp "${resolvedPath}" memservice-mongo:${containerTmp}`, {
        stdio: "inherit",
      });
      const containerUri = targetUri.replace(/localhost|127\.0\.0\.1/, "localhost");
      execSync(
        `docker exec memservice-mongo mongorestore --uri="${containerUri}" --archive="${containerTmp}" --gzip --drop`,
        { stdio: "inherit" }
      );
      execSync(`docker exec memservice-mongo rm -f ${containerTmp}`, {
        stdio: "ignore",
      });
      success = true;
    } catch (dockerErr) {
      console.error("❌ Docker restore failed:", dockerErr.message);
    }
  }

  if (success) {
    console.log(`\n✅ Database restored successfully from ${path.basename(resolvedPath)}!\n`);
  } else {
    console.error(`\n❌ Failed to restore database archive.`);
    process.exit(1);
  }
}

if (autoConfirm) {
  runRestore();
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Type "RESTORE" to confirm and proceed: ', (answer) => {
    rl.close();
    if (answer.trim() === "RESTORE") {
      runRestore();
    } else {
      console.log("Restore operation aborted by user.");
      process.exit(0);
    }
  });
}
