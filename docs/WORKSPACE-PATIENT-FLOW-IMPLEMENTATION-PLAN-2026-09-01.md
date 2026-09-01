# CORE SYSTEM — Workspace & Patient Flow Implementation Plan
## 2026-09-01

Status: **EXECUTION PLAN**
Engineering basis: `docs/WORKSPACE-PATIENT-FLOW-ENGINEERING-SPEC-2026-09-01.md`

## Execution order

### EP-0 — Baseline and safety
- Preserve Git history.
- Confirm current main and identify the pre-accidental-change historical reference points.
- No database reset or destructive rollback.
- Keep existing working domain implementations unless proven incompatible.

### EP-1 — Workspace resolution
- Make `clinic_user_workspaces` the sole runtime assignment source for ordinary users.
- Remove runtime Role/permission inference fallbacks.
- Keep Clinic Admin authority separate from ordinary-user workspace logic.

### EP-2 — Home and Workspace separation
- Make `/` the Home landing page.
- Route Workspace navigation to the assigned business Workspace.
- Keep Home out of the business Workspace catalog.
- Preserve useful Home information while removing operational default actions from Home.

### EP-3 — Sidebar
- Implement Workspace / My Workspace as the Workspace entry.
- Show authorized Modules/Domains beneath it using the existing domain navigation registry.
- Keep My Settings as the personal account area.
- Remove Patient Flow from ordinary Sidebar navigation.
- Do not introduce `My Financial`, `My Agenda`, or similar fake domain modules.

### EP-4 — Business Workspaces
- Preserve and reconcile Clinical and Operational working surfaces.
- Complete Administration working surface using existing reusable Workspace renderer and administration/financial/customer-service capabilities.
- Ensure the three surfaces are materially different by daily work, not merely labels.

### EP-5 — My Workspace and widgets
- Reuse WorkspaceRenderer, persistence and widget registry.
- Build defaults from assigned Workspace plus effective permissions.
- Keep executable widgets as the default emphasis.
- Keep informational widgets where useful.
- Enforce permission-aware action presentation and server-side authorization.

### EP-6 — Patient Flow separation
- Preserve Patient Flow workflow implementation.
- Remove it from ordinary user navigation.
- Preserve administrative/background access needed by Clinic Admin for configuration/validation.
- Correct terminology so Patient Journey and Patient Flow are never conflated.

### EP-7 — My Settings
- Keep Workspace assignment out of user self-settings.
- Keep personal display/account preferences in My Settings.
- Preserve sidebar collapse as a personal display preference.

### EP-8 — Global Search
- Preserve the existing global search capability.
- Ensure it is presented as a header search bar, not a Home/Workspace widget.
- Preserve tenant and authorization scoping.

### EP-9 — Data reconciliation
- Inspect existing `clinic_user_workspaces` data and related role/permission/workspace records.
- Only create a migration if data requires correction.
- Never delete valid tenant/user data merely to simplify implementation.

### EP-10 — Validation
- Build/type/lint.
- Static architecture checks.
- Role/workspace/permission matrix.
- Home/Sidebar/Workspace navigation tests.
- Patient Flow non-navigation tests.
- Widget capability tests.
- Clinic Admin full-surface tests.
- Production route checks.

### EP-11 — Closure
- Update only documentation that records verified implementation state.
- Record remaining findings explicitly; no silent closure.
- Confirm no superseded architecture is referenced by active execution documents.
