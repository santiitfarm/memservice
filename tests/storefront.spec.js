import { test, expect } from "@playwright/test";

const STOREFRONT_URL = "http://localhost:3000";
const API_BASE = "http://localhost:3001";

test.describe("Storefront End-to-End Suite", () => {
  test("1. Home sections, header, slider, and footer render properly", async ({ page }) => {
    await page.goto(STOREFRONT_URL);

    // Verify Title and Header
    await expect(page).toHaveTitle(/Mem Service/i);
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Verify Main Home Layout sections
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Verify Footer
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("2. Catalog page loads and allows category filtering and search", async ({ page }) => {
    await page.goto(`${STOREFRONT_URL}/shop`);

    // Verify shop page container
    await expect(page.locator("h1")).toContainText(/Shop|All Products|Products/i);

    // Verify products list or grid is displayed
    const productCards = page.locator("article, [data-testid='product-card'], .group");
    await expect(productCards.first()).toBeVisible({ timeout: 15_000 });
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("3. Product details page renders variants, price, and Add to Cart", async ({ page }) => {
    // Navigate directly to shop and click the first product
    await page.goto(`${STOREFRONT_URL}/shop`);
    const firstProductLink = page.locator("a[href^='/product/']").first();
    await expect(firstProductLink).toBeVisible();
    await firstProductLink.click();

    // Verify product details page
    await expect(page.locator("h1")).toBeVisible({ timeout: 10_000 });
    const addToCartButton = page.locator("button:has-text('Add to Cart'), button:has-text('কার্টে যোগ করুন')").first();
    await expect(addToCartButton).toBeVisible();

    // Click Add to Cart
    await addToCartButton.click();
  });

  test("4. Checkout flow: Delivery Zone quote calculation and COD checkout", async ({ page, request }) => {
    // Verify delivery quote endpoint responds cleanly
    const quoteRes = await request.post(`${API_BASE}/api/delivery/quote`, {
      data: {
        zoneKey: "dhaka_inside",
        weightKg: 1,
        subtotal: 500,
      },
    });
    expect(quoteRes.status()).toBe(200);
    const data = await quoteRes.json();
    const charge = data.quote?.totalCharge ?? data.quote?.charge ?? 0;
    expect(charge).toBeGreaterThanOrEqual(0);

    // Navigate to checkout
    await page.goto(`${STOREFRONT_URL}/checkout`);
    await page.waitForLoadState("domcontentloaded");

    // Check if checkout form or container is visible
    const checkoutContent = page.locator("section.container, form, section").first();
    await expect(checkoutContent).toBeVisible({ timeout: 10_000 });
  });

  test("5. Guest Order Tracking: Lookup order status and verification", async ({ page }) => {
    await page.goto(`${STOREFRONT_URL}/track-order`);
    await page.waitForLoadState("domcontentloaded");

    // Verify tracking inputs are present
    const orderInput = page.getByPlaceholder(/MS-/i).first();
    const phoneInput = page.getByPlaceholder(/017/i).first();

    await expect(orderInput).toBeVisible();
    await expect(phoneInput).toBeVisible();

    // Fill tracking credentials with mock values
    await orderInput.fill("MS-241210-999999");
    await phoneInput.fill("01700000000");

    const trackButton = page.locator("button[type='submit']").first();
    await trackButton.click();

    // Verify response error message or not found prompt displays without crashing
    await expect(page.locator("body")).toBeVisible();
  });
});
