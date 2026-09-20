import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const baseUrl = (process.env.CORE_SYSTEM_PRODUCTION_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.CSAPI_D3_RUNTIME_PASSWORD || "D3-Runtime-2026!";
if (!supabaseUrl || !serviceRoleKey) throw new Error("Missing local Supabase runtime credentials");

const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const stamp = Date.now();
const tenantId = "00000000-0000-0000-0000-00000000d3a1";
const legacyTenantId = tenantId;
const patientId = "00000000-0000-0000-0000-00000000d3a9";
const visitId = "00000000-0000-0000-0000-00000000d3aa";
const roomId = "00000000-0000-0000-0000-00000000d3ab";
const doctorEmail = `d3-runtime-doctor-${stamp}@example.test`;
const receptionEmail = `d3-runtime-reception-${stamp}@example.test`;
let doctorAuthId = null;
let receptionAuthId = null;
let doctorClinicId = "00000000-0000-0000-0000-00000000d3a4";
let receptionClinicId = "00000000-0000-0000-0000-00000000d3a6";

async function seed() {
  for (const email of [doctorEmail, receptionEmail]) {
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { d3_runtime: true } });
    if (created.error) throw new Error(`Auth seed failed for ${email}: ${created.error.message}`);
    if (email === doctorEmail) doctorAuthId = created.data.user.id;
    else receptionAuthId = created.data.user.id;
  }

  const { error: tenantError } = await admin.from("master_tenants").upsert({
    id: tenantId, clinic_name: "CSAPI D3 Runtime Clinic", license_key: `CSAPI-D3-RUNTIME-${stamp}`,
    timezone: "Asia/Amman", currency: "JOD", country_code: "JO",
  }, { onConflict: "id" });
  if (tenantError) throw new Error(`Tenant seed failed: ${tenantError.message}`);

  const { error: legacyTenantError } = await admin.from("tenants").upsert({
    id: legacyTenantId, clinic_name: "CSAPI D3 Runtime Legacy Clinic", license_key: `CSAPI-D3-RUNTIME-${stamp}`,
    timezone: "Asia/Amman", currency: "JOD", country_code: "JO", is_active: true,
  }, { onConflict: "id" });
  if (legacyTenantError) throw new Error(`Legacy tenant seed failed: ${legacyTenantError.message}`);

  const { data: plan, error: planError } = await admin.from("subscription_plans").upsert({
    id: "00000000-0000-0000-0000-00000000d3af",
    plan_key: "enterprise", plan_name: "D3 Runtime Full Subscription", plan_name_ar: "D3 Runtime Full Subscription",
    max_users: 100, max_devices: 100, max_branches: 100, modules: ["all"], ai_limits: {}, storage_gb: 100, api_rate_limit: 1000, is_active: true,
  }, { onConflict: "plan_key" }).select("id").single();
  if (planError || !plan) throw new Error(`Subscription plan seed failed: ${planError?.message ?? "missing plan"}`);

  const { error: subscriptionError } = await admin.from("subscriptions").upsert({
    id: "00000000-0000-0000-0000-00000000d3ad",
    tenant_id: tenantId, plan_id: plan.id, status: "active", billing_cycle: "monthly", started_at: new Date().toISOString(),
  }, { onConflict: "id" });
  if (subscriptionError) throw new Error(`Subscription seed failed: ${subscriptionError.message}`);

  const roles = await admin.from("roles").select("id,role_key").in("role_key", ["doctor", "receptionist"]);
  if (roles.error) throw new Error(`Role lookup failed: ${roles.error.message}`);
  const roleMap = new Map((roles.data || []).map((r) => [r.role_key, r.id]));
  if (!roleMap.get("doctor") || !roleMap.get("receptionist")) throw new Error("Required system roles missing");

  const { error: clinicUsersError } = await admin.from("clinic_users").upsert([
    { id: doctorClinicId, tenant_id: tenantId, auth_user_id: doctorAuthId, full_name: "D3 Runtime Doctor", role: "doctor", role_id: roleMap.get("doctor"), employee_code: `D3-RD-${stamp}`, pin_code: "0000", is_active: true },
    { id: receptionClinicId, tenant_id: tenantId, auth_user_id: receptionAuthId, full_name: "D3 Runtime Reception", role: "receptionist", role_id: roleMap.get("receptionist"), employee_code: `D3-RR-${stamp}`, pin_code: "0001", is_active: true },
  ], { onConflict: "id" });
  if (clinicUsersError) throw new Error(`Clinic user seed failed: ${clinicUsersError.message}`);

  const permissions = await admin.from("permissions").select("id,permission_key").in("permission_key", [
    "patient_flow:clinical", "patient_flow:operations", "sessions:update", "sessions:close",
  ]);
  if (permissions.error) throw new Error(`Permission lookup failed: ${permissions.error.message}`);
  const permissionMap = new Map((permissions.data || []).map((p) => [p.permission_key, p.id]));
  for (const key of ["patient_flow:clinical","patient_flow:operations","sessions:update","sessions:close"]) {
    if (!permissionMap.get(key)) throw new Error(`Missing required permission: ${key}`);
  }

  const grants = [
    ["doctor", doctorClinicId, ["patient_flow:clinical", "sessions:update"]],
    ["reception", receptionClinicId, ["patient_flow:operations", "sessions:update", "sessions:close"]],
  ];
  for (const [, userId, keys] of grants) {
    for (const key of keys) {
      const { error } = await admin.from("clinic_user_permissions").upsert({
        tenant_id: tenantId, user_id: userId, permission_id: permissionMap.get(key), granted: true, created_by: receptionClinicId,
      }, { onConflict: "tenant_id,user_id,permission_id" });
      if (error) throw new Error(`Permission grant failed (${key}): ${error.message}`);
    }
  }

  const { error: roomError } = await admin.from("clinic_rooms").upsert({
    id: roomId, tenant_id: tenantId, room_name: "D3 Runtime Room", room_type: "consultation", is_active: true,
  }, { onConflict: "id" });
  if (roomError) throw new Error(`Room seed failed: ${roomError.message}`);

  const { error: patientError } = await admin.from("clinic_patients").upsert({
    id: patientId, tenant_id: tenantId, first_name: "D3 Runtime", last_name: "Patient", phone_primary: `0799${String(stamp).slice(-6)}`, file_number: `D3-R-${stamp}`,
  }, { onConflict: "id" });
  if (patientError) throw new Error(`Patient seed failed: ${patientError.message}`);

  const { error: visitError } = await admin.from("clinic_visit_sessions").upsert({
    id: visitId, tenant_id: tenantId, patient_id: patientId, doctor_id: doctorClinicId, room_id: roomId,
    session_status: "waiting", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
  if (visitError) throw new Error(`Visit seed failed: ${visitError.message}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "en-US", viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
const failures = [];

async function login(email) {
  await context.clearCookies();
  await page.goto(`${baseUrl}/login`, { waitUntil: "commit", timeout: 60000 });
  await page.locator('input[type="email"],input[name="email"]').first().fill(email);
  await page.locator('input[type="password"],input[name="password"]').first().fill(password);
  await page.getByRole("button", { name: /sign in|login|log in|تسجيل الدخول|دخول/i }).first().click();
  await page.waitForTimeout(1000);
  if (/\/login(?:[/?#]|$)/i.test(page.url())) {
    throw new Error(`Login failed for ${email}`);
  }
}

async function goto(pathname) {
  const response = await page.goto(`${baseUrl}${pathname}`, { waitUntil: "commit", timeout: 60000 });
  if (!response || response.status() >= 400) throw new Error(`HTTP ${response?.status() ?? "unknown"} for ${pathname}`);
  await page.waitForTimeout(300);
  if (/\/login(?:[/?#]|$)/i.test(page.url())) throw new Error(`Redirected to login from ${pathname}`);
}

async function expectText(text, label = text) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout: 30000 });
  console.log(`PASS|${label}`);
}

async function clickButton(re, label = re.toString()) {
  const button = page.getByRole("button", { name: re }).first();
  await button.waitFor({ state: "visible", timeout: 30000 });
  await button.click();
  await page.waitForTimeout(500);
  console.log(`PASS|${label}`);
}

async function cleanupData() {
  await admin.from("patient_flow_events").delete().eq("tenant_id", tenantId);
  await admin.from("clinical_work_sessions").delete().eq("tenant_id", tenantId);
  await admin.from("patient_flow_queue_entries").delete().eq("tenant_id", tenantId);
  await admin.from("clinic_visit_sessions").delete().eq("tenant_id", tenantId);
  await admin.from("clinic_patients").delete().eq("tenant_id", tenantId);
  await admin.from("clinic_rooms").delete().eq("tenant_id", tenantId);
  await admin.from("clinic_user_permissions").delete().eq("tenant_id", tenantId);
  await admin.from("clinic_users").delete().eq("tenant_id", tenantId);
  await admin.from("subscriptions").delete().eq("tenant_id", tenantId);
  await admin.from("master_tenants").delete().eq("id", tenantId);
  await admin.from("tenants").delete().eq("id", legacyTenantId);
  if (doctorAuthId) await admin.auth.admin.deleteUser(doctorAuthId);
  if (receptionAuthId) await admin.auth.admin.deleteUser(receptionAuthId);
}

try {
  await seed();

  await login(receptionEmail);
  await goto("/patient-flow/operations");
  await expectText("D3 Runtime Patient", "reception sees waiting visit");
  const patientCard = page.getByText("D3 Runtime Patient", { exact: false }).first().locator("xpath=ancestor::div[contains(@class,'rounded-lg') or contains(@class,'border')][1]");
  const registerButton = patientCard.getByRole("button", { name: /register arrival|تسجيل الوصول|register|وصول/i }).first();
  await registerButton.waitFor({ state: "visible", timeout: 30000 });
  await registerButton.click();
  await page.waitForTimeout(750);
  console.log("PASS|Reception registers arrival and enters Waiting");

  await page.reload({ waitUntil: "commit" });
  await page.waitForTimeout(500);
  await expectText("Waiting", "waiting state visible");
  const waitingCard = page.getByText("D3 Runtime Patient", { exact: false }).first().locator("xpath=ancestor::div[contains(@class,'rounded-lg') or contains(@class,'border')][1]");
  if (!(await waitingCard.isVisible())) throw new Error("Waiting patient card missing after D3 enter waiting");

  await login(doctorEmail);
  await goto("/patient-flow/clinical");
  await expectText("D3 Runtime Patient", "clinical user sees waiting patient");
  await clickButton(/take|start|بدء/i, "Clinical pulls waiting patient");
  await expectText("Clinical Visit", "clinical work surface");
  const textareas = page.locator("textarea");
  if (await textareas.count() < 3) throw new Error("Clinical documentation fields missing");
  await textareas.nth(0).fill("D3 runtime examination");
  await textareas.nth(1).fill("D3 runtime findings");
  await textareas.nth(2).fill("D3 runtime decision");
  await clickButton(/finish visit|finish|إنهاء|إكمال/i, "Finish");
  await expectText("Pending", "pending close returned-to-reception state");

  // Runtime negative: the clinical surface exposes no reception-completion action.
  if (await page.getByRole("button", { name: /complete visit|complete|إغلاق الزيارة|إغلاق/i }).count()) {
    throw new Error("Clinical user exposes a reception completion control");
  }
  console.log("PASS|Clinical surface does not expose reception completion");

  await login(receptionEmail);
  await goto("/patient-flow/operations");
  await expectText("D3 Runtime Patient", "reception sees pending-close visit");
  await clickButton(/complete from reception|complete visit|complete|إغلاق الزيارة|إغلاق/i, "Reception Complete");
  await page.waitForTimeout(750);
  await page.reload({ waitUntil: "commit" });
  const completedText = page.getByText("D3 Runtime Patient", { exact: false }).first();
  await completedText.waitFor({ state: "visible", timeout: 30000 });
  console.log("PASS|Completed visit remains visible to reception");
  const body = await page.locator("body").innerText();
  if (!/completed|مكتملة/i.test(body)) throw new Error("Completed state not visible after reception completion");
  console.log("PASS|Reception completion produces Completed state");

  const { data: finalVisit, error: finalVisitError } = await admin.from("clinic_visit_sessions").select("session_status").eq("id", visitId).single();
  if (finalVisitError || finalVisit?.session_status !== "completed") {
    throw new Error(`Final Visit status mismatch: ${finalVisit?.session_status ?? finalVisitError?.message ?? "missing"}`);
  }
  const { data: events, error: eventsError } = await admin.from("patient_flow_events").select("event_type").eq("tenant_id", tenantId).eq("visit_id", visitId).order("occurred_at");
  if (eventsError) throw new Error(`Event verification failed: ${eventsError.message}`);
  const eventTypes = (events || []).map((e) => e.event_type);
  for (const required of ["waiting_entered","clinical_started","clinical_finished","reception_completed"]) {
    if (!eventTypes.includes(required)) throw new Error(`Missing runtime event ${required}; got ${eventTypes.join(",")}`);
  }
  console.log("PASS|Runtime event sequence verified");
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
  console.error(`FAIL|${failures.at(-1)}`);
  process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
  try { await cleanupData(); } catch (error) { console.error("RUNTIME_CLEANUP_FAILED=" + String(error)); }
}

if (!failures.length) console.log("CSAPI_D3_RUNTIME=PASS");
