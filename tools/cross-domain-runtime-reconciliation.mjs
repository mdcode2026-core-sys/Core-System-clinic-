import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qaslsjyxjwvdoiczmhgq.supabase.co";
const configSource = readFileSync("src/infrastructure/supabase/config.ts", "utf8");
const defaultKey = configSource.match(/DEFAULT_SUPABASE_ANON_KEY\s*=\s*"([^"]+)"/)?.[1];
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultKey;
const email = process.env.CORE_SYSTEM_E2E_EMAIL;
const password = process.env.CORE_SYSTEM_E2E_PASSWORD;
if (!url || !key) throw new Error("Missing Supabase URL/key and no canonical fallback is available");
if (!email || !password) throw new Error("Missing CORE_SYSTEM_E2E_EMAIL/CORE_SYSTEM_E2E_PASSWORD");

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const failures = [];
const pass = (name, detail = "") => console.log(`PASS|${name}${detail ? `|${detail}` : ""}`);
const fail = (name, detail) => { failures.push(`${name}: ${detail}`); console.error(`FAIL|${name}|${detail}`); };

const { data: auth, error: authError } = await supabase.auth.signInWithPassword({ email, password });
if (authError || !auth.user) throw new Error(`Authenticated runtime setup failed: ${authError?.message ?? "no user"}`);

const { data: users, error: userError } = await supabase
  .from("clinic_users")
  .select("id,auth_user_id,tenant_id,role_id,is_active,deleted_at")
  .eq("auth_user_id", auth.user.id)
  .eq("is_active", true)
  .is("deleted_at", null)
  .limit(1);
if (userError || !users?.length) throw new Error(`No active clinic user for authenticated test account: ${userError?.message ?? "none"}`);
const actor = users[0];
const tenantId = actor.tenant_id;
pass("authenticated_actor", `tenant=${tenantId}`);

const { data: permissions, error: permError } = await supabase.rpc("get_effective_permissions", { p_user_id: actor.id, p_tenant_id: tenantId });
if (permError || !Array.isArray(permissions)) fail("effective_permissions", permError?.message ?? "invalid result");
else pass("effective_permissions", `count=${permissions.length}`);

const { data: readPermission, error: readPermissionError } = await supabase.rpc("has_effective_permission", { p_permission_key: "patients:read", p_user_id: actor.id });
if (readPermissionError) fail("permission_helper", readPermissionError.message);
else if (readPermission !== true) fail("permission_helper", "patients:read was not granted to the authenticated test actor");
else pass("permission_helper", "patients:read=true");

async function rows(table, columns) {
  const { data, error } = await supabase.from(table).select(columns).eq("tenant_id", tenantId).limit(1000);
  if (error) throw new Error(`${table}: ${error.message}`);
  return data ?? [];
}
async function parentMap(table, ids, columns = "id,tenant_id") {
  if (!ids.length) return new Map();
  const { data, error } = await supabase.from(table).select(columns).in("id", [...new Set(ids)].slice(0, 1000));
  if (error) throw new Error(`${table}: ${error.message}`);
  return new Map((data ?? []).map((r) => [r.id, r]));
}
async function assertTenantEdge(name, childRows, childId, parentTable) {
  const ids = childRows.map((r) => r[childId]).filter(Boolean);
  const parents = await parentMap(parentTable, ids);
  const bad = childRows.filter((r) => r[childId] && !parents.has(r[childId]));
  if (bad.length) fail(name, `${bad.length} referenced parent row(s) are not visible in the authenticated tenant`);
  else pass(name, `checked=${ids.length}`);
}

const checks = [
  ["clinic_inquiries", "id,tenant_id,patient_id", "patient_id", "clinic_patients"],
  ["clinic_visit_sessions", "id,tenant_id,patient_id", "patient_id", "clinic_patients"],
  ["clinic_invoices", "id,tenant_id,patient_id", "patient_id", "clinic_patients"],
  ["invoice_items", "id,tenant_id,invoice_id", "invoice_id", "clinic_invoices"],
  ["financial_plans", "id,tenant_id,patient_id,treatment_plan_id", "patient_id", "clinic_patients"],
  ["financial_installments", "id,tenant_id,financial_plan_id,invoice_id", "financial_plan_id", "financial_plans"],
  ["retention_followups", "id,tenant_id,patient_id,session_id", "patient_id", "clinic_patients"],
  ["communication_requests", "id,tenant_id,clinic_patient_id,work_item_id", "clinic_patient_id", "clinic_patients"],
  ["operational_work_items", "id,tenant_id,patient_id", "patient_id", "clinic_patients"],
  ["patient_packages", "id,tenant_id,patient_id,financial_plan_id", "patient_id", "clinic_patients"],
  ["inventory_ledger", "id,tenant_id,session_id,item_id", "item_id", "inventory_items"],
  ["purchase_receipts", "id,tenant_id,purchase_order_id", "purchase_order_id", "purchase_orders"],
  ["supplier_payments", "id,tenant_id,supplier_obligation_id", "supplier_obligation_id", "supplier_obligations"],
  ["workforce_employees", "id,tenant_id,user_id", "user_id", "clinic_users"],
  ["workforce_staff_schedules", "id,tenant_id,employee_id", "employee_id", "workforce_employees"],
  ["workforce_commission_entries", "id,tenant_id,source_payment_id,employee_id", "source_payment_id", "invoice_payments"],
];

for (const [table, columns, childId, parent] of checks) {
  try {
    const data = await rows(table, columns);
    await assertTenantEdge(`${table}→${parent}`, data, childId, parent);
  } catch (error) {
    fail(`${table}→${parent}`, error instanceof Error ? error.message : String(error));
  }
}

try {
  const visits = await rows("clinic_visit_sessions", "id,tenant_id,agenda_event_id");
  await assertTenantEdge("visit→agenda", visits, "agenda_event_id", "master_agenda_events");
} catch (error) { fail("visit→agenda", error instanceof Error ? error.message : String(error)); }

try {
  const ledger = await rows("inventory_ledger", "id,tenant_id,session_id");
  await assertTenantEdge("inventory→visit", ledger, "session_id", "clinic_visit_sessions");
} catch (error) { fail("inventory→visit", error instanceof Error ? error.message : String(error)); }

try {
  const payments = await rows("invoice_payments", "id,tenant_id,invoice_id");
  await assertTenantEdge("payment→invoice", payments, "invoice_id", "clinic_invoices");
} catch (error) { fail("payment→invoice", error instanceof Error ? error.message : String(error)); }

try {
  const analytics = await rows("analytics_daily_snapshots", "id,tenant_id,snapshot_date,total_visits,total_revenue_subunits");
  const negative = analytics.filter((r) => Number(r.total_visits) < 0 || Number(r.total_revenue_subunits) < 0);
  if (negative.length) fail("analytics_nonnegative", `${negative.length} negative snapshot(s)`);
  else pass("analytics_nonnegative", `checked=${analytics.length}`);
} catch (error) { fail("analytics_nonnegative", error instanceof Error ? error.message : String(error)); }

await supabase.auth.signOut();
if (failures.length) {
  console.error(`CROSS_DOMAIN_RUNTIME_RECONCILIATION=FAIL failures=${failures.length}`);
  process.exit(1);
}
console.log("CROSS_DOMAIN_RUNTIME_RECONCILIATION=PASS");
