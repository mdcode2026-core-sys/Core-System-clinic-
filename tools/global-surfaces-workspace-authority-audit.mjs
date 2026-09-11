#!/usr/bin/env node

import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const failures = [];
const pass = (name) => console.log(`PASS|${name}`);
const fail = (name, detail) => { failures.push(`${name}: ${detail}`); console.error(`FAIL|${name}|${detail}`); };
const assert = (name, condition, detail) => condition ? pass(name) : fail(name, detail);

const myWorkspacePage = read("src/app/(dashboard)/my-workspace/page.tsx");
const renderer = read("src/features/workspace/WorkspaceRenderer.tsx");
const surfaces = read("src/core/workspace/workspaceSurfaces.ts");
const useWorkspace = read("src/core/workspace/hooks/useWorkspace.ts");
const persistence = read("src/core/workspace/hooks/useWidgetPersistence.ts");
const registry = read("src/core/workspace/widgetRegistry.ts");
const settingsAction = read("src/domain/user-settings/userSettings.actions.ts");
const rlsMigration = read("supabase/migrations/20260911200000_workspace_assignment_authority_hardening.sql");
const currentWorkspace = read("src/core/workspace/currentWorkspace.ts");

assert("my-workspace-route-identity", myWorkspacePage.includes('workspaceKey="my-workspace"'), "My Workspace route must use the dedicated identity");
assert("renderer-default-identity", renderer.includes('workspaceKey = "my-workspace"'), "WorkspaceRenderer default must not be Home/global");
assert("workspace-hook-default-identity", useWorkspace.includes('workspaceKey: WorkspaceSurfaceKey = "my-workspace"'), "useWorkspace default must not be Home/global");
assert("persistence-default-identity", persistence.includes('workspaceKey: WorkspaceSurfaceKey = "my-workspace"'), "widget persistence default must not be Home/global");
assert("surface-key-separation", surfaces.includes('"global" | "my-workspace"') && surfaces.includes('key: "my-workspace"'), "Home and My Workspace must have distinct technical identities");
assert("business-surface-filter", surfaces.includes('["global", "my-workspace"].includes(surface.key)'), "My Workspace must not be treated as a business Workspace assignment");
assert("registry-no-home-defaults", !/defaultWorkspaces:\s*\[[^\]]*"global"/.test(registry), "Widget defaults must not use Home/global as the personal Workspace identity");
assert("settings-type-no-workspace", !settingsAction.includes("default_workspace"), "Personal settings action must not accept or write default_workspace");
assert("rls-no-self-write", rlsMigration.includes("has_tenant_permission(get_current_tenant_id(), 'users:update')") && !rlsMigration.includes("OR user_id=(SELECT id FROM public.clinic_users"), "Workspace RLS must require administrative users:update authority");
assert("runtime-source-explicit", currentWorkspace.includes("clinic_user_workspaces") && !currentWorkspace.includes("clinic_user_settings.default_workspace"), "Runtime Workspace resolution must remain on clinic_user_workspaces, not personal settings");
assert("no-global-my-workspace-route", !myWorkspacePage.includes('workspaceKey="global"'), "My Workspace route still references Home/global");

if (failures.length) {
  console.error(`GLOBAL_SURFACES_WORKSPACE_AUTHORITY_AUDIT=FAIL failures=${failures.length}`);
  process.exit(1);
}
console.log("GLOBAL_SURFACES_WORKSPACE_AUTHORITY_AUDIT=PASS");
