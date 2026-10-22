import { test, expect } from "@playwright/test";
import { SignJWT } from "jose";

const API_BASE = "http://localhost:3001";
const AUTH_SECRET = process.env.AUTH_SECRET || "memservice_development_auth_secret_key_12345";

async function createTestStaffCookie(role = "manager", id = "507f1f77bcf86cd799439011") {
  const secret = new TextEncoder().encode(AUTH_SECRET);
  const token = await new SignJWT({
    user: {
      id,
      email: `${role}@example.com`,
      name: `Test ${role}`,
      role,
    },
    jti: `test-jti-${role}-${Date.now()}`,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);

  return `memservice_auth=${token}`;
}

test.describe("API Auth & RBAC Matrix Tests", () => {
  test("1. Public routes return 200 OK without authentication", async ({ request }) => {
    const publicRoutes = [
      "/api/health/ready",
      "/api/cms/home",
      "/api/cms/site",
      "/api/shop",
      "/api/delivery/zones",
      "/api/doctors",
    ];

    for (const path of publicRoutes) {
      const res = await request.get(`${API_BASE}${path}`);
      expect(res.status(), `Expected 200 OK for public route ${path}`).toBe(200);
    }
  });

  test("2. Unauthenticated requests to staff routes return 401 Unauthorized", async ({ request }) => {
    const protectedRoutes = [
      { path: "/api/user", method: "get" },
      { path: "/api/user/sessions", method: "get" },
      { path: "/api/adminproduct", method: "get" },
      { path: "/api/integrations", method: "get" },
      { path: "/api/analytics", method: "get" },
      { path: "/api/coupons", method: "get" },
      { path: "/api/delivery/zones", method: "post" },
    ];

    for (const r of protectedRoutes) {
      const res = await request[r.method](`${API_BASE}${r.path}`);
      expect(res.status(), `Expected 401 for ${r.method.toUpperCase()} ${r.path}`).toBe(401);
    }
  });

  test("3. Manager role (Rank 1) is forbidden (403) from accessing Admin/Super-Admin routes", async ({ request }) => {
    const managerCookie = await createTestStaffCookie("manager");

    // Integrations write requires super-admin (Rank 3)
    const intRes = await request.post(`${API_BASE}/api/integrations`, {
      headers: { Cookie: managerCookie, "Content-Type": "application/json" },
      data: { provider: "bkash", credentials: {} },
    });
    expect([403, 401]).toContain(intRes.status());

    // User management requires admin (Rank 2)
    const userRes = await request.get(`${API_BASE}/api/user`, {
      headers: { Cookie: managerCookie },
    });
    expect([403, 401]).toContain(userRes.status());
  });

  test("4. Invalid or tampered cookie returns 401 Unauthorized", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/user`, {
      headers: { Cookie: "memservice_auth=invalid.tampered.token" },
    });
    expect(res.status()).toBe(401);
  });
});
