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
];
const missing = required.filter((p) => !fs.existsSync(path.join(root, p)));
if (missing.length) { console.error("AJM required surface missing:", missing.join(", ")); process.exit(1); }
const registry = fs.readFileSync(path.join(root, "src/core/navigation/navigationRegistry.ts"), "utf8");
for (const route of ["/workforce", "/communications", "/work-center"]) {
  if (!registry.includes(`href:\"${route}\"`)) { console.error(`AJM canonical route missing from navigation registry: ${route}`); process.exit(1); }
}
const comm = fs.readFileSync(path.join(root, "src/domain/communications/communications.actions.ts"), "utf8");
if (comm.includes("createAppointment") || comm.includes("createTreatmentPlan")) { console.error("Communications must not own Agenda or Treatment Plan creation."); process.exit(1); }
console.log("AJM integrated static audit: PASS");
