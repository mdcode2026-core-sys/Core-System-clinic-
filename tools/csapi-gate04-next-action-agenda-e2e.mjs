#!/usr/bin/env node
/**
 * Gate 04 Scenario 31 downstream handoff E2E.
 * Local-only: both the app and Supabase endpoints are strictly loopback.
 * This proves the existing Next Action -> Agenda subflow only. It does not
 * prove Treatment Plan -> Next Action generation or Scenario 32's typed link.
 */
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const tenantId = "2fa98983-8069-420f-9c27-7c36ef96ef6e";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const baseUrl = "http://127.0.0.1:3000";

function localUrl(value, port, label) {
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error(label + "_INVALID_URL"); }
  if (parsed.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(parsed.hostname) || parsed.port !== port) {
    throw new Error(label + "_MUST_BE_LOCAL_PORT_" + port + ": " + parsed.origin);
  }
  return parsed.origin;
}
const safeSupabaseUrl = localUrl(supabaseUrl, "54321", "SUPABASE_URL");
const safeBaseUrl = localUrl(baseUrl, "3000", "APP_URL");
if (!serviceRoleKey) throw new Error("LOCAL_SUPABASE_SERVICE_ROLE_KEY_REQUIRED");

const admin = createClient(safeSupabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const stamp = "G04-S31-" + Date.now() + "-" + randomUUID().slice(0, 8);
const email = stamp.toLowerCase() + "@example.test";
const password = "G04Local-" + randomUUID().slice(0, 12) + "!aB7";
const patientFirst = "Gate04";
const patientLast = "Scenario31-" + stamp.slice(-8);
const appointmentNote = "GATE04_SCENARIO31_LOCAL_ONLY:" + stamp;
const planTitle = "Gate 04 scenario 31 fixture " + stamp;
const workTitle = "Gate 04 next action " + stamp;

let localTenantCreated = false;
let localPlanId = null;
let localSubscriptionId = null;
let authUserId = null;
let clinicUserId = null;
let patientId = null;
let planId = null;
let planItemId = null;
let workItemId = null;
let browser = null;
let context = null;

function dataOrThrow(result, label) {
  if (result.error) throw new Error(label + ": " + result.error.message);
  if (!result.data) throw new Error(label + ": missing result data");
  return result.data;
}

async function seedLocalFixture() {
  let tenantLookup = await admin.from("master_tenants")
    .select("id,clinic_name,subscription_tier,is_active").eq("id", tenantId).maybeSingle();
  if (tenantLookup.error) throw new Error("LOCAL_TENANT_LOOKUP: " + tenantLookup.error.message);
  if (!tenantLookup.data) {
    tenantLookup = await admin.from("master_tenants").insert({
      id: tenantId, clinic_name: "Zada Clinic", clinic_name_ar: "عيادة زادا",
      license_key: "G04-LOCAL-" + randomUUID(), subscription_tier: "enterprise",
      max_devices: 20, is_active: true, currency: "JOD", country_code: "JO",
      timezone: "Asia/Amman", language: "en", direction: "ltr",
    }).select("id,clinic_name,subscription_tier,is_active").single();
    if (tenantLookup.error || !tenantLookup.data) {
      throw new Error("LOCAL_TENANT_CREATE: " + (tenantLookup.error?.message || "missing result"));
    }
    localTenantCreated = true;
  }
  const tenant = tenantLookup.data;
  if (!tenant.is_active || tenant.subscription_tier !== "enterprise") {
    throw new Error("LOCAL_TENANT_NOT_ACTIVE_ENTERPRISE " + JSON.stringify({
      active: tenant.is_active, tier: tenant.subscription_tier,
    }));
  }

  let subscription = await admin.from("subscriptions")
    .select("id,status,plan_id,subscription_plans!inner(plan_key,modules,is_active)")
    .eq("tenant_id", tenantId).eq("status", "active").limit(1).maybeSingle();
  if (subscription.error) throw new Error("LOCAL_SUBSCRIPTION_LOOKUP: " + subscription.error.message);
  if (!subscription.data) {
    let plan = await admin.from("subscription_plans")
      .select("id,plan_key,modules,is_active").eq("plan_key", "enterprise")
      .eq("is_active", true).is("deleted_at", null).maybeSingle();
    if (plan.error) throw new Error("LOCAL_ENTERPRISE_PLAN_LOOKUP: " + plan.error.message);
    if (!plan.data) {
      plan = await admin.from("subscription_plans").insert({
        id: randomUUID(), plan_key: "enterprise", plan_name: "Enterprise",
        plan_name_ar: "Enterprise", max_users: 999, max_devices: 999, max_branches: 999,
        modules: ["all"], ai_limits: {}, storage_gb: 1000, api_rate_limit: 10000, is_active: true,
      }).select("id,plan_key,modules,is_active").single();
      if (plan.error || !plan.data) {
        throw new Error("LOCAL_ENTERPRISE_PLAN_CREATE: " + (plan.error?.message || "missing result"));
      }
      localPlanId = plan.data.id;
    }
    if (plan.data.plan_key !== "enterprise" || JSON.stringify(plan.data.modules) !== JSON.stringify(["all"]) || !plan.data.is_active) {
      throw new Error("LOCAL_ENTERPRISE_PLAN_CONTRACT_MISMATCH");
    }
    subscription = await admin.from("subscriptions").insert({
      id: randomUUID(), tenant_id: tenantId, plan_id: plan.data.id,
      status: "active", started_at: new Date().toISOString(), auto_renew: true,
    }).select("id,status,plan_id,subscription_plans!inner(plan_key,modules,is_active)").single();
    if (subscription.error || !subscription.data) {
      throw new Error("LOCAL_SUBSCRIPTION_CREATE: " + (subscription.error?.message || "missing result"));
    }
    localSubscriptionId = subscription.data.id;
  }
  const activePlan = subscription.data.subscription_plans;
  if (!activePlan || activePlan.plan_key !== "enterprise" ||
      JSON.stringify(activePlan.modules) !== JSON.stringify(["all"]) || !activePlan.is_active) {
    throw new Error("LOCAL_SUBSCRIPTION_NOT_ENTERPRISE_ALL");
  }

  const role = dataOrThrow(
    await admin.from("roles").select("id").eq("role_key", "receptionist")
      .eq("is_system_role", true).limit(1).maybeSingle(),
    "LOCAL_RECEPTIONIST_ROLE_LOOKUP",
  );
  const createdAuth = dataOrThrow(
    await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      app_metadata: { tenant_id: tenantId, user_role: "receptionist", gate04_scenario31: true },
      user_metadata: { full_name: "Gate 04 Scenario 31 Local Test" },
    }),
    "LOCAL_AUTH_USER_CREATE",
  );
  authUserId = createdAuth.user.id;

  const createdClinicUser = dataOrThrow(
    await admin.from("clinic_users").insert({
      id: randomUUID(), tenant_id: tenantId, auth_user_id: authUserId,
      full_name: "Gate 04 Scenario 31 Local Test", role: "receptionist", role_id: role.id,
      employee_code: "G4S31-" + randomUUID().slice(0, 10), pin_code: "0000", is_active: true,
    }).select("id").single(),
    "LOCAL_CLINIC_USER_CREATE",
  );
  clinicUserId = createdClinicUser.id;

  const keys = ["work:read", "agenda:create", "agenda:read", "patients:read", "procedures:read", "treatment_plans:read"];
  const permissionResult = await admin.from("permissions").select("id,permission_key")
    .in("permission_key", keys).is("deleted_at", null);
  if (permissionResult.error) throw new Error("LOCAL_PERMISSION_LOOKUP: " + permissionResult.error.message);
  const permissions = permissionResult.data || [];
  const found = new Set(permissions.map((row) => row.permission_key));
  for (const required of ["work:read", "agenda:create"]) {
    if (!found.has(required)) throw new Error("LOCAL_REQUIRED_PERMISSION_MISSING=" + required);
  }
  const grants = await admin.from("clinic_user_permissions").upsert(
    permissions.map((row) => ({
      tenant_id: tenantId, user_id: clinicUserId, permission_id: row.id,
      granted: true, created_by: clinicUserId,
    })),
    { onConflict: "tenant_id,user_id,permission_id" },
  );
  if (grants.error) throw new Error("LOCAL_PERMISSION_GRANTS: " + grants.error.message);

  patientId = dataOrThrow(await admin.from("clinic_patients").insert({
    tenant_id: tenantId, first_name: patientFirst, last_name: patientLast,
    phone_primary: "+96279" + String(Date.now()).slice(-7), file_number: stamp,
  }).select("id").single(), "LOCAL_PATIENT_CREATE").id;

  planId = dataOrThrow(await admin.from("clinic_treatment_plans").insert({
    tenant_id: tenantId, patient_id: patientId, title: planTitle, status: "active", created_by: clinicUserId,
  }).select("id").single(), "LOCAL_TREATMENT_PLAN_CREATE").id;

  planItemId = dataOrThrow(await admin.from("clinic_treatment_plan_items").insert({
    tenant_id: tenantId, treatment_plan_id: planId, title: "Scenario 31 activity " + stamp,
    sequence_no: 1, status: "planned",
  }).select("id").single(), "LOCAL_TREATMENT_PLAN_ITEM_CREATE").id;

  workItemId = dataOrThrow(await admin.from("operational_work_items").insert({
    tenant_id: tenantId, kind: "next_action", title: workTitle,
    details: "Local-only fixture for Agenda handoff verification.", status: "open", priority: "normal",
    requester_clinic_user_id: clinicUserId, assignee_clinic_user_id: clinicUserId, patient_id: patientId,
    source_type: "treatment_plan_item", source_id: planItemId,
  }).select("id").single(), "LOCAL_NEXT_ACTION_CREATE").id;

  console.log("LOCAL_FIXTURE_READY tenant=" + tenantId + " patient=" + patientId +
    " plan=" + planId + " plan_item=" + planItemId + " next_action=" + workItemId);
}

