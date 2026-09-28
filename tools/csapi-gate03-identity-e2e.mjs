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
const fatherName = `${stamp} Father`;

async function login() {
  let lastFailure = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    await context.clearCookies();
    const authResponsePromise = page.waitForResponse(
      (r) => r.url().includes("/auth/v1/token"),
      { timeout: 20000 },
    ).catch(() => null);

    await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const emailInput = page.locator('input[type="email"],input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"],input[name="password"]').first();
    const submit = page.getByRole("button", { name: /sign in|login|log in|تسجيل الدخول|دخول/i }).first();
    await emailInput.waitFor({ state: "visible", timeout: 15000 });
    await passwordInput.waitFor({ state: "visible", timeout: 15000 });
    await submit.waitFor({ state: "visible", timeout: 15000 });
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submit.click();

    const authResponse = await authResponsePromise;
    const status = authResponse?.status() ?? null;
    if (status !== 200) {
      lastFailure = `attempt=${attempt} HTTP=${status ?? "no-response"} url=${page.url()}`;
      if (attempt < 3) { await page.waitForTimeout(1000); continue; }
      throw new Error(`Authenticated login failed. ${lastFailure}`);
    }

    await page.waitForTimeout(1500);
    const cookies = await context.cookies(baseUrl);
    const hasAuthCookie = cookies.some((cookie) => cookie.name.includes("auth-token"));
    if (!hasAuthCookie) {
      lastFailure = `attempt=${attempt} HTTP=200 but no auth cookie`;
      if (attempt < 3) { await page.waitForTimeout(1000); continue; }
      throw new Error(`Authenticated login did not establish a session. ${lastFailure}`);
    }

    await page.goto(`${baseUrl}/patients`, { waitUntil: "commit", timeout: 60000 });
    if (!/\/login(?:[/?#]|$)/i.test(page.url())) return;
    lastFailure = `attempt=${attempt} redirected to login`;
    if (attempt < 3) await page.waitForTimeout(1000);
  }
  throw new Error(`Authenticated login did not establish a patient session. ${lastFailure}`);
}

async function openPatientForm() {
  await page.getByRole("button", { name: /add patient/i }).waitFor({ state: "visible" });
  await page.getByRole("button", { name: /add patient/i }).click();
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible" });
  return dialog;
}

async function fillRegistration(dialog, firstName, familyName, phoneValue, father = fatherName) {
  await dialog.locator("#first_name").fill(firstName);
  await dialog.locator("#last_name").fill(familyName);
  await dialog.locator("#father_name").fill(father);
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
  const reviewResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/patients") && response.request().method() === "POST",
    { timeout: 20000 },
  );
  await save(dialog);
  const reviewResponse = await reviewResponsePromise;
  const reviewPayload = await reviewResponse.json();
  if (reviewResponse.status() !== 409 || reviewPayload?.outcome !== "REVIEW_REQUIRED" || !reviewPayload?.candidate?.patient_identity_id) {
    throw new Error(`Gate 03 review contract mismatch: HTTP=${reviewResponse.status()} payload=${JSON.stringify(reviewPayload)}`);
  }

  // The review state is localized; assert the candidate rendered by the UI rather than
  // coupling the E2E to one translation string.
  await dialog.getByText(firstPatientName, { exact: false }).waitFor({ state: "visible", timeout: 20000 });
  const reviewActions = dialog.locator("div.rounded-md.border").filter({ hasText: firstPatientName }).getByRole("button");
  if (await reviewActions.count() !== 2) {
    throw new Error(`Gate 03 review actions contract mismatch: expected 2 buttons, found=${await reviewActions.count()}`);
  }
  await reviewActions.nth(1).click();
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
