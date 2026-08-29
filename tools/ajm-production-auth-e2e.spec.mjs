import { test, expect } from "@playwright/test";

test.setTimeout(120000);
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
  const login = await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  expect(login?.status()).toBeLessThan(400);
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"], input[name="password"]').first().fill(password);
  await page.getByRole("button", { name: /sign in|login|log in|تسجيل الدخول|دخول/i }).first().click();
  await page.waitForLoadState("domcontentloaded", { timeout: 60000 }).catch(() => {});
  const cookies = await context.cookies(baseUrl);
  console.log(`AUTH_COOKIE_NAMES=${cookies.map((c) => c.name).join(",")}`);
  if (/\/login(?:[/?#]|$)/i.test(page.url())) {
    const text = (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 800);
    throw new Error(`Production login did not establish an application session. URL=${page.url()} BODY=${text}`);
  }
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
