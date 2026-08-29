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
];
const missing = required.filter((p) => !fs.existsSync(path.join(root, p)));
if (missing.length) { console.error("AJM required surface missing:", missing.join(", ")); process.exit(1); }

const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const registry = read("src/core/navigation/navigationRegistry.ts");
const comm = read("src/domain/communications/communications.actions.ts");
const work = read("src/domain/journey-coordination/work.actions.ts");
const workforce = read("src/domain/workforce/workforce.actions.ts");
const kpis = read("src/domain/analytics/kpi/kpi.definitions/ajm.kpis.ts");
const failures = [];
const expect = (ok, message) => { if (!ok) failures.push(message); };
const hasRoute = (route) => new RegExp(`href\\s*:\\s*["']${route.replaceAll('/', '\\/')}["']`).test(registry);

for (const route of ["/workforce", "/communications", "/work-center"]) {
  expect(hasRoute(route), `AJM canonical route missing from navigation registry: ${route}`);
}
expect(!comm.includes("createAppointment") && !comm.includes("createTreatmentPlan"), "Communications must not own Agenda or Treatment Plan creation.");
expect(work.includes("operational_work_items") && work.includes("operational_work_history"), "Coordination must use the canonical operational work layer.");
expect(work.includes("hasEffectivePermission") && work.includes('"work:create"') && work.includes('"work:manage"'), "Coordination actions must enforce server-side effective permissions.");
expect(workforce.includes("hasEffectivePermission") && workforce.includes('"workforce:read"'), "Workforce actions must enforce server-side effective permissions.");
expect(kpis.includes("workforce") && kpis.includes("communications") && kpis.includes("coordination"), "AJM KPI definitions must extend the canonical registry with all integrated categories.");
expect(registry.includes("getSidebarNavigation()") || registry.includes("navigationRegistry"), "Navigation must remain registry-driven.");

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
console.log("Verified canonical AJM surfaces, domain ownership boundaries, server authorization, KPI consolidation, and navigation uniqueness.");
