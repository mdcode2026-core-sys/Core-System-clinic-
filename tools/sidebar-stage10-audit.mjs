import fs from "node:fs";

const registryPath = "src/core/navigation/navigationRegistry.ts";
const shellPath = "src/features/workspace/EntitlementAwareWorkspaceShell.tsx";
const workspaceSurfacesPath = "src/core/workspace/workspaceSurfaces.ts";
const currentWorkspacePath = "src/core/workspace/currentWorkspace.ts";
const rootPath = "src/app/(dashboard)/page.tsx";
const administrationPath = "src/app/(dashboard)/administration/page.tsx";
const widgetRegistryPath = "src/core/workspace/widgetRegistry.ts";
const userSettingsPath = "src/features/settings/user/UserSettingsManager.tsx";

const registry = fs.readFileSync(registryPath, "utf8");
const shell = fs.readFileSync(shellPath, "utf8");
const workspaceSurfaces = fs.readFileSync(workspaceSurfacesPath, "utf8");
const currentWorkspace = fs.readFileSync(currentWorkspacePath, "utf8");
const root = fs.readFileSync(rootPath, "utf8");
const administration = fs.readFileSync(administrationPath, "utf8");
const widgetRegistry = fs.readFileSync(widgetRegistryPath, "utf8");
const userSettings = fs.readFileSync(userSettingsPath, "utf8");

const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };
const routeIndex = (href) => Math.max(...[`href: "${href}"`, `href:"${href}"`].map((pattern) => registry.indexOf(pattern)));
const hasRoute = (href) => routeIndex(href) >= 0;

const expectedSidebarOrder = [
  "/", "/patients", "/agenda", "/treatment-plans",
  "/financial-resources", "/follow-up", "/reports", "/analytics", "/dashboard", "/settings",
];
let previous = -1;
for (const href of expectedSidebarOrder) {
  const index = routeIndex(href);
  expect(index >= 0, `Missing canonical Sidebar entry ${href}`);
  expect(index > previous, `Sidebar order is not canonical around ${href}`);
  previous = index;
}

expect(!/href\s*:\s*["']\/patient-flow["'][^\n]*visibility\s*:\s*["']sidebar["']/.test(registry), "Patient Flow must not be a primary Sidebar entry");
expect(registry.includes('href:"/patient-flow"') && registry.includes('visibility:"contextual"'), "Patient Flow contextual route contract is missing");
expect(hasRoute("/operation") && registry.includes('requiredPermission:"workspace:operation"'), "Operations contextual route is missing or not permission-bound");
expect(hasRoute("/clinical") && registry.includes('requiredPermission:"workspace:clinical"'), "Clinical contextual route is missing or not permission-bound");
expect(hasRoute("/queue") && registry.includes('requiredPermission:"sessions:read"'), "Queue compatibility route is missing or not permission-bound");
expect(registry.includes("navigationOnly:true") || registry.includes("navigationOnly: true"), "Sidebar group contract is missing");
expect(hasRoute("/financial-resources") && /href\s*:\s*["']\/financial-resources["'][^\n]*navigationOnly\s*:\s*true/.test(registry), "Financial & Resources must be a navigation group");
expect(hasRoute("/patient-flow/operations") && hasRoute("/patient-flow/clinical") && hasRoute("/patient-flow/administrative"), "Patient Flow contextual child views must remain addressable");
expect(hasRoute("/dashboard") && registry.includes('requiredPermission:"analytics:read"'), "Dashboard must remain permission-aware");
expect(registry.includes("function flattenNavigation") && registry.includes("getRequiredPermission"), "Canonical recursive route permission resolver is missing");
expect(hasRoute("/financial-resources/financial-plans") && /href\s*:\s*["']\/financial-resources\/financial-plans["'][^\n]*navigationOnly\s*:\s*true/.test(registry), "Financial Plans must be a disclosure group");
expect(hasRoute("/financial-resources/insurance") && /href\s*:\s*["']\/financial-resources\/insurance["'][^\n]*navigationOnly\s*:\s*true/.test(registry), "Insurance must be a disclosure group");
expect(hasRoute("/inventory") && /href\s*:\s*["']\/inventory["'][^\n]*navigationOnly\s*:\s*true/.test(registry), "Inventory must be a disclosure group");
expect(hasRoute("/financial-resources/purchasing") && /href\s*:\s*["']\/financial-resources\/purchasing["'][^\n]*navigationOnly\s*:\s*true/.test(registry), "Purchasing must be a disclosure group");

expect(currentWorkspace.includes('from("clinic_user_workspaces")'), "Assigned Workspace must be resolved from clinic_user_workspaces");
expect(currentWorkspace.includes('.eq("is_default", true)'), "Assigned Workspace must use the default membership");
expect(root.includes("getAssignedWorkspace") && root.includes("workspaceRoute"), "Workspace entry must route to the assigned Workspace");
expect(administration.includes('workspaceKey="administration"'), "Administration Workspace route must render the Administration surface");
expect(workspaceSurfaces.includes('key: "administration"') && workspaceSurfaces.includes('href: "/administration"') && workspaceSurfaces.includes("implemented: true"), "Administration Workspace must be implemented");
expect(userSettings.includes("Workspace is assigned by the Clinic Admin") && !userSettings.includes("<Select"), "Personal settings must not let users change Workspace assignment");

expect(widgetRegistry.includes('defaultWorkspaces: ["operation"]'), "Quick operational widgets must default to Operations only");
expect(!/key: "quick-registration"[\s\S]*?defaultWorkspaces:\s*\[[^\]]*global/.test(widgetRegistry), "Quick Registration must not default to Home");
expect(!/key: "quick-appointment"[\s\S]*?defaultWorkspaces:\s*\[[^\]]*global/.test(widgetRegistry), "Quick Appointment must not default to Home");

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
for (const href of ["/", "/patients", "/agenda", "/patient-flow", "/treatment-plans", "/financial-resources", "/follow-up", "/reports", "/analytics", "/dashboard", "/settings", "/operation", "/clinical", "/queue"]) expect(counts.get(href) === 1, `Duplicate navigation route detected: ${href}`);

if (failures.length) {
  console.error("Stage 10 Sidebar/Workspace audit FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Stage 10 Sidebar/Workspace audit PASSED");
console.log(`Canonical Sidebar entries checked: ${expectedSidebarOrder.length}`);
console.log("Workspace is the assigned business working surface; Patient Flow remains contextual and outside the primary Sidebar.");
