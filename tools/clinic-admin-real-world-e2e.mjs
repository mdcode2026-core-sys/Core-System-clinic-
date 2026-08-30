import { chromium } from "playwright";

const baseUrl = (process.env.CORE_SYSTEM_PRODUCTION_URL || "https://core-system-clinic.vercel.app").replace(/\/$/, "");
const email = process.env.CORE_SYSTEM_E2E_EMAIL;
const password = process.env.CORE_SYSTEM_E2E_PASSWORD;
if (!email || !password) throw new Error("Missing Production E2E credentials");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "en-US", viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const failures = [];
const stamp = `E2E-${Date.now()}`;

async function step(name, fn) {
  try { await fn(); console.log(`PASS|${name}`); }
  catch (e) { failures.push(`${name}: ${e instanceof Error ? e.message : String(e)}`); console.error(`FAIL|${name}|${e instanceof Error ? e.message : String(e)}`); }
}
async function goto(path) {
  const r = await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded" });
  if (!r || r.status() >= 400) throw new Error(`HTTP ${r?.status() ?? "unknown"}`);
  await page.waitForLoadState("networkidle").catch(() => {});
  if (/\/login(?:[/?#]|$)/i.test(page.url())) throw new Error(`Redirected to login from ${path}`);
}
async function clickButton(re) {
  const b = page.getByRole("button", { name: re }).first();
  await b.waitFor({ state: "visible", timeout: 10000 });
  await b.click();
}

await step("login", async () => {
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"], input[name="password"]').first().fill(password);
  await clickButton(/sign in|login|log in|تسجيل الدخول|دخول/i);
  await page.waitForLoadState("networkidle").catch(() => {});
  if (/\/login(?:[/?#]|$)/i.test(page.url())) throw new Error("Login did not establish a session");
});

const routes = [
  ["workspace", "/"], ["patients", "/patients"], ["agenda", "/agenda"],
  ["patient-flow", "/patient-flow"], ["patient-flow-operations", "/patient-flow/operations"],
  ["patient-flow-clinical", "/patient-flow/clinical"], ["patient-flow-administrative", "/patient-flow/administrative"],
  ["treatment-plans", "/treatment-plans"], ["financial", "/financial-resources"],
  ["financial-plans", "/financial-resources/financial-plans"], ["installments", "/financial-resources/financial-plans/installments"],
  ["insurance", "/financial-resources/insurance"], ["claims", "/financial-resources/insurance/claims"],
  ["inventory", "/inventory"], ["consumption", "/financial-resources/inventory/consumption"],
  ["purchasing", "/financial-resources/purchasing"], ["suppliers", "/financial-resources/purchasing/suppliers"],
  ["receiving", "/financial-resources/purchasing/receiving"], ["workforce", "/workforce"],
  ["communications", "/communications"], ["work-center", "/work-center"], ["follow-up", "/follow-up"],
  ["reports", "/reports"], ["analytics", "/analytics"], ["dashboard", "/dashboard"], ["settings", "/settings"],
];
for (const [name, path] of routes) await step(`route:${name}`, async () => { await goto(path); });

await step("sidebar conceptual hierarchy", async () => {
  await goto("/");
  const body = await page.locator("body").innerText();
  for (const text of ["Patients", "Agenda", "Patient Flow", "Treatment Plans", "Financial & Resources", "Follow-up", "Reports", "Analytics", "Dashboard", "Settings"]) {
    if (!body.includes(text)) throw new Error(`Missing sidebar concept: ${text}`);
  }
  if (body.includes("WorkspaceSurfaceNav")) throw new Error("Legacy fixed workspace switcher leaked into UI");
});

let patientName = `${stamp} Patient`;
await step("patient creation", async () => {
  await goto("/patients");
  await clickButton(/new patient|add patient|إضافة مريض|مريض جديد/i);
  await page.locator('#first_name').fill(stamp);
  await page.locator('#last_name').fill("Patient");
  await page.locator('#phone_primary').fill("0799000000");
  await page.getByRole("button", { name: /save|حفظ/i }).last().click();
  await page.waitForLoadState("networkidle").catch(() => {});
  if (!(await page.locator("body").innerText()).includes(stamp)) throw new Error("Created patient not visible");
});

await step("appointment booking", async () => {
  await goto("/patients");
  const patientRow = page.getByText(patientName, { exact: false }).first();
  await patientRow.waitFor({ state: "visible", timeout: 10000 });
  const container = patientRow.locator("xpath=ancestor::*[self::tr or contains(@class,'border')][1]");
  const book = container.getByRole("button", { name: /book|appointment|حجز|موعد/i }).first();
  if (await book.count()) await book.click(); else await clickButton(/new appointment|موعد جديد/i);
  await page.locator('input[name="patientId"], input[name="patient_id"]').first().count().catch(() => {});
  const selects = page.locator("select");
  if (await selects.count() < 3) throw new Error("Appointment form missing expected scheduling fields");
  await clickButton(/save|create|حفظ|إنشاء/i);
  await page.waitForLoadState("networkidle").catch(() => {});
});

await step("agenda state transitions", async () => {
  await goto("/agenda");
  const eventText = page.getByText(patientName, { exact: false }).first();
  await eventText.waitFor({ state: "visible", timeout: 10000 });
  await eventText.click();
  await page.getByRole("button", { name: /confirm|تأكيد/i }).click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /check in|arrived|حضر/i }).click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /start|بدء/i }).click();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /finish|complete|إنهاء|إكمال/i }).click();
});

