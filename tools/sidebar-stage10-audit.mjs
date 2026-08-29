import fs from "node:fs";

const registryPath = "src/core/navigation/navigationRegistry.ts";
const shellPath = "src/features/workspace/EntitlementAwareWorkspaceShell.tsx";
const registry = fs.readFileSync(registryPath, "utf8");
const shell = fs.readFileSync(shellPath, "utf8");

const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };
const routeIndex = (href) => {
  const patterns = [`href: "${href}"`, `href:"${href}"`];
  return Math.max(...patterns.map((pattern) => registry.indexOf(pattern)));
};
const hasRoute = (href) => routeIndex(href) >= 0;

const expectedSidebarOrder = [
  "/", "/patients", "/agenda", "/patient-flow", "/treatment-plans",
  "/financial-resources", "/follow-up", "/reports", "/analytics", "/dashboard", "/settings",
];

let previous = -1;
for (const href of expectedSidebarOrder) {
  const index = routeIndex(href);
  expect(index >= 0, `Missing canonical Sidebar entry ${href}`);
  expect(index > previous, `Sidebar order is not canonical around ${href}`);
  previous = index;
}

expect(registry.includes('visibility:"contextual"') || registry.includes('visibility: "contextual"'), "Contextual visibility contract is missing");
expect(hasRoute("/operation") && (registry.includes('requiredPermission:"workspace:operation"') || registry.includes('requiredPermission: "workspace:operation"')), "Operations contextual route is missing or not permission-bound");
expect(hasRoute("/clinical") && (registry.includes('requiredPermission:"workspace:clinical"') || registry.includes('requiredPermission: "workspace:clinical"')), "Clinical contextual route is missing or not permission-bound");
expect(hasRoute("/queue") && (registry.includes('requiredPermission:"sessions:read"') || registry.includes('requiredPermission: "sessions:read"')), "Queue compatibility route is missing or not permission-bound");
expect(registry.includes("navigationOnly:true") || registry.includes("navigationOnly: true"), "Sidebar group contract is missing");
expect(hasRoute("/financial-resources") && /href\s*:\s*["']\/financial-resources["'][^\n]*navigationOnly\s*:\s*true/.test(registry), "Financial & Resources must be a navigation group");
expect(hasRoute("/patient-flow/operations") && hasRoute("/patient-flow/clinical") && hasRoute("/patient-flow/administrative"), "Patient Flow must expose the three approved child views");
expect(hasRoute("/dashboard") && (registry.includes('requiredPermission:"analytics:read"') || registry.includes('requiredPermission: "analytics:read"')), "Dashboard must remain permission-aware");
expect(registry.includes("function flattenNavigation") && registry.includes("getRequiredPermission"), "Canonical recursive route permission resolver is missing");
expect(hasRoute("/financial-resources/financial-plans") && /href\s*:\s*["']\/financial-resources\/financial-plans["'][^\n]*navigationOnly\s*:\s*true/.test(registry), "Financial Plans must be a disclosure group");
expect(hasRoute("/financial-resources/insurance") && /href\s*:\s*["']\/financial-resources\/insurance["'][^\n]*navigationOnly\s*:\s*true/.test(registry), "Insurance must be a disclosure group");
expect(hasRoute("/inventory") && /href\s*:\s*["']\/inventory["'][^\n]*navigationOnly\s*:\s*true/.test(registry), "Inventory must be a disclosure group");
expect(hasRoute("/financial-resources/purchasing") && /href\s*:\s*["']\/financial-resources\/purchasing["'][^\n]*navigationOnly\s*:\s*true/.test(registry), "Purchasing must be a disclosure group");

expect(!shell.includes("WorkspaceSurfaceNav"), "Fixed WorkspaceSurfaceNav must not remain in the active Sidebar shell");
expect(shell.includes("navigationOnly"), "Active Sidebar shell must honor navigation-only groups");
expect(shell.includes("aria-expanded={open}"), "Sidebar groups must expose expanded/collapsed state");
expect(shell.includes('aria-label={isArabic ? "التنقل الرئيسي" : "Primary navigation"}'), "Sidebar must expose a bilingual primary-navigation label");
expect(shell.includes('const pathMatches = (href: string) => href === "/" ? pathname === "/"'), "Root active-state matching must not mark every route as Workspace");
expect(shell.includes("getSidebarNavigation()"), "Active shell must consume the canonical navigation registry");
expect(shell.includes("hasPermission") && shell.includes("hasCapability"), "Sidebar visibility must remain permission/entitlement aware");

const routeMatches = [...registry.matchAll(/href\s*:\s*["']([^"']+)["']/g)].map((match) => match[1]);
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
