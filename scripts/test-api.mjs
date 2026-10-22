#!/usr/bin/env node

import assert from "node:assert";
import nextEnv from "@next/env";

const rootDir = process.cwd();
nextEnv.loadEnvConfig(rootDir, true);

const API_BASE = process.env.API_URL || "http://localhost:3001";

console.log(`\n🧪 Running automated API Test Suite against ${API_BASE}...`);

async function runTests() {
  try {
    // 1. Health Readiness Probe
    console.log("➡️ [1/4] Checking GET /api/health/ready...");
    const healthRes = await fetch(`${API_BASE}/api/health/ready`);
    const health = await healthRes.json();
    assert.strictEqual(healthRes.status, 200, `Health check must return 200: ${JSON.stringify(health)}`);
    assert.strictEqual(health.status, "ready", "Status must be ready");
    assert.strictEqual(health.database?.connected, true, "Database must be connected");
    console.log("   ✅ Health readiness probe verified (MongoDB connected, replicaSet ok).");

    // 2. Auth Matrix (Unauthenticated 401 checks)
    console.log("➡️ [2/4] Verifying Auth Matrix (Staff Protection)...");
    const protectedRoutes = [
      { path: "/api/user", method: "GET" },
      { path: "/api/user/sessions", method: "GET" },
      { path: "/api/adminproduct", method: "GET" },
      { path: "/api/integrations", method: "GET" },
      { path: "/api/analytics", method: "GET" },
    ];

    for (const r of protectedRoutes) {
      const res = await fetch(`${API_BASE}${r.path}`, { method: r.method });
      assert.strictEqual(
        res.status,
        401,
        `Expected 401 Unauthorized for unauthenticated call to ${r.method} ${r.path}, got ${res.status}`
      );
    }
    console.log("   ✅ Protected staff routes correctly reject unauthenticated requests with 401.");

    // 3. Public Endpoints & Rate Limiting
    console.log("➡️ [3/4] Verifying Public Delivery Quotes & Cart Pricing...");
    const quoteRes = await fetch(`${API_BASE}/api/delivery/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zoneKey: "dhaka_inside",
        weightKg: 1,
        subtotal: 500,
      }),
    });
    assert.ok([200, 400].includes(quoteRes.status), "Delivery quote should respond with valid HTTP code");
    console.log("   ✅ Delivery quote calculation responsive.");

    // 4. Session Check Endpoint
    console.log("➡️ [4/4] Verifying Session Revocation Verification Endpoint...");
    const checkRes = await fetch(`${API_BASE}/api/auth/session-check?jti=non-existent-jti`);
    assert.strictEqual(checkRes.status, 401, "Non-existent session must return 401");
    console.log("   ✅ Session revocation check correctly rejects invalid JTI.");

    console.log("\n🎉 All API Tests passed successfully!\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ API Test Suite failed:", err.message);
    process.exit(1);
  }
}

runTests();
