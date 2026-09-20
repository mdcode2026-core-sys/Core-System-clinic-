import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const baseUrl = (process.env.CORE_SYSTEM_PRODUCTION_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.CSAPI_D3_RUNTIME_PASSWORD || "D3-Runtime-2026!";
if (!supabaseUrl || !serviceRoleKey) throw new Error("Missing local Supabase runtime credentials");

const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const stamp = Date.now();
const tenantId = "2fa98983-8069-420f-9c27-7c36ef96ef6e";
const patientId = crypto.randomUUID();
const visitId = crypto.randomUUID();
const roomId = crypto.randomUUID();
const doctorClinicId = crypto.randomUUID();
const receptionClinicId = crypto.randomUUID();
const doctorEmail = "d3-runtime-doctor-" + stamp + "@example.test";
const receptionEmail = "d3-runtime-reception-" + stamp + "@example.test";

let doctorAuthId = null;
let receptionAuthId = null;
let localCanonicalTenantCreated = false;
let localCanonicalSubscriptionId = null;
let localCanonicalPlanId = null;

async function seed() {
  for (const [kind, email] of [["doctor", doctorEmail], ["reception", receptionEmail]]) {
    const created = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      app_metadata: { d3_runtime: true },
      user_metadata: { full_name: "D3 Runtime " + kind },
    });
    if (created.error || !created.data.user) throw new Error("Auth fixture failed: " + (created.error?.message || kind));
    if (kind === "doctor") doctorAuthId = created.data.user.id;
    else receptionAuthId = created.data.user.id;
  }

  let tenant = await admin.from("master_tenants").select("id,clinic_name,subscription_tier,is_active").eq("id", tenantId).maybeSingle();
  if (tenant.error) throw new Error("Canonical Zada tenant lookup failed: " + tenant.error.message);

  // CI replays migrations into a clean local database. The real Zada tenant is
  // persistent hosted demo data, so create only the minimum equivalent local
  // tenant shape when the clean database has no Zada row. It is deleted in cleanup.
  if (!tenant.data) {
    const createdTenant = await admin.from("master_tenants").insert({
      id: tenantId,
      clinic_name: "Zada Clinic",
      clinic_name_ar: "عيادة زادا",
      license_key: "D3-LOCAL-ZADA-" + stamp,
      subscription_tier: "enterprise",
      max_devices: 20,
      is_active: true,
      currency: "JOD",
      country_code: "JO",
      timezone: "Asia/Amman",
      language: "en",
      direction: "ltr",
    }).select("id,clinic_name,subscription_tier,is_active").single();
    if (createdTenant.error || !createdTenant.data) throw new Error("Canonical Zada local materialization failed: " + (createdTenant.error?.message || "missing tenant"));
    tenant = createdTenant;
    localCanonicalTenantCreated = true;
  }
  if (!tenant.data.is_active) throw new Error("Canonical Zada tenant is inactive");
  if (tenant.data.subscription_tier !== "enterprise") throw new Error("Canonical Zada tenant tier mismatch: " + tenant.data.subscription_tier);

  let subscription = await admin.from("subscriptions")
    .select("id,status,plan_id,subscription_plans!inner(plan_key,modules,is_active)")
    .eq("tenant_id", tenantId).eq("status", "active").limit(1).maybeSingle();
  if (subscription.error) throw new Error("Canonical Zada subscription lookup failed: " + subscription.error.message);
  if (!subscription.data) {
    let plan = await admin.from("subscription_plans").select("id,plan_key,modules,is_active").eq("plan_key", "enterprise").eq("is_active", true).is("deleted_at", null).maybeSingle();
    if (plan.error) throw new Error("Canonical Enterprise plan lookup failed: " + plan.error.message);
    // A clean CI replay may not include persistent commercial seed data. In that case,
    // materialize only a transient local equivalent of the canonical full Enterprise plan.
    if (!plan.data) {
      const createdPlan = await admin.from("subscription_plans").insert({
        id: crypto.randomUUID(), plan_key: "enterprise", plan_name: "Enterprise", plan_name_ar: "Enterprise",
        max_users: 999, max_devices: 999, max_branches: 999, modules: ["all"], ai_limits: {},
        storage_gb: 1000, api_rate_limit: 10000, is_active: true,
      }).select("id,plan_key,modules,is_active").single();
      if (createdPlan.error || !createdPlan.data) throw new Error("Canonical Enterprise local plan materialization failed: " + (createdPlan.error?.message || "missing plan"));
      plan = createdPlan;
      localCanonicalPlanId = createdPlan.data.id;
    }
    if (JSON.stringify(plan.data.modules) !== JSON.stringify(["all"])) throw new Error("Canonical Enterprise plan is not modules=[all]");
    const createdSubscription = await admin.from("subscriptions").insert({
      id: crypto.randomUUID(), tenant_id: tenantId, plan_id: plan.data.id, status: "active", started_at: new Date().toISOString(), auto_renew: true,
    }).select("id,status,plan_id,subscription_plans!inner(plan_key,modules,is_active)").single();
    if (createdSubscription.error || !createdSubscription.data) throw new Error("Canonical Zada local subscription materialization failed: " + (createdSubscription.error?.message || "missing subscription"));
    subscription = createdSubscription;
    localCanonicalSubscriptionId = createdSubscription.data.id;
  }
  const canonicalPlan = subscription.data.subscription_plans;
  if (canonicalPlan?.plan_key !== "enterprise" || JSON.stringify(canonicalPlan?.modules) !== JSON.stringify(["all"]) || !canonicalPlan?.is_active) {
    throw new Error("Canonical Zada subscription is not full enterprise/all; plan=" + canonicalPlan?.plan_key + " modules=" + JSON.stringify(canonicalPlan?.modules));
  }

  const roles = await admin.from("roles").select("id,role_key").in("role_key", ["doctor","receptionist"]);
  if (roles.error) throw new Error("Roles lookup failed: " + roles.error.message);
  const roleMap = new Map((roles.data || []).map((r) => [r.role_key, r.id]));
  const cu = await admin.from("clinic_users").upsert([
    { id: doctorClinicId, tenant_id: tenantId, auth_user_id: doctorAuthId, full_name: "D3 Runtime Doctor", role: "doctor", role_id: roleMap.get("doctor"), employee_code: "D3-RD-" + stamp, pin_code: "0000", is_active: true },
    { id: receptionClinicId, tenant_id: tenantId, auth_user_id: receptionAuthId, full_name: "D3 Runtime Reception", role: "receptionist", role_id: roleMap.get("receptionist"), employee_code: "D3-RR-" + stamp, pin_code: "0001", is_active: true },
  ], { onConflict: "id" });
  if (cu.error) throw new Error("Clinic users fixture failed: " + cu.error.message);

  const ps = await admin.from("permissions").select("id,permission_key").in("permission_key", [
    "patient_flow:clinical","patient_flow:operations","sessions:update","sessions:close","visits:read","visits:update",
  ]);
  if (ps.error) throw new Error("Permissions lookup failed: " + ps.error.message);
  const pmap = new Map((ps.data || []).map((p) => [p.permission_key, p.id]));
  for (const key of ["patient_flow:clinical","patient_flow:operations","sessions:update","sessions:close","visits:read","visits:update"]) {
    if (!pmap.get(key)) throw new Error("Required D3 permission missing from canonical catalogue: " + key);
  }
  const grants = [
    [doctorClinicId, ["patient_flow:clinical","sessions:update","visits:read","visits:update"]],
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
  await page.getByRole("button", { name: /sign in|login|log in/i }).first().click();
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

async function assertVisitStatus(expected, label) {
  const result = await admin.from("clinic_visit_sessions").select("session_status").eq("id", visitId).eq("tenant_id", tenantId).single();
  if (result.error) throw new Error(label + " state read failed: " + result.error.message);
  if (result.data?.session_status !== expected) throw new Error(label + " expected=" + expected + " actual=" + (result.data?.session_status || "null"));
  console.log("PASS|" + label + "|" + expected);
}

async function assertEvent(eventType, label) {
  const result = await admin.from("patient_flow_events").select("id,event_type").eq("tenant_id", tenantId).eq("visit_id", visitId).eq("event_type", eventType);
  if (result.error) throw new Error(label + " event read failed: " + result.error.message);
  if ((result.data || []).length !== 1) throw new Error(label + " expected exactly one " + eventType + " event, got=" + (result.data || []).length);
  console.log("PASS|" + label + "|" + eventType);
}

async function assertActiveQueueCount(expected, label, routingTarget = null) {
  let query = admin.from("patient_flow_queue_entries").select("id").eq("tenant_id", tenantId).eq("visit_id", visitId).is("exited_at", null);
  if (routingTarget) query = query.eq("routing_target", routingTarget);
  const result = await query;
  if (result.error) throw new Error(label + " queue read failed: " + result.error.message);
  if ((result.data || []).length !== expected) throw new Error(label + " expected=" + expected + " actual=" + (result.data || []).length);
  console.log("PASS|" + label + "|" + expected);
}

async function assertWorkSessionState(expectedActive, expectedFinished, label) {
  const result = await admin.from("clinical_work_sessions").select("status").eq("tenant_id", tenantId).eq("visit_id", visitId);
  if (result.error) throw new Error(label + " work-session read failed: " + result.error.message);
  const rows = result.data || [];
  const active = rows.filter((row) => row.status === "active").length;
  const finished = rows.filter((row) => row.status === "finished").length;
  if (active !== expectedActive || finished !== expectedFinished) {
    throw new Error(label + " expectedActive=" + expectedActive + " actualActive=" + active + " expectedFinished=" + expectedFinished + " actualFinished=" + finished);
  }
  console.log("PASS|" + label + "|active=" + active + "|finished=" + finished);
}

async function cleanup() {
  await admin.from("patient_flow_events").delete().eq("tenant_id", tenantId).eq("visit_id", visitId);
  await admin.from("clinical_work_sessions").delete().eq("tenant_id", tenantId).eq("visit_id", visitId);
  await admin.from("patient_flow_queue_entries").delete().eq("tenant_id", tenantId).eq("visit_id", visitId);
  await admin.from("clinic_visit_sessions").delete().eq("tenant_id", tenantId).eq("id", visitId);
  await admin.from("clinic_patients").delete().eq("tenant_id", tenantId).eq("id", patientId);
  await admin.from("clinic_rooms").delete().eq("tenant_id", tenantId).eq("id", roomId);
  await admin.from("clinic_user_permissions").delete().eq("tenant_id", tenantId).in("user_id", [doctorClinicId, receptionClinicId]);
  await admin.from("clinic_user_permission_overrides").delete().eq("tenant_id", tenantId).in("user_id", [doctorClinicId, receptionClinicId]);
  await admin.from("clinic_users").delete().eq("tenant_id", tenantId).in("id", [doctorClinicId, receptionClinicId]);
  if (doctorAuthId) await admin.auth.admin.deleteUser(doctorAuthId);
  if (receptionAuthId) await admin.auth.admin.deleteUser(receptionAuthId);
  if (localCanonicalSubscriptionId) await admin.from("subscriptions").delete().eq("id", localCanonicalSubscriptionId).eq("tenant_id", tenantId);
  if (localCanonicalPlanId) await admin.from("subscription_plans").delete().eq("id", localCanonicalPlanId).eq("plan_key", "enterprise");
  if (localCanonicalTenantCreated) await admin.from("master_tenants").delete().eq("id", tenantId);
}

try {
  await seed();
  await login(receptionEmail);
  await gotoPage("/operation");
  if (!(await page.getByText("D3 Runtime Patient", { exact: false }).count())) throw new Error("Reception cannot see seeded waiting patient");
  const card = page.getByText("D3 Runtime Patient", { exact: false }).first().locator("xpath=ancestor::div[contains(@class,'border')][1]");
  await card.getByRole("button", { name: /register arrival|register/i }).first().click();
  await page.waitForTimeout(700);
  await assertVisitStatus("waiting", "Reception enters Waiting through D3");
  await assertEvent("waiting_entered", "Reception Waiting event");

  await login(doctorEmail);
  await gotoPage("/clinical");
  await page.getByText("D3 Runtime Patient", { exact: false }).first().waitFor({ state: "visible", timeout: 30000 });
  if (!page.url().endsWith("/clinical")) throw new Error("Clinical workspace route mismatch: " + page.url());
  await button(/take|start/i, "Clinical Pull");
  await assertVisitStatus("in_consultation", "Clinical Pull state");
  await assertActiveQueueCount(0, "Clinical Pull closes active waiting queue");
  await assertWorkSessionState(1, 0, "Clinical Pull creates one active Work Session");
  await assertEvent("clinical_started", "Clinical Start event");
  const runtimeSession = await admin.from("clinic_visit_sessions").select("session_status,lock_holder_id,doctor_id").eq("id", visitId).eq("tenant_id", tenantId).single();
  console.log("D3_RUNTIME_SESSION_IDENTITY=" + JSON.stringify({ session: runtimeSession.data, error: runtimeSession.error?.message ?? null, expectedDoctorClinicId: doctorClinicId }));
  await page.waitForTimeout(1200);
  const activeRow = await admin.from("clinic_visit_sessions").select("id,session_status,doctor_id,lock_holder_id").eq("id", visitId).single();
  console.log("D3_RUNTIME_CLINICAL_STATE=" + JSON.stringify({activeRow: activeRow.data, activeError: activeRow.error?.message, doctorClinicId}));
  const textareaCount = await page.locator("textarea").count();
  const finishButtonCount = await page.getByRole("button", { name: /finish visit|finish/i }).count();
  const errorText = (await page.locator(".text-red-700").allInnerTexts()).join(" | ");
  console.log("D3_RUNTIME_CLINICAL_UI=" + JSON.stringify({ textareaCount, finishButtonCount, errorText, url: page.url() }));
  if (textareaCount < 3 || finishButtonCount < 1) {
    throw new Error("Clinical workspace did not render active-visit documentation controls. " + JSON.stringify({ textareaCount, finishButtonCount, errorText, url: page.url() }));
  }
  await page.locator("textarea").nth(0).fill("runtime examination");
  await page.locator("textarea").nth(1).fill("runtime findings");
  await page.locator("textarea").nth(2).fill("runtime decision");
  await button(/finish visit|finish/i, "Finish");
  await assertVisitStatus("pending_close", "Finish state");
  await assertWorkSessionState(0, 1, "Finish closes Work Session");
  await assertActiveQueueCount(1, "Finish creates reception handoff queue", "reception");
  await assertEvent("clinical_finished", "Clinical Finish event");
  const returnedPatientCount = await page.getByText("D3 Runtime Patient", { exact: false }).count();
  const clinicalFormCountAfterFinish = await page.locator("textarea").count();
  if (returnedPatientCount < 1 || clinicalFormCountAfterFinish !== 0) {
    throw new Error("Clinical surface did not render the Reception handoff after Finish. " +
      JSON.stringify({ returnedPatientCount, clinicalFormCountAfterFinish, url: page.url() }));
  }
  if (await page.getByRole("button", { name: /complete visit|complete/i }).count()) throw new Error("Clinical surface exposed reception completion");
  console.log("PASS|Clinical renders pending-close handoff without Reception completion authority");

  const doctorClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const doctorAuth = await doctorClient.auth.signInWithPassword({ email: doctorEmail, password });
  if (doctorAuth.error || !doctorAuth.data.user) throw new Error("Negative authority fixture login failed: " + (doctorAuth.error?.message || "no user"));
  const deniedCompletion = await doctorClient.rpc("csapi_d3_complete_reception", { p_visit_id: visitId, p_correlation_id: "00000000-0000-0000-0000-000000000e99" });
  if (!deniedCompletion.error || !/PERMISSION_DENIED/i.test(deniedCompletion.error.message || "")) throw new Error("Clinical direct reception completion was not rejected by D3 authority boundary");
  console.log("PASS|Clinical direct reception-completion RPC rejected");

  await login(receptionEmail);
  await gotoPage("/patient-flow/operations");
  await page.getByText("D3 Runtime Patient", { exact: false }).first().waitFor({ state: "visible", timeout: 30000 });
  await button(/complete from reception|complete visit|complete/i, "Reception Complete");
  await assertVisitStatus("completed", "Reception Complete");
  await assertActiveQueueCount(0, "Reception Complete closes active queue");
  await assertEvent("reception_completed", "Reception Complete event");
  const final = await admin.from("clinic_visit_sessions").select("session_status").eq("id", visitId).single();
  if (final.error || final.data?.session_status !== "completed") throw new Error("Final visit status=" + (final.data?.session_status || final.error?.message));
  const events = await admin.from("patient_flow_events").select("event_type").eq("tenant_id", tenantId).eq("visit_id", visitId).order("occurred_at");
  if (events.error) throw new Error("Event read failed: " + events.error.message);
  const types = (events.data || []).map((e) => e.event_type);
  for (const required of ["waiting_entered","clinical_started","clinical_finished","reception_completed"]) if (!types.includes(required)) throw new Error("Missing event " + required + " got=" + types.join(","));
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