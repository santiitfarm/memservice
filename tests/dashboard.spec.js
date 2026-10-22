import { test, expect } from "@playwright/test";

const ADMIN_URL = "http://localhost:3002";
const API_BASE = "http://localhost:3001";

test.describe("Admin Dashboard End-to-End Suite", () => {
  test("1. Admin Login: Email & Password authentication for staff roles", async ({ page }) => {
    await page.goto(`${ADMIN_URL}/admin-login`);

    // Verify login form elements
    await expect(page).toHaveTitle(/Admin|Login|Sign In/i);
    const emailInput = page.locator("input[type='email'], input[name='email']");
    const passwordInput = page.locator("input[type='password'], input[name='password']");
    const submitBtn = page.locator("button[type='submit']");

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Fill credentials for admin
    await emailInput.fill("admin@memservice.local");
    await passwordInput.fill("Admin@12345");
    await submitBtn.click();

    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard/i, { timeout: 15_000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test("2. Catalog & CMS: Categories and Delivery Zones management screens", async ({ page }) => {
    // Navigate to admin login first
    await page.goto(`${ADMIN_URL}/admin-login`);
    await page.locator("input[type='email'], input[name='email']").fill("admin@memservice.local");
    await page.locator("input[type='password'], input[name='password']").fill("Admin@12345");
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/dashboard/i, { timeout: 15_000 });

    // Navigate to Delivery Zones management
    await page.goto(`${ADMIN_URL}/dashboard/delivery`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1").first()).toBeVisible();

    // Navigate to Products / Catalog
    await page.goto(`${ADMIN_URL}/dashboard/products`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("3. Orders management and Courier booking interface", async ({ page }) => {
    // Navigate to admin login
    await page.goto(`${ADMIN_URL}/admin-login`);
    await page.locator("input[type='email'], input[name='email']").fill("admin@memservice.local");
    await page.locator("input[type='password'], input[name='password']").fill("Admin@12345");
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/dashboard/i, { timeout: 15_000 });

    // Navigate to Orders
    await page.goto(`${ADMIN_URL}/dashboard/orders`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText("Order Management").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("All Orders").first()).toBeVisible();
  });

  test("4. Security & Staff Session revocation UI in Profile", async ({ page }) => {
    await page.goto(`${ADMIN_URL}/admin-login`);
    await page.locator("input[type='email'], input[name='email']").fill("admin@memservice.local");
    await page.locator("input[type='password'], input[name='password']").fill("Admin@12345");
    await page.locator("button[type='submit']").click();
    await page.waitForURL(/dashboard/i, { timeout: 15_000 });

    // Navigate to Security settings
    await page.goto(`${ADMIN_URL}/dashboard/profile/security`);
    await page.waitForLoadState("domcontentloaded");

    // Verify Password change and Active Sessions cards
    await expect(page.getByText("Change Password").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Active Staff Sessions/i })).toBeVisible();
    await expect(page.locator("button:has-text('Sign out everywhere')")).toBeVisible();
  });
});
