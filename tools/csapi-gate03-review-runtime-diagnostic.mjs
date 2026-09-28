import { chromium } from "playwright";

const baseUrl = (process.env.CORE_SYSTEM_PRODUCTION_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.CORE_SYSTEM_E2E_EMAIL;
const password = process.env.CORE_SYSTEM_E2E_PASSWORD;
if (!email || !password) throw new Error("Missing E2E credentials");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "en-US", viewport: { width: 390, height: 844 } });
const page = await context.newPage();
page.setDefaultTimeout(30000);

page.on("pageerror", (error) => console.log("PAGE_ERROR=" + error.message));
page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") console.log("BROWSER_CONSOLE=" + msg.type() + ":" + msg.text());
});
page.on("request", (request) => {
  if (request.url().includes("/api/patients")) console.log("API_REQUEST=" + request.method() + " " + request.url());
});
page.on("requestfailed", (request) => {
  if (request.url().includes("/api/patients")) console.log("API_REQUEST_FAILED=" + request.method() + " " + request.url() + " " + request.failure()?.errorText);
});
page.on("response", (response) => {
  if (response.url().includes("/api/patients")) console.log("API_RESPONSE=" + response.status() + " " + response.url());
});

const stamp = "G03-DIAG-" + Date.now();
const phone = "0788" + Date.now().toString().slice(-6);
const dob = "1980-05-15";

async function login() {
  await context.clearCookies();
  await page.goto(baseUrl + "/login", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator('input[type="email"],input[name="email"]').first().fill(email);
  await page.locator('input[type="password"],input[name="password"]').first().fill(password);
  await page.getByRole("button", { name: /sign in|login|log in|تسجيل الدخول|دخول/i }).first().click();
  const token = await page.waitForResponse((r) => r.url().includes("/auth/v1/token"), { timeout: 20000 });
  console.log("AUTH_STATUS=" + token.status());
  await page.waitForTimeout(1200);
  await page.goto(baseUrl + "/patients", { waitUntil: "commit", timeout: 60000 });
  console.log("PATIENTS_URL=" + page.url());
}

async function openForm() {
  await page.getByRole("button", { name: /add patient/i }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible" });
  return dialog;
}

async function fill(dialog, first, family, phoneValue) {
  await dialog.locator("#first_name").fill(first);
  await dialog.locator("#last_name").fill(family);
  await dialog.locator("#father_name").fill("G03 Father");
  await dialog.locator("#family_name").fill(family);
  await dialog.locator("#phone_primary").fill(phoneValue);
  await dialog.locator("#date_of_birth").fill(dob);
  await dialog.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Male", exact: true }).click();
}

try {
  await login();

  const first = stamp + " Primary";
  const family = stamp + " Family";
  let dialog = await openForm();
  await fill(dialog, first, family, phone);
  const firstRespP = page.waitForResponse((r) => r.url().includes("/api/patients") && r.request().method() === "POST", { timeout: 20000 });
  await dialog.getByRole("button", { name: /save/i }).last().click();
  const firstResp = await firstRespP;
  console.log("FIRST_SAVE_STATUS=" + firstResp.status());
  console.log("FIRST_SAVE_BODY=" + JSON.stringify(await firstResp.json()));
  await page.waitForTimeout(500);
  await dialog.waitFor({ state: "visible" });

  const reviewName = stamp + " Review";
  await dialog.locator("#first_name").fill(reviewName);
  const reviewRespP = page.waitForResponse((r) => r.url().includes("/api/patients") && r.request().method() === "POST", { timeout: 20000 });
  await dialog.getByRole("button", { name: /save/i }).last().click();
  const reviewResp = await reviewRespP;
  console.log("REVIEW_STATUS=" + reviewResp.status());
  console.log("REVIEW_BODY=" + JSON.stringify(await reviewResp.json()));

  const candidateText = dialog.getByText(first, { exact: false });
  await candidateText.waitFor({ state: "visible", timeout: 20000 });

  const button = dialog.getByRole("button", { name: /create new after review|إنشاء ملف جديد بعد المراجعة/i });
  console.log("CREATE_BUTTON_COUNT=" + await button.count());
  console.log("CREATE_BUTTON_DISABLED=" + await button.isDisabled());
  console.log("CREATE_BUTTON_HTML=" + await button.evaluate((el) => el.outerHTML));

  let createRequestSeen = false;
  const createRequestP = page.waitForRequest(
    (r) => r.url().includes("/api/patients") && r.request().method() === "POST",
    { timeout: 5000 },
  ).then((r) => {
    createRequestSeen = true;
    console.log("CREATE_REQUEST_BODY=" + r.postData());
    return r;
  }).catch((e) => {
    console.log("CREATE_REQUEST_TIMEOUT=" + e.message);
    return null;
  });

  await button.click();
  console.log("CREATE_BUTTON_CLICK_RETURNED=true");
  await page.waitForTimeout(1000);
  console.log("AFTER_CLICK_DISABLED=" + await button.isDisabled().catch(() => true));
  console.log("AFTER_CLICK_DIALOG_VISIBLE=" + await dialog.isVisible().catch(() => false));
  await createRequestP;
  console.log("CREATE_REQUEST_SEEN=" + createRequestSeen);
  console.log("AFTER_REQUEST_DIALOG_VISIBLE=" + await dialog.isVisible().catch(() => false));
} finally {
  await browser.close();
}
