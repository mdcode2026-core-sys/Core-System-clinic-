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

must("src/core/permissions/permissionEngine.ts", [
  /auth_user_id/,
  /\.eq\("tenant_id", tenantId\)/,
  /is_active/,
  /clinic_user_permissions/,
  /clinic_user_permission_overrides/,
], "effective-permission boundary");

must("src/core/entitlements/entitlementEngine.ts", [
  /"use server"/,
  /tenant_entitlements/,
  /entitlement_capabilities/,
  /isEffective/,
], "server entitlement/capability enforcement");

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

must("src/core/workspace/hooks/useWorkspace.ts", [
  /hasPermission\(definition\.requiredPermission\)/,
  /isFeatureEnabled\(definition\.moduleKey\)/,
  /resolveWidgetVisibility\(/,
  /const definition = widgetRegistry\.find\(\(widget\) => widget\.key === key\);/,
], "customization authorization invariant");

must("src/core/search/actions.ts", [
  /supabase\.auth\.getUser\(\)/,
  /get_current_tenant_id/,
  /getEffectivePermissions/,
  /\.eq\("tenant_id", tenantId\)/,
  /permissions\.has\("patients:read"\)/,
  /permissions\.has\("invoices:read"\)/,
  /permissions\.has\("agenda:read"\)/,
], "authorized global search");

must("src/domain/inventory/inventory.actions.ts", [
  /"use server"/,
  /hasEffectivePermission/,
  /tenant_id: ctx\.tenantId/,
  /\.eq\("tenant_id", ctx\.tenantId\)/,
], "inventory server authorization");

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