await step("treatment plan", async () => {
  const href = await page.getByText(patientName, { exact: false }).first().getAttribute("href").catch(() => null);
  const patientId = href?.match(/patientId=([^&]+)/)?.[1];
  if (!patientId) throw new Error("Could not recover patientId for contextual treatment plan test");
  await goto(`/treatment-plans?patientId=${patientId}`);
  await clickButton(/new plan|خطة جديدة/i);
  await page.locator('input').filter({ hasNot: page.locator('[type="hidden"]') }).nth(0).fill(`${stamp} Treatment`);
  const textareas = page.locator("textarea");
  if (await textareas.count()) await textareas.first().fill("Acne / pigmentation management plan");
  await clickButton(/create|إنشاء/i);
  await page.waitForLoadState("networkidle").catch(() => {});
});

await step("financial plan and installments", async () => {
  await goto("/financial-resources/financial-plans");
  const inputs = page.locator('input[type="number"]');
  if (await inputs.count() < 2) throw new Error("Financial plan form not available");
  await inputs.nth(0).fill("150"); await inputs.nth(1).fill("3");
  await clickButton(/create|إنشاء/i);
  await page.waitForLoadState("networkidle").catch(() => {});
  await goto("/financial-resources/financial-plans/installments");
  if (!(await page.locator("body").innerText()).match(/installment|قسط/i)) throw new Error("Installment surface did not render");
});

await step("insurance", async () => {
  await goto("/financial-resources/insurance");
  if (!(await page.locator("body").innerText()).match(/insurance|تأمين/i)) throw new Error("Insurance surface missing");
});

await step("inventory and purchasing", async () => {
  await goto("/inventory");
  await goto("/financial-resources/inventory/consumption");
  await goto("/financial-resources/purchasing/suppliers");
  await goto("/financial-resources/purchasing");
  await goto("/financial-resources/purchasing/receiving");
});

await step("workforce operations", async () => {
  await goto("/workforce");
  await page.getByRole("heading", { name: /employees|الموظفون/i }).first().waitFor({ state: "visible" });
  const firstName = page.locator('input[name="first_name"]').first();
  if (!(await firstName.count())) throw new Error("Employee creation form missing");
  await firstName.fill(stamp); await page.locator('input[name="last_name"]').fill("Staff");
  await clickButton(/add employee|إضافة موظف/i);
  await page.waitForLoadState("networkidle").catch(() => {});
  if (!(await page.locator("body").innerText()).includes(stamp)) throw new Error("Employee creation not reflected");
});

await step("communications and work coordination", async () => {
  await goto("/communications");
  await page.locator('input[name="subject"]').fill(`${stamp} conversation`);
  await clickButton(/start conversation|بدء المحادثة/i);
  await page.waitForLoadState("networkidle").catch(() => {});
  await goto("/work-center");
  await page.locator('input[name="title"]').fill(`${stamp} task`);
  await clickButton(/create$/i);
  await page.waitForLoadState("networkidle").catch(() => {});
});

await step("follow-up and reports", async () => { await goto("/follow-up"); await goto("/reports"); await goto("/analytics"); await goto("/dashboard"); });

await step("Arabic parity", async () => {
  await context.addCookies([{ name: "core-system-locale", value: "ar", url: baseUrl }]);
  await goto("/agenda");
  const html = await page.locator("html").getAttribute("dir");
  if (html !== "rtl") throw new Error(`Expected RTL, got ${html}`);
  await goto("/workforce");
  if (!(await page.locator("body").innerText()).includes("القوى العاملة")) throw new Error("Arabic workforce surface missing");
});

await step("mobile shell", async () => {
  await goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 8);
  if (overflow) throw new Error("Horizontal overflow detected on 390px viewport");
});

await browser.close();
if (failures.length) { console.error(`SCENARIO_FAILURES=${failures.length}`); process.exit(1); }
console.log("REAL_WORLD_CLINIC_ADMIN_E2E=PASS");