async function login(page) {
  let lastFailure = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    await context.clearCookies();
    const tokenPromise = page.waitForResponse(
      (response) => response.url().includes("/auth/v1/token") && response.request().method() === "POST",
      { timeout: 20000 },
    ).catch(() => null);
    await page.goto(safeBaseUrl + "/login", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.locator('input[type="email"],input[name="email"]').first().fill(email);
    await page.locator('input[type="password"],input[name="password"]').first().fill(password);
    await page.getByRole("button", { name: /sign in|login|log in|تسجيل الدخول|دخول/i }).first().click();
    const response = await tokenPromise;
    const status = response?.status() ?? null;
    await page.waitForTimeout(750);
    const cookies = await context.cookies(safeBaseUrl);
    const hasCookie = cookies.some((cookie) => cookie.name.includes("auth-token"));
    if (status === 200 && hasCookie) {
      await page.goto(safeBaseUrl + "/work-center", { waitUntil: "domcontentloaded", timeout: 60000 });
      if (!/\/login(?:[/?#]|$)/i.test(page.url())) return;
    }
    lastFailure = "attempt=" + attempt + " status=" + (status ?? "no-response") +
      " cookie=" + hasCookie + " url=" + page.url();
    if (attempt < 3) await page.waitForTimeout(500);
  }
  throw new Error("LOCAL_WORK_CENTER_LOGIN_FAILED " + lastFailure);
}

async function verifyPersistence(appointmentId) {
  const event = dataOrThrow(await admin.from("master_agenda_events")
    .select("id,tenant_id,patient_id,status,booking_notes,scheduled_start,scheduled_end")
    .eq("tenant_id", tenantId).eq("id", appointmentId).eq("booking_notes", appointmentNote).single(),
  "LOCAL_AGENDA_APPOINTMENT_PERSISTENCE");
  if (event.patient_id !== patientId || event.status !== "scheduled") {
    throw new Error("AGENDA_APPOINTMENT_CONTRACT_MISMATCH " + JSON.stringify(event));
  }
  const work = dataOrThrow(await admin.from("operational_work_items")
    .select("id,tenant_id,patient_id,status,outcome,source_type,source_id")
    .eq("tenant_id", tenantId).eq("id", workItemId).single(), "LOCAL_NEXT_ACTION_RESULT");
  if (work.status !== "completed" || !String(work.outcome || "").includes(appointmentId) ||
      work.source_type !== "treatment_plan_item" || work.source_id !== planItemId || work.patient_id !== patientId) {
    throw new Error("NEXT_ACTION_HANDOFF_CONTRACT_MISMATCH " + JSON.stringify(work));
  }
  const history = dataOrThrow(await admin.from("operational_work_history").select("id,note,to_status")
    .eq("tenant_id", tenantId).eq("work_item_id", workItemId)
    .eq("note", "booking_handoff_completed:agenda_event:" + appointmentId).single(),
  "LOCAL_HANDOFF_AUDIT_RECORD");
  if (history.to_status !== "completed") throw new Error("NEXT_ACTION_AUDIT_STATUS_MISMATCH");
  console.log("PASS|scenario31-agenda-owned-appointment|" + JSON.stringify({
    appointmentId: event.id, tenantId: event.tenant_id, patientId: event.patient_id,
    appointmentStatus: event.status, workItemStatus: work.status, handoffHistoryId: history.id,
  }));
}

async function runE2E() {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ locale: "en-US", viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  await login(page);

  const link = page.locator('a[href*="bookingWorkItemId=' + workItemId + '"]').first();
  await link.waitFor({ state: "visible", timeout: 30000 });
  const href = await link.getAttribute("href");
  if (!href) throw new Error("NEXT_ACTION_AGENDA_HREF_MISSING");
  const target = new URL(href, safeBaseUrl);
  if (target.pathname !== "/agenda" || target.searchParams.get("patientId") !== patientId ||
      target.searchParams.get("bookingWorkItemId") !== workItemId ||
      target.searchParams.get("treatmentPlanItemId") !== planItemId) {
    throw new Error("NEXT_ACTION_AGENDA_CONTEXT_MISMATCH " + href);
  }
  await link.click();
  await page.waitForURL(/\/agenda\?.*bookingWorkItemId=/, { timeout: 30000 });
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 30000 });
  await dialog.getByText(new RegExp(patientFirst + " " + patientLast)).waitFor({ state: "visible", timeout: 30000 });

  const dateInput = dialog.locator('input[type="date"]').first();
  const times = dialog.locator('input[type="time"]');
  if (await times.count() < 2) throw new Error("AGENDA_LOCAL_BOOKING_TIME_CONTROLS_MISSING");
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Amman", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(Date.now() + 5 * 86400000));
  const dateMap = Object.fromEntries(dateParts.map((part) => [part.type, part.value]));
  await dateInput.fill(dateMap.year + "-" + dateMap.month + "-" + dateMap.day);
  await times.nth(0).fill("09:00");
  await times.nth(1).fill("09:30");
  await dialog.locator("textarea").last().fill(appointmentNote);

  const submit = dialog.getByRole("button", { name: /create|إنشاء/i }).last();
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/agenda/events") && response.request().method() === "POST",
    { timeout: 60000 },
  );
  await submit.click();
  const response = await responsePromise;
  const payload = await response.json().catch(() => null);
  if (!response.ok() || payload?.error || !payload?.data?.id) {
    throw new Error("AGENDA_CREATE_FAILED status=" + response.status() + " body=" + JSON.stringify(payload));
  }
  await dialog.waitFor({ state: "hidden", timeout: 30000 });
  await verifyPersistence(payload.data.id);
  console.log("SCOPE|Only the existing Next Action -> Agenda booking subflow is verified. Next Action generation and Scenario 32 typed appointment reference remain unverified; this result alone must not mark full Scenario 31 or Scenario 32 PASS.");
}

