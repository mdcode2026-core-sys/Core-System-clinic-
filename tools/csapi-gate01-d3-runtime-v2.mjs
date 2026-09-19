import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const baseUrl = (process.env.CORE_SYSTEM_PRODUCTION_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.CSAPI_D3_RUNTIME_PASSWORD || "D3-Runtime-2026!";
if (!supabaseUrl || !serviceRoleKey) throw new Error("Missing local Supabase runtime credentials");

const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const stamp = Date.now();
const tenantId = "00000000-0000-0000-0000-00000000d3b1";
const patientId = "00000000-0000-0000-0000-00000000d3b9";
const visitId = "00000000-0000-0000-0000-00000000d3ba";
const roomId = "00000000-0000-0000-0000-00000000d3bb";
const doctorClinicId = "00000000-0000-0000-0000-00000000d3b4";
const receptionClinicId = "00000000-0000-0000-0000-00000000d3b6";
const doctorEmail = "d3-runtime-doctor-" + stamp + "@example.test";
const receptionEmail = "d3-runtime-reception-" + stamp + "@example.test";

let doctorAuthId = null;
let receptionAuthId = null;

async function seed() {
  const users = [];
  for (const [kind, email] of [["doctor", doctorEmail], ["reception", receptionEmail]]) {
    const created = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      app_metadata: { d3_runtime: true },
      user_metadata: { full_name: "D3 Runtime " + kind },
    });
    if (created.error || !created.data.user) throw new Error("Auth fixture failed: " + (created.error?.message || kind));
    users.push(created.data.user);
    if (kind === "doctor") doctorAuthId = created.data.user.id;
    else receptionAuthId = created.data.user.id;
  }

  const tenant = await admin.from("master_tenants").upsert({
    id: tenantId, clinic_name: "CSAPI D3 Runtime Clinic",
    license_key: "CSAPI-D3-RUNTIME-" + stamp, timezone: "Asia/Amman", currency: "JOD", country_code: "JO",
  }, { onConflict: "id" });
  if (tenant.error) throw new Error("Tenant fixture failed: " + tenant.error.message);

  const legacy = await admin.from("tenants").upsert({
    id: tenantId, clinic_name: "CSAPI D3 Runtime Legacy Clinic",
    license_key: "CSAPI-D3-RUNTIME-" + stamp, timezone: "Asia/Amman", currency: "JOD", country_code: "JO", is_active: true,
  }, { onConflict: "id" });
  if (legacy.error) throw new Error("Legacy tenant fixture failed: " + legacy.error.message);

  const plan = await admin.from("subscription_plans").upsert({
    id: "00000000-0000-0000-0000-00000000d3bf",
    plan_key: "enterprise", plan_name: "D3 Runtime Full Subscription", plan_name_ar: "D3 Runtime Full Subscription",
    max_users: 100, max_devices: 100, max_branches: 100, modules: ["all"], ai_limits: {}, storage_gb: 100, api_rate_limit: 1000, is_active: true,
  }, { onConflict: "plan_key" }).select("id").single();
  if (plan.error || !plan.data) throw new Error("Plan fixture failed: " + (plan.error?.message || "missing plan"));

  const sub = await admin.from("subscriptions").upsert({
    id: "00000000-0000-0000-0000-00000000d3bd",
    tenant_id: tenantId, plan_id: plan.data.id, status: "active", billing_cycle: "monthly", started_at: new Date().toISOString(),
  }, { onConflict: "id" });
  if (sub.error) throw new Error("Subscription fixture failed: " + sub.error.message);

  const roles = await admin.from("roles").select("id,role_key").in("role_key", ["doctor","receptionist"]);
  if (roles.error) throw new Error("Roles lookup failed: " + roles.error.message);
  const roleMap = new Map((roles.data || []).map((r) => [r.role_key, r.id]));

  const cu = await admin.from("clinic_users").upsert([
    { id: doctorClinicId, tenant_id: tenantId, auth_user_id: doctorAuthId, full_name: "D3 Runtime Doctor", role: "doctor", role_id: roleMap.get("doctor"), employee_code: "D3-RD-" + stamp, pin_code: "0000", is_active: true },
    { id: receptionClinicId, tenant_id: tenantId, auth_user_id: receptionAuthId, full_name: "D3 Runtime Reception", role: "receptionist", role_id: roleMap.get("receptionist"), employee_code: "D3-RR-" + stamp, pin_code: "0001", is_active: true },
  ], { onConflict: "id" });
  if (cu.error) throw new Error("Clinic users fixture failed: " + cu.error.message);

  const ps = await admin.from("permissions").select("id,permission_key").in("permission_key", [
    "patient_flow:clinical","patient_flow:operations","sessions:update","sessions:close",
  ]);
  if (ps.error) throw new Error("Permissions lookup failed: " + ps.error.message);
  const pmap = new Map((ps.data || []).map((p) => [p.permission_key, p.id]));

  const grants = [
    [doctorClinicId, ["patient_flow:clinical","sessions:update"]],
    [receptionClinicId, ["patient_flow:operations","sessions:update","sessions:close"]],
  ];
  for (const [userId, keys] of grants) {
    for (const key of keys) {
      const row = await admin.from("clinic_user_permissions").upsert({
        tenant_id: tenantId, user_id: userId, permission_id: pmap.get(key), granted: true, created_by: receptionClinicId,
      }, { onConflict: "tenant_id,user_id,permission_id" });
      if (row.error) throw new Error("Permission fixture failed: " + row.error.message);
    }
  }

  const room = await admin.from("clinic_rooms").upsert({
    id: roomId, tenant_id: tenantId, room_name: "D3 Runtime Room", room_type: "consultation", floor_number: 1, capacity: 1, is_active: true,
  }, { onConflict: "id" });
  if (room.error) throw new Error("Room fixture failed: " + room.error.message);

  const patient = await admin.from("clinic_patients").upsert({
    id: patientId, tenant_id: tenantId, first_name: "D3 Runtime", last_name: "Patient",
    phone_primary: "0799" + String(stamp).slice(-6), file_number: "D3-R-" + stamp,
  }, { onConflict: "id" });
  if (patient.error) throw new Error("Patient fixture failed: " + patient.error.message);

  const visit = await admin.from("clinic_visit_sessions").upsert({
    id: visitId, tenant_id: tenantId, patient_id: patientId, doctor_id: doctorClinicId, room_id: roomId,
    session_status: "waiting", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
  if (visit.error) throw new Error("Visit fixture failed: " + visit.error.message);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ locale: "en-US", viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

async function login(email) {
  await context.clearCookies();
  await page.goto(baseUrl + "/login", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator('input[type="email"],input[name="email"]').first().fill(email);
  await page.locator('input[type="password"],input[name="password"]').first().fill(password);
  await page.getByRole("button", { name: /sign in|login|log in|تسجيل الدخول|دخول/i }).first().click();
  await page.waitForTimeout(2500);
  if (/\/login(?:[/?#]|$)/i.test(page.url())) {
    await page.goto(baseUrl + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1000);
  }
  const cookies = await context.cookies();
  const hasAuthCookie = cookies.some((cookie) => cookie.name.includes("auth-token"));
  if (/\/login(?:[/?#]|$)/i.test(page.url()) || !hasAuthCookie) {
    throw new Error("Login failed for " + email + " url=" + page.url() + " cookies=" + cookies.map((c) => c.name).join(","));
  }
  console.log("PASS|login|" + email);
}

async function gotoPage(pathname) {
  const response = await page.goto(baseUrl + pathname, { waitUntil: "domcontentloaded", timeout: 60000 });
  if (!response || response.status() >= 400) throw new Error("HTTP failure for " + pathname);
  await page.waitForTimeout(500);
  if (/\/login(?:[/?#]|$)/i.test(page.url())) throw new Error("Redirected to login from " + pathname);
}

async function button(re, label) {
  const b = page.getByRole("button", { name: re }).first();
  await b.waitFor({ state: "visible", timeout: 30000 });
  await b.click();
  await page.waitForTimeout(700);
  console.log("PASS|" + label);
}

async function cleanup() {
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
  await admin.from("tenants").delete().eq("id", tenantId);
  if (doctorAuthId) await admin.auth.admin.deleteUser(doctorAuthId);
  if (receptionAuthId) await admin.auth.admin.deleteUser(receptionAuthId);
}

try {
  await seed();
  await login(receptionEmail);
  await gotoPage("/patient-flow/operations");
  if (!(await page.getByText("D3 Runtime Patient", { exact: false }).count())) throw new Error("Reception cannot see seeded waiting patient");
  const card = page.getByText("D3 Runtime Patient", { exact: false }).first().locator("xpath=ancestor::div[contains(@class,'border')][1]");
  await card.getByRole("button", { name: /register arrival|تسجيل الوصول|register|وصول/i }).first().click();
  await page.waitForTimeout(700);
  console.log("PASS|Reception enters Waiting through D3");

  await login(doctorEmail);
  await gotoPage("/patient-flow/clinical");
  await page.getByText("D3 Runtime Patient", { exact: false }).first().waitFor({ state: "visible", timeout: 30000 });
  await button(/take|start|بدء/i, "Clinical Pull");
  await page.locator("textarea").nth(0).fill("runtime examination");
  await page.locator("textarea").nth(1).fill("runtime findings");
  await page.locator("textarea").nth(2).fill("runtime decision");
  await button(/finish visit|finish|إنهاء|إكمال/i, "Finish");
  if (!(await page.getByText("Pending", { exact: false }).count())) throw new Error("Pending close state was not rendered");
  if (await page.getByRole("button", { name: /complete visit|complete|إغلاق الزيارة|إغلاق/i }).count()) {
    throw new Error("Clinical surface exposed reception completion");
  }
  console.log("PASS|Clinical cannot complete Reception-owned closure");

  await login(receptionEmail);
  await gotoPage("/patient-flow/operations");
  await page.getByText("D3 Runtime Patient", { exact: false }).first().waitFor({ state: "visible", timeout: 30000 });
  await button(/complete from reception|complete visit|complete|إغلاق الزيارة|إغلاق/i, "Reception Complete");

  const final = await admin.from("clinic_visit_sessions").select("session_status").eq("id", visitId).single();
  if (final.error || final.data?.session_status !== "completed") throw new Error("Final visit status=" + (final.data?.session_status || final.error?.message));

  const events = await admin.from("patient_flow_events").select("event_type").eq("tenant_id", tenantId).eq("visit_id", visitId).order("occurred_at");
  if (events.error) throw new Error("Event read failed: " + events.error.message);
  const types = (events.data || []).map((e) => e.event_type);
  for (const required of ["waiting_entered","clinical_started","clinical_finished","reception_completed"]) {
    if (!types.includes(required)) throw new Error("Missing event " + required + " got=" + types.join(","));
  }
  console.log("PASS|D3 runtime lifecycle and event sequence");
} catch (error) {
  console.error("FAIL|" + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
  try { await cleanup(); } catch (error) { console.error("CLEANUP_FAIL|" + String(error)); }
}
if (!process.exitCode) console.log("CSAPI_D3_RUNTIME_V2=PASS");
