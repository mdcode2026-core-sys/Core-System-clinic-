import { test, expect } from "@playwright/test";

test.setTimeout(180000);
const baseUrl = (process.env.CORE_SYSTEM_PRODUCTION_URL || "https://core-system-clinic.vercel.app").replace(/\/$/, "");
const email = process.env.CORE_SYSTEM_E2E_EMAIL;
const password = process.env.CORE_SYSTEM_E2E_PASSWORD;
if (!email || !password) throw new Error("Missing CORE_SYSTEM_E2E_EMAIL or CORE_SYSTEM_E2E_PASSWORD");

const canonicalRoutes = [
  "/", "/agenda", "/analytics", "/clinical", "/communications", "/dashboard",
  "/financial-resources", "/financial-resources/financial-plans", "/financial-resources/financial-plans/installments",
  "/financial-resources/insurance", "/financial-resources/insurance/claims", "/financial-resources/inventory/consumption",
  "/financial-resources/overview", "/financial-resources/payments", "/financial-resources/purchasing",
  "/financial-resources/purchasing/receiving", "/financial-resources/purchasing/suppliers", "/follow-up",
  "/inventory", "/invoices", "/operation", "/patient-flow", "/patient-flow/administrative",
  "/patient-flow/clinical", "/patient-flow/operations", "/patients", "/portal", "/queue", "/reports",
  "/settings", "/treatment-plans", "/work-center", "/workforce"
];

async function login(page, context) {
  let lastFailure = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    const authResponse = page.waitForResponse(
      response => response.url().includes("/auth/v1/token"),
      { timeout: 15000 }
    ).catch(() => null);

    await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle", timeout: 60000 });
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submit = page.getByRole("button", { name: /sign in|login|log in|تسجيل الدخول|دخول/i }).first();
    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await expect(passwordInput).toBeVisible({ timeout: 15000 });
    await expect(submit).toBeEnabled({ timeout: 15000 });
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submit.click();

    const token = await authResponse;
    if (token) console.log(`AUTH_TOKEN_RESPONSE=${token.status()}`);
    await page.waitForTimeout(5000);
    const cookies = await context.cookies(baseUrl);
    const body = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 1000);
    console.log(`AUTH_ATTEMPT=${attempt} AUTH_COOKIE_NAMES=${cookies.map((c) => c.name).join(",")}`);
    console.log(`AUTH_PAGE_URL=${page.url()}`);
    console.log(`AUTH_PAGE_BODY=${body}`);
    if (!/\/login(?:[/?#]|$)/i.test(page.url())) return;
    lastFailure = `attempt=${attempt} url=${page.url()} body=${body}`;
    if (attempt === 1) await page.reload({ waitUntil: "networkidle", timeout: 60000 });
  }
  throw new Error(`Production login did not establish an application session. ${lastFailure}`);
}

test("Clinic Admin authenticates against current Production and retains authorization", async ({ page, context }) => {
  await login(page, context);
  for (const route of canonicalRoutes) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    expect(response?.status(), `${route} HTTP status`).toBeLessThan(400);
    expect(page.url(), `${route} authentication`).not.toMatch(/\/login(?:[/?#]|$)/i);
  }
});

test("Clinic Admin Production shell remains usable at mobile viewport", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, context);
  const response = await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  expect(response?.status()).toBeLessThan(400);
  expect(page.url()).not.toMatch(/\/login(?:[/?#]|$)/i);
  const dir = await page.locator("html").getAttribute("dir");
  expect(dir).toMatch(/^(rtl|ltr)$/);
});
