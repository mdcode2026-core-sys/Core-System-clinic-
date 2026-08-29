import { chromium } from "playwright";

const baseUrl = (process.env.CORE_SYSTEM_PRODUCTION_URL || "https://core-system-clinic.vercel.app").replace(/\/$/, "");
const email = process.env.CORE_SYSTEM_E2E_EMAIL;
const password = process.env.CORE_SYSTEM_E2E_PASSWORD;
if (!email || !password) throw new Error("Missing CORE_SYSTEM_E2E_EMAIL or CORE_SYSTEM_E2E_PASSWORD");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const failures = [];

async function check(name, fn) {
  try { await fn(); console.log(`PASS: ${name}`); }
  catch (e) { failures.push(`${name}: ${e instanceof Error ? e.message : String(e)}`); console.error(`FAIL: ${name}`); }
}

await check("Production login page", async () => {
  const r = await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  if (!r || r.status() >= 400) throw new Error(`HTTP ${r?.status()}`);
});

await check("Clinic Admin authentication", async () => {
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await page.getByRole("button", { name: /sign in|login|log in|تسجيل الدخول|دخول/i }).first().click();
  await page.waitForLoadState("networkidle");
  if (/\/login(?:[/?#]|$)/i.test(page.url())) throw new Error(`Authentication did not leave login page: ${page.url()}`);
});

await check("Authenticated session remains valid", async () => {
  const r = await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  if (!r || r.status() >= 400) throw new Error(`HTTP ${r?.status()}`);
  if (/\/login(?:[/?#]|$)/i.test(page.url())) throw new Error("Session was not retained");
});

for (const route of ["/agenda", "/patients", "/analytics", "/settings"]) {
  await check(`Authenticated route ${route}`, async () => {
    const r = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    if (!r || r.status() >= 400) throw new Error(`HTTP ${r?.status()}`);
    if (/\/login(?:[/?#]|$)/i.test(page.url())) throw new Error("Redirected to login");
  });
}

await browser.close();
if (failures.length) { console.error("AJM authenticated Production E2E FAILED"); for (const f of failures) console.error(`- ${f}`); process.exit(1); }
console.log(`AJM authenticated Production E2E PASS: ${baseUrl}`);
