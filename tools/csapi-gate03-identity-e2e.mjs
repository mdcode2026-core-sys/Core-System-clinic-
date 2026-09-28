import { chromium } from "playwright";

const baseUrl = (process.env.CORE_SYSTEM_PRODUCTION_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.CORE_SYSTEM_E2E_EMAIL;
const password = process.env.CORE_SYSTEM_E2E_PASSWORD;
if (!email || !password) throw new Error("Missing E2E credentials");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "en-US", viewport: { width: 390, height: 844 } });
const page = await context.newPage();
page.setDefaultTimeout(30000);

const stamp = `G03-${Date.now()}`;
const phone = `0799${Date.now().toString().slice(-6)}`;
const dob = "1980-05-15";

async function login() {
  const authResponsePromise = page.waitForResponse(
    (r) => r.url().includes("/auth/v1/token"),
    { timeout: 20000 },
  ).catch(() => null);

  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator('input[type="email"],input[name="email"]').first().fill(email);
  await page.locator('input[type="password"],input[name="password"]').first().fill(password);
  await page.getByRole("button", { name: /sign in|login|log in/i }).first().click();

  const authResponse = await authResponsePromise;
  if (authResponse?.status() !== 200) {
    throw new Error(`Authenticated login failed: HTTP ${authResponse?.status() ?? "no-response"}`);
  }
  await page.goto(`${baseUrl}/patients`, { waitUntil: "commit", timeout: 60000 });
  if (/\/login(?:[/?#]|$)/i.test(page.url())) throw new Error("Patients page redirected to login");
}

async function openPatientForm() {
  await page.getByRole("button", { name: /add patient/i }).waitFor({ state: "visible" });
  await page.getByRole("button", { name: /add patient/i }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible" });
  return dialog;
}

async function fillRegistration(dialog, firstName, familyName, phoneValue) {
  await dialog.locator("#first_name").fill(firstName);
  await dialog.locator("#last_name").fill(familyName);
  await dialog.locator("#father_name").fill("G03 Father");
  await dialog.locator("#family_name").fill(familyName);
  await dialog.locator("#phone_primary").fill(phoneValue);
  await dialog.locator("#date_of_birth").fill(dob);
  await dialog.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Male", exact: true }).click();
}

async function save(dialog) {
  await dialog.getByRole("button", { name: /save/i }).last().click();
}

async function findPatient(text) {
  const patient = page.getByText(text, { exact: false }).first();
  await patient.waitFor({ state: "visible", timeout: 30000 });
  return patient;
}

async function searchPatient(text) {
  const search = page.locator('input[placeholder*="Search"],input[placeholder*="search"]').first();
  await search.waitFor({ state: "visible", timeout: 10000 });
  await search.fill(text);
  await page.waitForTimeout(500);
  return findPatient(text);
}

try {
  await login();
  console.log("PASS|gate03 authenticated login");

  // 1. Canonical registration without national ID.
  const firstPatientName = `${stamp} Primary`;
  const firstFamily = `${stamp} Family`;
  let dialog = await openPatientForm();
  await fillRegistration(dialog, firstPatientName, firstFamily, phone);
  if (await dialog.locator("#national_id").inputValue() !== "") {
    throw new Error("Gate 03 E2E fixture unexpectedly requires national ID");
  }
  await save(dialog);
  await dialog.waitFor({ state: "hidden", timeout: 20000 });
  await findPatient(firstPatientName);
  console.log("PASS|gate03 registration without national ID");

  // 2. Deliberately create a weighted-but-not-exact duplicate candidate.
  // Same DOB + father + family + sex yields the approved REVIEW_REQUIRED path
  // while changing first name prevents the non-government-ID exact path.
  const reviewPatientName = `${stamp} Review`;
  dialog = await openPatientForm();
  await fillRegistration(dialog, reviewPatientName, firstFamily, phone);
  await save(dialog);

  await dialog.getByText(/review required/i).waitFor({ state: "visible", timeout: 20000 });
  await dialog.getByRole("button", { name: /create new after review/i }).click();
  await dialog.waitFor({ state: "hidden", timeout: 20000 });
  await findPatient(reviewPatientName);
  console.log("PASS|gate03 REVIEW_REQUIRED and CREATE_NEW resolution");

  // 3. Authoritative search must return the created record.
  await searchPatient(reviewPatientName);
  console.log("PASS|gate03 authoritative patient search");

  // 4. Edit the existing patient and verify the same patient remains discoverable
  // under the updated family name rather than creating a second record.
  const updatedFamily = `${stamp} UpdatedFamily`;
  const row = page.locator("div.rounded-lg.border.p-4").filter({ hasText: reviewPatientName }).first();
  await row.getByRole("button", { name: /edit/i }).click();
  dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible" });
  await dialog.locator("#family_name").fill(updatedFamily);
  await dialog.locator("#last_name").fill(updatedFamily);
  await save(dialog);
  await dialog.waitFor({ state: "hidden", timeout: 20000 });

  await page.locator('input[placeholder*="Search"],input[placeholder*="search"]').first().fill(updatedFamily);
  await page.waitForTimeout(500);
  const updatedPatient = await page.getByText(reviewPatientName, { exact: false }).first();
  await updatedPatient.waitFor({ state: "visible", timeout: 20000 });

  const oldMatch = page.getByText(reviewPatientName, { exact: false });
  if (await oldMatch.count() !== 1) {
    throw new Error(`Identity-preserving update did not leave exactly one visible patient record; count=${await oldMatch.count()}`);
  }
  console.log("PASS|gate03 identity-preserving demographic update");

  console.log("CSAPI_GATE03_IDENTITY_AUTHENTICATED_E2E=PASS");
} finally {
  await browser.close();
}
