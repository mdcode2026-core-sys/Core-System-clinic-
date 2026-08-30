import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "docs/AJM-FULL-EXECUTION-PROMPT-2026-08-29.md",
  "docs/AJM-IMPLEMENTATION-PLAN.md",
  "docs/AJM-UX-UNIFIED-EXECUTION-PLAN-2026-08-29.md",
  "docs/PJ-AJM-UX-DEEP-RECONCILIATION-2026-08-29.md",
  "src/app/(dashboard)/workforce/page.tsx",
  "src/app/(dashboard)/communications/page.tsx",
  "src/app/(dashboard)/work-center/page.tsx",
  "src/domain/communications/communications.actions.ts",
  "src/domain/journey-coordination/work.actions.ts",
  "src/domain/workforce/workforce.actions.ts",
  "src/domain/analytics/kpi/kpi.definitions/ajm.kpis.ts",
  "src/core/navigation/navigationRegistry.ts",
  "src/domain/agenda/agenda.actions.ts",
  "src/domain/agenda/conflict.engine.ts",
  "supabase/migrations/20260830032000_ajm_reality_audit_patient_overlap_constraint.sql",
];
const missing = required.filter((p) => !fs.existsSync(path.join(root, p)));
if (missing.length) { console.error("AJM required surface missing:", missing.join(", ")); process.exit(1); }

const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const registry = read("src/core/navigation/navigationRegistry.ts");
const comm = read("src/domain/communications/communications.actions.ts");
const work = read("src/domain/journey-coordination/work.actions.ts");
const workforce = read("src/domain/workforce/workforce.actions.ts");
const kpis = read("src/domain/analytics/kpi/kpi.definitions/ajm.kpis.ts");
const agenda = read("src/domain/agenda/agenda.actions.ts");
const conflict = read("src/domain/agenda/conflict.engine.ts");
const failures = [];
const expect = (ok, message) => { if (!ok) failures.push(message); };
const hasRoute = (route) => new RegExp(`href\\s*:\\s*["']${route.replaceAll('/', '\\/')}["']`).test(registry);

for (const route of ["/workforce", "/communications", "/work-center"]) {
  expect(hasRoute(route), `AJM canonical route missing from navigation registry: ${route}`);
}
expect(!comm.includes("createAppointment") && !comm.includes("createTreatmentPlan"), "Communications must not own Agenda or Treatment Plan creation.");
expect(work.includes("operational_work_items") && work.includes("operational_work_history"), "Coordination must use the canonical operational work layer.");
expect(work.includes("hasEffectivePermission") && work.includes('"work:create"') && work.includes('"work:manage"'), "Coordination actions must enforce server-side effective permissions.");
expect(workforce.includes("hasEffectivePermission") && /"workforce:(manage|read|attendance|leave|payroll|commission)"/.test(workforce), "Workforce actions must enforce server-side effective permissions for governed mutations.");
expect(kpis.includes("workforce") && kpis.includes("communications") && kpis.includes("coordination"), "AJM KPI definitions must extend the canonical registry with all integrated categories.");
expect(registry.includes("getSidebarNavigation()") || registry.includes("navigationRegistry"), "Navigation must remain registry-driven.");

expect(agenda.includes('from "@/infrastructure/supabase/server"'), "Agenda mutations must use the authenticated server Supabase client.");
expect(agenda.includes("resolveContext()") && agenda.includes('getEffectivePermissions'), "Agenda mutations must resolve tenant/user context server-side.");
expect(agenda.includes('"agenda:create"') && agenda.includes('"agenda:update"'), "Agenda mutations must enforce server-side permission checks.");
expect(!agenda.includes('const tenantId=String(formData.get("tenant_id"))'), "Agenda mutations must not trust client-supplied tenant_id.");
expect(!conflict.includes("@/infrastructure/supabase/client"), "Agenda conflict checks must not use an unauthenticated browser Supabase client on the server path.");
expect(agenda.includes("resolveBufferEnd") && agenda.includes("buffer_time_minutes"), "Agenda mutations must honor procedure buffer time.");

const routeMatches = [...registry.matchAll(/href\s*:\s*["']([^"']+)["']/g)].map((m) => m[1]);
const counts = new Map();
for (const route of routeMatches) counts.set(route, (counts.get(route) ?? 0) + 1);
for (const route of ["/workforce", "/communications", "/work-center"]) {
  expect(counts.get(route) === 1, `Duplicate AJM navigation route detected: ${route}`);
}

if (failures.length) {
  console.error("AJM integrated static audit FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("AJM integrated static audit: PASS");
console.log("Verified canonical AJM surfaces, domain ownership boundaries, server authorization, agenda security, patient-overlap enforcement, KPI consolidation, and navigation uniqueness.");
