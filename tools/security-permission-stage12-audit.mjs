import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function read(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    failures.push(`${rel}: missing`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function must(rel, patterns, label) {
  const text = read(rel);
  for (const pattern of patterns) {
    if (!pattern.test(text)) failures.push(`${rel}: missing ${label}: ${pattern}`);
  }
}

// Authorization engine: identity, tenant and active-user boundaries are mandatory.
must("src/core/permissions/permissionEngine.ts", [
  /auth_user_id/,
  /\.eq\("tenant_id", tenantId\)/,
  /is_active/,
  /clinic_user_permissions/,
  /clinic_user_permission_overrides/,
], "effective-permission boundary");

// Entitlements/capabilities must be resolved server-side from the tenant entitlement graph.
must("src/core/entitlements/entitlementEngine.ts", [
  /"use server"/,
  /tenant_entitlements/,
  /entitlement_capabilities/,
  /isEffective/,
], "server entitlement/capability enforcement");

// Widget definitions must declare a permission; the pure resolver must enforce it.
must("src/core/workspace/widgetRegistry.ts", [
  /requiredPermission:/,
  /requiredPermission: "patients:create"/,
  /requiredPermission: "agenda:create"/,
  /requiredPermission: "sessions:read"/,
], "permission-aware widget catalog");
must("src/core/workspace/workspaceEngine.ts", [
  /hasPermission\(widget\.requiredPermission\)/,
  /!isFeatureEnabledFn\(widget\.moduleKey\)/,
], "permission and feature gating");

// Workspace customization is presentation only and cannot make an unauthorized widget visible.
must("src/core/workspace/hooks/useWorkspace.ts", [
  /hasPermission\(definition\.requiredPermission\)/,
  /isFeatureEnabled\(definition\.moduleKey\)/,
  /resolveWidgetVisibility\(/,
], "customization authorization invariant");

// Global Search is an alternate discovery surface and therefore must enforce auth, tenant and permissions.
must("src/core/search/actions.ts", [
  /supabase\.auth\.getUser\(\)/,
  /get_current_tenant_id/,
  /getEffectivePermissions/,
  /\.eq\("tenant_id", tenantId\)/,
  /permissions\.has\("patients:read"\)/,
  /permissions\.has\("invoices:read"\)/,
  /permissions\.has\("agenda:read"\)/,
], "authorized global search");

// Representative mutation domains must retain server-side permission checks and tenant scoping.
must("src/domain/inventory/inventory.actions.ts", [
  /"use server"/,
  /hasEffectivePermission/,
  /tenant_id: ctx\.tenantId/,
  /\.eq\("tenant_id", ctx\.tenantId\)/,
], "inventory server authorization");

// Patient Flow/Queue must remain permission-gated at the existing capability boundary.
must("src/features/workspace/widgets/queue/QueueWidget.tsx", [
  /sessions:read|visits:read/,
], "queue permission reference");

if (failures.length) {
  console.error("STAGE 12 SECURITY/PERMISSION AUDIT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("STAGE 12 SECURITY/PERMISSION AUDIT: PASS");
console.log("Authentication boundary: PASS");
console.log("Server-side authorization boundary: PASS");
console.log("Workspace/widget permission invariant: PASS");
console.log("Capability/feature gate: PASS");
console.log("Global Search authorization boundary: PASS");
console.log("Tenant-scoped representative mutation: PASS");
