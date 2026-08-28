import fs from "node:fs";
import process from "node:process";

const required = [
  "src/core/search/actions.ts",
  "src/core/search/GlobalSearch.tsx",
  "src/core/i18n/globalSearchMessages.ts",
  "src/features/workspace/WorkspaceShell.tsx",
];

const checks = [
  ["server action", fs.readFileSync("src/core/search/actions.ts", "utf8").includes('"use server"')],
  ["authenticated search", fs.readFileSync("src/core/search/actions.ts", "utf8").includes("supabase.auth.getUser()")],
  ["tenant scoping", fs.readFileSync("src/core/search/actions.ts", "utf8").includes('.eq("tenant_id", tenantId)')],
  ["effective permissions", fs.readFileSync("src/core/search/actions.ts", "utf8").includes("getEffectivePermissions")],
  ["patient search", fs.readFileSync("src/core/search/actions.ts", "utf8").includes('from("clinic_patients")')],
  ["cross-domain search", ["clinic_invoices", "master_agenda_events", "clinic_treatment_plans", "clinic_procedures", "inventory_items", "suppliers", "purchase_orders"].every((table) => fs.readFileSync("src/core/search/actions.ts", "utf8").includes(`from("${table}")`))],
  ["stable shell placement", fs.readFileSync("src/features/workspace/WorkspaceShell.tsx", "utf8").includes("<GlobalSearch />")],
  ["bilingual messages", fs.readFileSync("src/core/i18n/globalSearchMessages.ts", "utf8").includes("ar:") && fs.readFileSync("src/core/i18n/globalSearchMessages.ts", "utf8").includes("en:")],
  ["no new sidebar item", !fs.readFileSync("src/core/navigation/navigationRegistry.ts", "utf8").includes("global-search")],
];

const missing = required.filter((path) => !fs.existsSync(path));
const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);

if (missing.length || failed.length) {
  console.error("Stage 8 Global Search audit FAILED");
  if (missing.length) console.error(`Missing: ${missing.join(", ")}`);
  if (failed.length) console.error(`Failed: ${failed.join(", ")}`);
  process.exit(1);
}

process.stdout.write(`Stage 8 Global Search audit PASS — ${checks.length} checks\n`);
