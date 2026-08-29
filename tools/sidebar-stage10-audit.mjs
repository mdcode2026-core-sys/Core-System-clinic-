import fs from "node:fs";

const registryPath = "src/core/navigation/navigationRegistry.ts";
const shellPath = "src/features/workspace/EntitlementAwareWorkspaceShell.tsx";
const registry = fs.readFileSync(registryPath, "utf8");
const shell = fs.readFileSync(shellPath, "utf8");

const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

const expectedSidebarOrder = [
  '"/"', '"/patients"', '"/agenda"', '"/patient-flow"', '"/treatment-plans"',
  '"/financial-resources"', '"/follow-up"', '"/reports"', '"/analytics"', '"/dashboard"', '"/settings"',
];

let previous = -1;
for (const href of expectedSidebarOrder) {
  const index = registry.indexOf(`href: ${href}`);
  expect(index >= 0, `Missing canonical Sidebar entry ${href}`);
  expect(index > previous, `Sidebar order is not canonical around ${href}`);
  previous = index;
}

expect(registry.includes('visibility: "contextual"'), "Contextual visibility contract is missing");
expect(registry.includes('href: "/operation"') && registry.includes('requiredPermission: "workspace:operation"'), "Operations contextual route is missing or not permission-bound");
expect(registry.includes('href: "/clinical"') && registry.includes('requiredPermission: "workspace:clinical"'), "Clinical contextual route is missing or not permission-bound");
expect(registry.includes('href: "/queue"') && registry.includes('requiredPermission: "sessions:read"'), "Queue compatibility route is missing or not permission-bound");
expect(registry.includes('navigationOnly: true, visibility: "sidebar"'), "Sidebar group contract is missing");
expect(/href: "\/financial-resources"[^\n]*navigationOnly: true/.test(registry), "Financial & Resources must be a navigation group");
expect(registry.includes('href: "/patient-flow/operations"') && registry.includes('href: "/patient-flow/clinical"') && registry.includes('href: "/patient-flow/administrative"'), "Patient Flow must expose the three approved child views");
expect(registry.includes('href: "/dashboard"') && registry.includes('requiredPermission: "analytics:read"'), "Dashboard must remain permission-aware");
expect(registry.includes('function flattenNavigation') && registry.includes('getRequiredPermission'), "Canonical recursive route permission resolver is missing");
expect(registry.includes('href: "/financial-resources/financial-plans"') && registry.includes('navigationOnly: true'), "Financial Plans must be a disclosure group");
expect(registry.includes('href: "/financial-resources/insurance"') && registry.includes('navigationOnly: true'), "Insurance must be a disclosure group");
expect(registry.includes('href: "/inventory"') && registry.includes('navigationOnly: true'), "Inventory must be a disclosure group");
expect(registry.includes('href: "/financial-resources/purchasing"') && registry.includes('navigationOnly: true'), "Purchasing must be a disclosure group");

expect(!shell.includes('WorkspaceSurfaceNav'), "Fixed WorkspaceSurfaceNav must not remain in the active Sidebar shell");
expect(shell.includes('navigationOnly'), "Active Sidebar shell must honor navigation-only groups");
expect(shell.includes('aria-expanded={open}'), "Sidebar groups must expose expanded/collapsed state");
expect(shell.includes('aria-label={isArabic ? "التنقل الرئيسي" : "Primary navigation"}'), "Sidebar must expose a bilingual primary-navigation label");
expect(shell.includes('const pathMatches = (href: string) => href === "/" ? pathname === "/"'), "Root active-state matching must not mark every route as Workspace");
expect(shell.includes('getSidebarNavigation()'), "Active shell must consume the canonical navigation registry");
expect(shell.includes('hasPermission') && shell.includes('hasCapability'), "Sidebar visibility must remain permission/entitlement aware");

const routeMatches = [...registry.matchAll(/\{ href: "([^"]+)"/g)].map((match) => match[1]);
const counts = new Map();
for (const href of routeMatches) counts.set(href, (counts.get(href) ?? 0) + 1);
for (const href of ["/", "/patients", "/agenda", "/patient-flow", "/treatment-plans", "/financial-resources", "/follow-up", "/reports", "/analytics", "/dashboard", "/settings", "/operation", "/clinical", "/queue"]) {
  expect(counts.get(href) === 1, `Duplicate navigation route detected: ${href}`);
}

if (failures.length) {
  console.error("Stage 10 Sidebar audit FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Stage 10 Sidebar audit PASSED");
console.log(`Canonical Sidebar entries checked: ${expectedSidebarOrder.length}`);
console.log("Contextual Operations / Clinical / Queue routes remain outside the Sidebar while retaining route permissions.");
console.log("Patient Flow and Financial & Resources are navigation groups; nested financial groups are disclosure-only; Workspace is the only top-level working surface.");