try {
  await seedLocalFixture();
  await runE2E();
} catch (error) {
  console.error("GATE04_SCENARIO31_LOCAL_E2E=FAIL|" + (error instanceof Error ? error.stack || error.message : String(error)));
  process.exitCode = 1;
} finally {
  if (workItemId) {
    const result = await admin.from("operational_work_items").delete().eq("tenant_id", tenantId).eq("id", workItemId);
    if (result.error) console.error("LOCAL_CLEANUP_WARNING=work-item " + result.error.message);
  }
  if (planId) {
    const result = await admin.from("clinic_treatment_plans").delete().eq("tenant_id", tenantId).eq("id", planId);
    if (result.error) console.error("LOCAL_CLEANUP_WARNING=treatment-plan " + result.error.message);
  }
  if (clinicUserId) {
    for (const table of ["clinic_user_permissions", "clinic_user_permission_overrides"]) {
      const result = await admin.from(table).delete().eq("tenant_id", tenantId).eq("user_id", clinicUserId);
      if (result.error) console.error("LOCAL_CLEANUP_WARNING=" + table + " " + result.error.message);
    }
  }
  if (localSubscriptionId) {
    const result = await admin.from("subscriptions").delete().eq("id", localSubscriptionId).eq("tenant_id", tenantId);
    if (result.error) console.error("LOCAL_CLEANUP_WARNING=subscription " + result.error.message);
  }
  if (localPlanId) {
    const result = await admin.from("subscription_plans").delete().eq("id", localPlanId).eq("plan_key", "enterprise");
    if (result.error) console.error("LOCAL_CLEANUP_WARNING=subscription-plan " + result.error.message);
  }
  if (localTenantCreated) {
    const result = await admin.from("master_tenants").delete().eq("id", tenantId);
    if (result.error) console.error("LOCAL_CLEANUP_WARNING=local-tenant " + result.error.message);
  }
  if (authUserId) {
    const result = await admin.auth.admin.deleteUser(authUserId);
    if (result.error) console.error("LOCAL_CLEANUP_WARNING=auth-user " + result.error.message);
  }
  if (context) await context.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
}
