#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";

const rootDir = process.cwd();
nextEnv.loadEnvConfig(rootDir, true);

const backupsDir = path.resolve(rootDir, "backups");
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

// Parse arguments
const args = process.argv.slice(2);
const uriArg = args.find((a) => a.startsWith("--uri="))?.split("=")[1];
const targetUri =
  uriArg ||
  process.env.MONGODB_CONNECTION_STRING ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/memservice?replicaSet=rs0&directConnection=true";

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = `backup-${timestamp}.archive.gz`;
const outputPath = path.resolve(backupsDir, filename);

console.log(`📦 Starting automated MongoDB backup...`);
console.log(`📍 Target URI: ${targetUri.replace(/:([^@]+)@/, ":****@")}`);
console.log(`📁 Destination: ${outputPath}`);

let success = false;

// 1. Try local mongodump CLI
try {
  console.log("Attempting local mongodump...");
  execSync(
    `mongodump --uri="${targetUri}" --archive="${outputPath}" --gzip`,
    { stdio: "inherit" }
  );
  success = true;
} catch (localErr) {
  // If local CLI failed or not found, try Docker container
  try {
    console.log("Local mongodump not found. Trying via Docker container 'memservice-mongo'...");
    const containerTmp = `/tmp/${filename}`;
    // Container uses internal URI
    const containerUri = targetUri.replace(/localhost|127\.0\.0\.1/, "localhost");
    execSync(
      `docker exec memservice-mongo mongodump --uri="${containerUri}" --archive="${containerTmp}" --gzip`,
      { stdio: "inherit" }
    );
    execSync(`docker cp memservice-mongo:${containerTmp} "${outputPath}"`, {
      stdio: "inherit",
    });
    execSync(`docker exec memservice-mongo rm -f ${containerTmp}`, {
      stdio: "ignore",
    });
    success = true;
  } catch (dockerErr) {
    console.error("❌ Docker backup failed:", dockerErr.message);
  }
}

if (!success || !fs.existsSync(outputPath)) {
  console.error("❌ Failed to create MongoDB backup archive.");
  process.exit(1);
}

const stats = fs.statSync(outputPath);
const sizeKb = (stats.size / 1024).toFixed(2);
console.log(`\n🎉 Backup completed successfully!`);
console.log(`📄 Archive: backups/${filename}`);
console.log(`⚖️ Size: ${sizeKb} KB\n`);
