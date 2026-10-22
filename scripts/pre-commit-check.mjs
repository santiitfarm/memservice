#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";

console.log("🔒 Running pre-commit security & secrets scanner...");

// 1. Check staged file paths
let stagedFiles = [];
try {
  const output = execSync("git diff --cached --name-only", { encoding: "utf8" });
  stagedFiles = output.split("\n").map((f) => f.trim()).filter(Boolean);
} catch (err) {
  // Not a git repo or no staged files
  process.exit(0);
}

if (stagedFiles.length === 0) {
  process.exit(0);
}

// Denied file patterns
const FORBIDDEN_FILE_PATTERNS = [
  /^\.env(?!\.example$)/i,        // .env, .env.local, .env.production, etc. but allow .env.example
  /.*\.pem$/i,
  /.*\.key$/i,
  /.*id_rsa$/i,
  /.*id_ed25519$/i,
];

const SECRET_CONTENT_PATTERNS = [
  /-----BEGIN\s+(RSA|OPENSSH|EC|PGP|PRIVATE)?\s*KEY-----/i,
  /mongodb(\+srv)?:\/\/[a-zA-Z0-9_\-\.]+:(?!<PASSWORD>)[^@\s\r\n]+@/i, // MongoDB URI with actual credentials
  /ghp_[a-zA-Z0-9]{36}/,               // GitHub Personal Access Token
  /sk_live_[a-zA-Z0-9]{24}/,           // Stripe live secret
  /re_[a-zA-Z0-9]{32}/,                // Resend live key
];

let hasErrors = false;

for (const file of stagedFiles) {
  // Check forbidden files
  for (const pattern of FORBIDDEN_FILE_PATTERNS) {
    if (pattern.test(file)) {
      console.error(`❌ BLOCKED: Attempting to commit forbidden environment or key file: ${file}`);
      console.error(`👉 Never commit real environment secrets or keys. Use .env.example instead.`);
      hasErrors = true;
    }
  }

  // Check file content for secret patterns (skip documentation and tests)
  if (
    fs.existsSync(file) &&
    !fs.statSync(file).isDirectory() &&
    !file.endsWith(".md") &&
    !file.endsWith(".example") &&
    !file.includes("test")
  ) {
    try {
      const content = fs.readFileSync(file, "utf8");
      for (const pattern of SECRET_CONTENT_PATTERNS) {
        if (pattern.test(content)) {
          console.error(`❌ BLOCKED: Possible secret or private key pattern found in ${file}`);
          console.error(`👉 Matched rule: ${pattern.toString()}`);
          hasErrors = true;
        }
      }
    } catch (e) {
      // Binary file, skip text scan
    }
  }
}

if (hasErrors) {
  console.error("\n💥 Commit aborted due to security hygiene violations. Remove secrets and try again.\n");
  process.exit(1);
}

console.log("✅ Pre-commit security check passed cleanly.");
process.exit(0);
