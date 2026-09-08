import { chromium } from "playwright";

const baseUrl = (process.env.CORE_SYSTEM_PRODUCTION_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.CORE_SYSTEM_E2E_EMAIL;
const password = process.env.CORE_SYSTEM_E2E_PASSWORD;
if (!email || !password) throw new Error("Missing E2E credentials");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "en-US", viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const failures = [];
const stamp = `E2E-${Date.now()}`;
const testPhone = `0799${Date.now().toString().slice(-6)}`;

async function step(name, fn) {
  try { await fn(); console.log(`PASS|${name}`); }
  catch (e) { const message = `${name}: ${e instanceof Error ? e.message : String(e)}`; failures.push(message); console.error(`FAIL|${message}`); throw e; }
}
async function login() {
  let lastStatus = "unknown";
  for (let attempt = 1; attempt <= 3; attempt++) {
    await context.clearCookies();
    const authResponsePromise = page.waitForResponse((r) => r.url().includes("/auth/v1/token"), { timeout: 20000 }).catch(() => null);
    await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.locator('input[type="email"],input[name="email"]').first().fill(email);
    await page.locator('input[type="password"],input[name="password"]').first().fill(password);
    await page.getByRole("button", { name: /sign in|login|log in|تسجيل الدخول|دخول/i }).first().click();
    const authResponse = await authResponsePromise; lastStatus = authResponse?.status() ?? "no-response"; await page.waitForTimeout(1500);
    const cookies = await context.cookies(); const hasAuthCookie = cookies.some((c) => c.name.includes("auth-token"));
    console.log(`E2E_LOGIN_ATTEMPT=${attempt} AUTH_STATUS=${lastStatus} AUTH_COOKIE=${hasAuthCookie} URL=${page.url()}`);
    if (lastStatus === 200 && hasAuthCookie) { await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded", timeout: 60000 }); await page.waitForTimeout(1000); if (!/\/login(?:[/?#]|$)/i.test(page.url())) return; }
    if (attempt < 3) await page.waitForTimeout(1500);
  }
  throw new Error(`E2E login did not establish a session (last auth status: ${lastStatus})`);
}
async function goto(path) {
  const r = await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  if (!r || r.status() >= 400) throw new Error(`HTTP ${r?.status() ?? "unknown"}`);
  await page.waitForTimeout(250); if (/\/login(?:[/?#]|$)/i.test(page.url())) throw new Error(`Redirected to login from ${path}`);
}
async function button(re) { const b = page.getByRole("button", { name: re }).first(); await b.waitFor({ state: "visible", timeout: 10000 }); await b.click(); }
function isRetryableBookingConflict(errorCode) {
  if (typeof errorCode !== "string") return false;
  const [code, reason = ""] = errorCode.split("|", 2);
  if (["AGENDA_CONFLICT_DOCTOR", "AGENDA_CONFLICT_ROOM", "AGENDA_CONFLICT_RESOURCE", "AGENDA_CONFLICT_PATIENT"].includes(code)) return true;
  if (code !== "AGENDA_UNAVAILABLE") return false;
  return /already booked|blocked|unavailable|outside provider working hours|outside.*working hours/i.test(reason);
}
await step("login", login);
for (const [name, path] of [["workspace", "/"],["patients", "/patients"],["agenda", "/agenda"],["patient-flow", "/patient-flow"],["treatment-plans", "/treatment-plans"],["financial", "/financial-resources"],["financial-plans", "/financial-resources/financial-plans"],["installments", "/financial-resources/financial-plans/installments"],["insurance", "/financial-resources/insurance"],["claims", "/financial-resources/insurance/claims"],["inventory", "/inventory"],["consumption", "/financial-resources/inventory/consumption"],["purchasing", "/financial-resources/purchasing"],["suppliers", "/financial-resources/purchasing/suppliers"],["receiving", "/financial-resources/purchasing/receiving"],["workforce", "/workforce"],["communications", "/communications"],["work-center", "/work-center"],["follow-up", "/follow-up"],["reports", "/reports"],["analytics", "/analytics"],["settings", "/settings"]]) await step(`route:${name}`, () => goto(path));
await step("patient entry and persistence", async () => {
  await goto("/patients"); await button(/add patient|إضافة مريض/i); const dialog = page.getByRole("dialog"); await dialog.waitFor({ state: "visible", timeout: 10000 });
  await dialog.locator('input#first_name').fill(`${stamp} Patient`); await dialog.locator('input#last_name').fill("E2E"); await dialog.locator('input#phone_primary').fill(testPhone); await dialog.getByRole("button", { name: /save|حفظ/i }).click();
  try { await dialog.waitFor({ state: "hidden", timeout: 15000 }); } catch { throw new Error(`Patient save did not close dialog; visible dialog text: ${(await dialog.innerText()).slice(0, 1200)}`); }
  await page.getByText(`${stamp} Patient`, { exact: false }).first().waitFor({ state: "visible", timeout: 20000 }); await page.getByText(testPhone, { exact: true }).first().waitFor({ state: "visible", timeout: 5000 });
});
await step("appointment booking", async () => {
  await goto("/patients"); const patient = page.getByText(`${stamp} Patient`, { exact: false }).first(); await patient.waitFor({ state: "visible", timeout: 20000 });
  const row = patient.locator("xpath=ancestor::div[contains(@class,'rounded-lg')][1]"); await row.getByRole("button", { name: /view|عرض/i }).click(); const detailDialog = page.getByRole("dialog"); await detailDialog.waitFor({ state: "visible", timeout: 10000 }); await detailDialog.getByRole("button", { name: /appointment|موعد/i }).click();
  const dialog = page.getByRole("dialog").last(); await dialog.waitFor({ state: "visible", timeout: 10000 }); await dialog.getByRole("heading", { name: /appointment|موعد/i }).waitFor({ state: "visible", timeout: 10000 });
  const doctorTrigger = dialog.getByRole("combobox").nth(0); await doctorTrigger.waitFor({ state: "visible", timeout: 10000 });
  const dateInputs = dialog.locator('input[type="date"]');
  if (await dateInputs.count()) { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); await dateInputs.first().fill(tomorrow.toISOString().slice(0, 10)); }
  const timeInputs = dialog.locator('input[type="time"]'); if (await timeInputs.count() < 2) throw new Error("Appointment time inputs missing");
  const candidateSlots = [["09:00","09:30"],["09:30","10:00"],["10:00","10:30"],["10:30","11:00"],["11:00","11:30"],["11:30","12:00"],["12:00","12:30"],["12:30","13:00"],["13:00","13:30"],["13:30","14:00"],["14:00","14:30"],["14:30","15:00"],["15:00","15:30"],["15:30","16:00"],["16:00","16:30"],["16:30","17:00"]];
  let booked = false; let lastConflict = "none";
  await doctorTrigger.click(); await page.getByRole("option").first().waitFor({ state: "visible", timeout: 10000 });
  const doctorCount = await page.getByRole("option").count();
  for (let doctorIndex = 0; doctorIndex < doctorCount && !booked; doctorIndex++) {
    await doctorTrigger.click(); const options = page.getByRole("option"); await options.nth(doctorIndex).click();
    for (const [start, end] of candidateSlots) {
      await timeInputs.nth(0).fill(start); await timeInputs.nth(1).fill(end); const responsePromise = page.waitForResponse((r) => r.url().includes("/api/agenda/events") && r.request().method() === "POST", { timeout: 15000 }).catch(() => null); await dialog.getByRole("button", { name: /create|إنشاء/i }).click();
      const response = await responsePromise; const result = response ? await response.json().catch(() => null) : null; const status = response?.status() ?? "no-response";
      if (status >= 200 && status < 300 && !result?.error) { booked = true; console.log(`E2E_APPOINTMENT_BOOKED=doctor-${doctorIndex}:${start}-${end}`); break; }
      const errorCode = result?.error; lastConflict = String(errorCode ?? `HTTP_${status}`); if (!isRetryableBookingConflict(errorCode)) throw new Error(`Appointment booking failed at doctor-${doctorIndex} ${start}-${end}: ${lastConflict}; dialog: ${(await dialog.innerText()).slice(0, 1200)}`); console.log(`E2E_APPOINTMENT_SLOT_CONFLICT=doctor-${doctorIndex}:${start}-${end} ERROR=${lastConflict}`); await page.waitForTimeout(150);
    }
  }
  if (!booked) throw new Error(`No collision-free appointment slot was accepted across ${doctorCount} providers; last result: ${lastConflict}`); await dialog.waitFor({ state: "hidden", timeout: 15000 }); await page.waitForTimeout(1000); await goto("/agenda");
});
await step("agenda lifecycle", async () => { await goto("/agenda"); const patient = page.getByText(`${stamp} Patient`, { exact: false }).first(); await patient.waitFor({ state: "visible", timeout: 20000 }); await patient.click(); for (const re of [/reschedule|إعادة الجدولة/i,/confirm|تأكيد/i,/check in|arrived|حضر/i,/start|بدء/i,/finish|complete|إنهاء|إكمال/i]) if (await page.getByRole("button", { name: re }).count()) { await page.getByRole("button", { name: re }).first().click(); await page.waitForTimeout(250); } });
await step("treatment plan", async () => { await goto("/treatment-plans"); if (await page.getByRole("button", { name: /new plan|خطة جديدة/i }).count()) await button(/new plan|خطة جديدة/i); });
await step("financial plan and installments", async () => { await goto("/financial-resources/financial-plans"); const nums = page.locator('input[type="number"]'); if (await nums.count() < 2) throw new Error("Financial plan form missing"); await nums.nth(0).fill("150"); await nums.nth(1).fill("50"); if (await page.getByRole("button", { name: /create|إنشاء|save|حفظ/i }).count()) await page.getByRole("button", { name: /create|إنشاء|save|حفظ/i }).last().click(); await goto("/financial-resources/financial-plans/installments"); if (!(await page.locator("body").innerText()).match(/installment|قسط/i)) throw new Error("Installments surface missing"); });
await step("insurance and claims", async () => { await goto("/financial-resources/insurance"); if (!(await page.locator("body").innerText()).match(/insurance|تأمين/i)) throw new Error("Insurance surface missing"); await goto("/financial-resources/insurance/claims"); if (!(await page.locator("body").innerText()).match(/claim|مطالب/i)) throw new Error("Claims surface missing"); });
await step("inventory purchasing receiving", async () => { for (const p of ["/inventory","/financial-resources/inventory/consumption","/financial-resources/purchasing/suppliers","/financial-resources/purchasing","/financial-resources/purchasing/receiving"]) await goto(p); });
await step("workforce", async () => { await goto("/workforce"); if (!(await page.locator("body").innerText()).match(/employee|موظف/i)) throw new Error("Employee surface missing"); });
await step("communications", async () => { await goto("/communications"); if (!(await page.locator("body").innerText()).match(/communication|اتصال|تواصل/i)) throw new Error("Communications surface missing"); });
await step("work center", async () => { await goto("/work-center"); if (!(await page.locator("body").innerText()).match(/work|عمل|task|مهمة/i)) throw new Error("Work Center surface missing"); });
await step("follow-up and analytics", async () => { for (const p of ["/follow-up","/reports","/analytics","/dashboard"]) await goto(p); });
await step("Arabic parity", async () => { await context.addCookies([{ name: "core-system-locale", value: "ar", url: baseUrl }]); await goto("/agenda"); if (await page.locator("html").getAttribute("dir") !== "rtl") throw new Error("RTL direction missing"); await goto("/workforce"); });
await step("mobile overflow", async () => { await goto("/"); if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 8)) throw new Error("Horizontal overflow detected"); });
await browser.close(); if (failures.length) { console.error(`SCENARIO_FAILURES=${failures.length}`); process.exit(1); } console.log("REAL_WORLD_CLINIC_ADMIN_E2E=PASS");
