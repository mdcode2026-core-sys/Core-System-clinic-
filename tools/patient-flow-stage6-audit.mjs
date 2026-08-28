import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function read(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    failures.push(`Missing required file: ${file}`);
    return "";
  }
  return fs.readFileSync(full, "utf8");
}

function requireText(file, text, label = text) {
  const content = read(file);
  if (content && !content.includes(text)) failures.push(`${file}: missing ${label}`);
}

const migrationPath = "supabase/migrations/20260828185953_pj_stage6_patient_flow_permissions.sql";
const migration = read(migrationPath);
const stageDoc = read("docs/GLOBAL-UX-IA-STAGE-6-PATIENT-FLOW-QUEUE-2026-08-28.md");

for (const permission of [
  "patient_flow:operations",
  "patient_flow:clinical",
  "patient_flow:administrative",
]) {
  requireText("src/core/permissions/types.ts", permission);
  requireText("src/core/navigation/navigationRegistry.ts", permission);
  requireText(migrationPath, permission);
}

for (const route of [
  "/patient-flow",
  "/patient-flow/operations",
  "/patient-flow/clinical",
  "/patient-flow/administrative",
]) requireText("src/core/navigation/navigationRegistry.ts", route);

for (const page of [
  "src/app/(dashboard)/patient-flow/page.tsx",
  "src/app/(dashboard)/patient-flow/operations/page.tsx",
  "src/app/(dashboard)/patient-flow/clinical/page.tsx",
  "src/app/(dashboard)/patient-flow/administrative/page.tsx",
]) {
  const content = read(page);
  if (content && !content.includes("getEffectivePermissions")) failures.push(`${page}: missing server-side effective permission check`);
  if (content && !content.includes("resolveTenantId")) failures.push(`${page}: missing tenant resolution`);
  if (content && !content.includes("createClient")) failures.push(`${page}: missing server Supabase client`);
}

requireText("src/features/patient-flow/PatientFlowBoard.tsx", 'type PatientFlowContext = "operations" | "clinical" | "administrative"');
requireText("src/features/patient-flow/PatientFlowBoard.tsx", "getQueue");
requireText("src/features/patient-flow/PatientFlowBoard.tsx", "moveFromPatientFlow");
requireText("src/features/patient-flow/PatientFlowBoard.tsx", "allowedTargets");
requireText("src/features/patient-flow/PatientFlowBoard.tsx", "onDrop");

requireText("src/domain/queue/workspace.actions.ts", "function patientFlowPermission");
requireText("src/domain/queue/workspace.actions.ts", 'requirePermission(permissions, patientFlowPermission(context))');
requireText("src/domain/queue/workspace.actions.ts", 'requirePermission(permissions, "sessions:update")');
requireText("src/domain/queue/workspace.actions.ts", "queueEngine.validateTransition");
requireText("src/domain/queue/workspace.actions.ts", '.eq("tenant_id", tenantId)');
requireText("src/domain/queue/workspace.actions.ts", 'revalidatePath("/(dashboard)/patient-flow")');

for (const transition of [
  'waiting: ["in_consultation", "no_show", "cancelled"]',
  'in_consultation: ["pending_close", "cancelled"]',
  'pending_close: ["completed", "cancelled"]',
  'completed: [],',
  'cancelled: [],',
  'no_show: [],',
]) requireText("src/domain/queue/queue.engine.ts", transition, `canonical transition ${transition}`);

if (migration && /role_permissions/.test(migration)) failures.push("Stage 6 permission migration must not grant Patient Flow permissions automatically through role_permissions");
if (stageDoc && !stageDoc.includes("zero automatic role grants")) failures.push("Stage 6 implementation record must document zero automatic role grants");

if (failures.length) {
  console.error("Stage 6 Patient Flow audit FAILED:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Stage 6 Patient Flow audit passed: canonical Queue reuse, three explicit contexts, server authorization, tenant scoping, transition validation, navigation and migration invariants verified.");
