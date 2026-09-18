import { chromium } from "playwright";

const baseUrl = (process.env.CORE_SYSTEM_PRODUCTION_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.CORE_SYSTEM_E2E_EMAIL;
const password = process.env.CORE_SYSTEM_E2E_PASSWORD;
if (!email || !password) throw new Error("Missing E2E credentials");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "en-US", viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

async function login() {
  await page.goto(`${baseUrl}/login`, { waitUntil: "commit", timeout: 60000 });
  await page.locator('input[type="email"],input[name="email"]').first().fill(email);
  await page.locator('input[type="password"],input[name="password"]').first().fill(password);
  await page.getByRole("button", { name: /sign in|login|log in|تسجيل الدخول|دخول/i }).first().click();
  await page.waitForTimeout(1200);
  const cookies = await context.cookies();
  if (!cookies.some((cookie) => cookie.name.includes("auth-token"))) throw new Error("Authentication cookie missing");
  await page.goto(`${baseUrl}/`, { waitUntil: "commit", timeout: 60000 });
  if (/\/login(?:[/?#]|$)/i.test(page.url())) throw new Error(`Login did not establish session: ${page.url()}`);
}

function rectInsideViewport(rect, viewportWidth, viewportHeight) {
  return rect.width > 0 && rect.height > 0 && rect.left >= -1 && rect.top >= -1 && rect.right <= viewportWidth + 1 && rect.bottom <= viewportHeight + 1;
}

async function expectNoOverflow(label) {
  const state = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  if (state.scrollWidth > state.width + 8) throw new Error(`${label}: horizontal overflow ${state.scrollWidth} > ${state.width}`);
}

async function expectHeader() {
  await page.getByTestId("global-header").waitFor({ state: "visible", timeout: 15000 });
  const header = page.getByTestId("global-header");
  const rect = await header.boundingBox();
  const viewport = page.viewportSize();
  if (!rect || !viewport || rect.width < viewport.width * 0.70 || rect.x < -1 || rect.x + rect.width > viewport.width + 1) {
    throw new Error(`Header geometry invalid: ${JSON.stringify({ rect, viewport })}`);
  }
  const brand = page.getByTestId("global-header-brand");
  if (await brand.count() && !(await brand.boundingBox())) throw new Error("Brand geometry unavailable");
}

async function expectSidebar(mobileish) {
  const sidebar = page.locator("#global-sidebar");
  await sidebar.waitFor({ state: "attached" });
  if (!mobileish) {
    await sidebar.waitFor({ state: "visible" });
    const rect = await sidebar.boundingBox();
    const viewport = page.viewportSize();
    const dir = await page.locator("html").getAttribute("dir");
    if (!rect || !viewport || !rect.height) throw new Error("Desktop sidebar not visible");
    if (dir === "rtl") {
      if (Math.abs(rect.x + rect.width - viewport.width) > 8) throw new Error("RTL desktop sidebar is not anchored to inline end");
    } else if (Math.abs(rect.x) > 8) throw new Error("LTR desktop sidebar is not anchored to inline start");
  } else {
    const trigger = page.getByTestId("global-header-mobile-nav");
    await trigger.click();
    await page.waitForTimeout(150);
    await sidebar.waitFor({ state: "visible", timeout: 5000 });
    const rect = await sidebar.boundingBox();
    if (!rect || !rect.width) throw new Error("Responsive sidebar failed to open");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
  }
}

async function expectOverlay(testId, panelId) {
  const trigger = page.getByTestId(testId);
  await trigger.waitFor({ state: "visible", timeout: 15000 });
  await trigger.click();
  const panel = page.locator(`#${panelId}`);
  await panel.waitFor({ state: "visible", timeout: 10000 });
  const inside = await panel.evaluate((node) => {
    const r = node.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height, viewportWidth: window.innerWidth, viewportHeight: window.innerHeight };
  });
  if (!(inside.width > 0 && inside.height > 0 && inside.left >= -1 && inside.top >= -1 && inside.right <= inside.viewportWidth + 1 && inside.bottom <= inside.viewportHeight + 1)) {
    throw new Error(`Overlay out of viewport: ${JSON.stringify(inside)}`);
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  if (await panel.isVisible().catch(() => false)) throw new Error(`${panelId} did not close on Escape`);
}

async function expectDirection(locale, direction) {
  await context.addCookies([
    { name: "core-system-locale", value: locale, url: baseUrl },
    { name: "core-system-direction", value: direction, url: baseUrl },
  ]);
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(250);
  const htmlDir = await page.locator("html").getAttribute("dir");
  const headerDir = await page.getByTestId("global-header").getAttribute("dir");
  if (htmlDir !== direction || headerDir !== direction) throw new Error(`Direction mismatch locale=${locale}: html=${htmlDir} header=${headerDir}`);
  await expectNoOverflow(`${locale}/${direction}`);
  await expectOverlay("quick-actions-header-control", "global-quick-actions-menu");
  await page.getByTestId("global-header-chat").click();
  const chat = page.getByTestId("global-chat-panel");
  await chat.waitFor({ state: "visible", timeout: 10000 });
  if ((await chat.getAttribute("dir")) !== direction) throw new Error(`Chat direction mismatch: ${await chat.getAttribute("dir")}`);
  const chatRect = await chat.evaluate((node) => {
    const r = node.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height, viewportWidth: window.innerWidth, viewportHeight: window.innerHeight };
  });
  if (!rectInsideViewport(chatRect, chatRect.viewportWidth, chatRect.viewportHeight)) throw new Error(`Chat outside viewport in ${direction}`);
  await page.keyboard.press("Escape");
}

await login();

for (const [mode, width, height] of [
  ["desktop", 1440, 900],
  ["desktop", 1280, 800],
  ["tablet", 1023, 768],
  ["tablet", 768, 1024],
  ["mobile", 390, 844],
  ["mobile", 844, 390],
]) {
  await page.setViewportSize({ width, height });
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(250);
  await expectHeader();
  await expectSidebar(!(mode === "desktop" && width >= 1024));
  await expectNoOverflow(`${mode}-${width}x${height}`);
  const mobileSearch = page.getByTestId("global-search-mobile-trigger");
  const desktopSearch = page.locator('[data-testid="global-header-search-slot"] input');
  if (width < 768) {
    if (!(await mobileSearch.isVisible().catch(() => false))) throw new Error("Mobile search trigger missing");
    if (await desktopSearch.isVisible().catch(() => false)) throw new Error("Desktop search field visible on mobile");
  } else if (!(await desktopSearch.isVisible().catch(() => false))) {
    throw new Error("Desktop/tablet search field missing");
  }

  for (const [testId, panelId] of [
    ["global-header-communications", "global-communications-panel"],
    ["notifications-header-control", "notifications-header-panel"],
    ["quick-actions-header-control", "global-quick-actions-menu"],
  ]) {
    await expectOverlay(testId, panelId);
  }

  const chatTrigger = page.getByTestId("global-header-chat");
  await chatTrigger.click();
  const chat = page.getByTestId("global-chat-panel");
  await chat.waitFor({ state: "visible", timeout: 10000 });
  const chatRect = await chat.evaluate((node) => {
    const r = node.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height, viewportWidth: window.innerWidth, viewportHeight: window.innerHeight };
  });
  if (!rectInsideViewport(chatRect, chatRect.viewportWidth, chatRect.viewportHeight)) throw new Error(`Chat outside viewport at ${mode} ${width}x${height}`);
  await page.keyboard.press("Escape");
}

await page.setViewportSize({ width: 1440, height: 900 });
await expectDirection("en", "ltr");
await expectDirection("ar", "rtl");

await context.addCookies([
  { name: "core-system-locale", value: "en", url: baseUrl },
  { name: "core-system-direction", value: "ltr", url: baseUrl },
]);
await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 60000 });

const standalonePage = await context.newPage();
await standalonePage.addInitScript(() => {
  const original = window.matchMedia.bind(window);
  window.matchMedia = ((query) => {
    if (query === "(display-mode: standalone)") return { matches: true, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } };
    return original(query);
  });
  Object.defineProperty(navigator, "standalone", { configurable: true, value: true });
});
await standalonePage.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 60000 });
await standalonePage.waitForTimeout(250);
const standalone = await standalonePage.evaluate(() => ({ standalone: window.matchMedia("(display-mode: standalone)").matches, overflow: document.documentElement.scrollWidth > window.innerWidth + 8 }));
if (!standalone.standalone) throw new Error("Standalone display-mode emulation failed");
if (standalone.overflow) throw new Error("Standalone viewport overflow detected");
await standalonePage.close();

await browser.close();
console.log("GLOBAL_EXPERIENCE_PRESENTATION_RUNTIME=PASS");
