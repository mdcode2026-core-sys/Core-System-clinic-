import fs from "node:fs";

const required = [
  "src/app/(dashboard)/dashboard/page.tsx",
  "src/core/i18n/dashboardMessages.ts",
  "src/core/navigation/navigationRegistry.ts",
  "src/domain/analytics/analytics.actions.ts",
  "src/app/(dashboard)/page.tsx",
  "src/app/(dashboard)/financial-resources/overview/page.tsx",
];

const read = (path) => fs.readFileSync(path, "utf8");
const dashboard = read(required[0]);
const messages = read(required[1]);
const navigation = read(required[2]);
const analytics = read(required[3]);
const workspaceHome = read(required[4]);
const financialOverview = read(required[5]);

const checks = [
  ["dashboard route exists", fs.existsSync(required[0])],
  ["dashboard is management surface", dashboard.includes("ManagementDashboardPage") && dashboard.includes("management")],
  ["dashboard reuses canonical analytics domain", dashboard.includes("getAnalyticsOverview") && dashboard.includes("KpiGrid")],
  ["dashboard server authorization", dashboard.includes("getEffectivePermissions") && dashboard.includes('permissions.includes("analytics:read")')],
  ["dashboard tenant resolution", dashboard.includes("resolveTenantId(user.id)")],
  ["dashboard bilingual messages", messages.includes("ar:") && messages.includes("en:") && messages.includes("getDashboardMessages")],
  ["dashboard sidebar entry uses existing permission", navigation.includes('{ href: "/dashboard"') && navigation.includes('requiredPermission: "analytics:read"')],
  ["home remains Workspace", workspaceHome.includes("WorkspaceRenderer") && !workspaceHome.includes("ManagementDashboardPage")],
  ["financial overview remains contextual", financialOverview.includes("FinancialResourcesOverviewPage")],
  ["analytics action authenticates caller", analytics.includes('supabase.auth.getUser()') && analytics.includes('user.id !== authUserId')],
  ["analytics action enforces permission", analytics.includes("getEffectivePermissions") && analytics.includes('analytics:read')],
  ["no dashboard database dependency", !dashboard.includes("service_role")],
];

const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error("Stage 9 Overview / Dashboard audit FAILED");
  console.error(`Failed: ${failed.join(", ")}`);
  process.exit(1);
}
process.stdout.write(`Stage 9 Overview / Dashboard audit PASS — ${checks.length} checks\n`);
