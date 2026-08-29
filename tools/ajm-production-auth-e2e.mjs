import { test, expect } from "@playwright/test";

const baseUrl = (process.env.CORE_SYSTEM_PRODUCTION_URL || "https://core-system-clinic.vercel.app").replace(/\/$/, "");
const email = process.env.CORE_SYSTEM_E2E_EMAIL;
const password = process.env.CORE_SYSTEM_E2E_PASSWORD;
if (!email || !password) throw new Error("Missing CORE_SYSTEM_E2E_EMAIL or CORE_SYSTEM_E2E_PASSWORD");

test.describe("AJM authenticated Production acceptance", () => {
  test("Clinic Admin can authenticate and retain authorization across canonical surfaces", async ({ page }) => {
    const login = await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
    expect(login?.status()).toBeLessThan(400);

    await page.locator('input[type="email"], input[name="email"]').first().fill(email);
    await page.locator('input[type="password"], input[name="password"]').first().fill(password);
    await page.getByRole("button", { name: /sign in|login|log in|تسجيل الدخول|دخول/i }).first().click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).not.toMatch(/\/login(?:[/?#]|$)/i);

    const routes = ["/", "/agenda", "/patients", "/analytics", "/settings"];
    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${route} HTTP status`).toBeLessThan(400);
      expect(page.url(), `${route} authentication`).not.toMatch(/\/login(?:[/?#]|$)/i);
    }
  });
});
