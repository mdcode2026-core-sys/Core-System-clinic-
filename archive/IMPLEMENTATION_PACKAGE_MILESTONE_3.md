# IMPLEMENTATION_PACKAGE_MILESTONE_3.md

**Milestone:** 3 — Unified Workspace
**Basis:** `MASTER_ROADMAP.md` Sections 17–22, `ARCHITECTURE_DECISIONS.md` ADR-001, `DATABASE_SCHEMA.md`, and direct inspection of the live repository (exact paths below are confirmed to exist as of 2026-07-31, not assumed).
**Rule:** Every path, table, and permission key below is either confirmed to already exist, or specified exactly as a new object to create. Kimi makes no naming or structural decisions.
**Companion document:** `KIMI_IMPLEMENTATION_PACKAGE.md` (execution order, rules, checklist).

---

## Ground Truth Established by Repository Inspection (read this before Phase 3.0)

- Navigation today is a **fully static, unfiltered array** in `src/features/dashboard/DashboardShell.tsx` (`navItems`) — every logged-in user sees all 7 links regardless of role. This is not partially done; Package 3.0.2 is greenfield work.
- Permission checks today use `src/core/permissions/permissionMatrix.ts`, a hardcoded `Record<UserRole, Permission[]>`, consumed by `<PermissionGuard permission="...">` at the component level, and `useAuth().role` (from `src/core/auth/AuthContext.ts`) for raw role checks. **This package extends this exact file/type structure — it does not replace it with a new folder structure.**
- The permission key format already in use is `resource:action` (e.g. `patients:read`, `invoices:create`) — **use this exact format for every new key. Do not use dots or any other separator.**
- `subscription_plans`, `inventory:*`, `settings:*` permission keys already exist in the `Permission` union in `src/core/permissions/types.ts` even though no UI/route consumes them yet.
- `src/app/(dashboard)/settings/page.tsx` **already exists** but is a non-functional static mockup (two input fields, a Save button with no handler, no Server Action, no data binding). Treat as a stub to replace, not a route to create.
- `src/app/page.tsx` (the actual dashboard home, **not** `src/app/(dashboard)/page.tsx` which does not exist) independently re-implements the same auth-check-and-wrap-in-`DashboardShell` logic that `src/app/(dashboard)/layout.tsx` already does for every other module. This is a pre-existing inconsistency, not something this package introduces — Package 3.1.1 resolves it.
- Patients, Agenda (Appointments), Queue, Invoicing (Billing), Analytics already have working `domain/`, `features/`, and `app/(dashboard)/` layers. **Their packages below are migration/extension work, not new builds.**
- Inventory, Reports, Follow-up have **no** `domain/`, `features/`, or route files at all — confirmed absent from the file listing. Their packages below are net-new.

---

## Phase 3.0 — Foundational (Blocking — nothing in Phase 3.1 starts before this is done)

### Package 3.0.1 — Permission Engine Runtime

**Objective:** Replace the hardcoded 4-role model with a database-backed, template-driven one, per ADR-001, without touching the 34 existing RLS policies or the `clinic_users.role` column in this phase.

**Scope:** Populate and wire the existing `roles`/`permissions`/`role_permissions` tables. Does not include a management UI (that's Milestone 2).

**Database Impact (exact — no new tables except one):**
1. Populate `permissions` — one row per existing `Permission` union value in `src/core/permissions/types.ts` (24 rows: `patients:read/create/update/delete`, `sessions:read/create/update/delete`, `agenda:read/create/update/delete`, `invoices:read/create/update`, `inventory:read/create/update`, `analytics:read`, `users:read/create/update/delete`, `settings:read/update`, `audit:read`) **plus** new keys this milestone introduces: `reports:read`, `followup:read`, `followup:create`, `followup:update`.
2. Populate `role_permissions` — map each of the 6 existing `roles` rows to the permission set currently hardcoded in `permissionMatrix.ts` for the 4 roles that already exist there (`super_admin`, `clinic_admin`, `doctor`, `receptionist`). For `clinic_owner` and `nurse` (seeded in `roles` but unused in code): **do not activate these in this package** — no mapping, no exposure in the app yet. Flag as future work; activating them requires relaxing the `clinic_users.role` CHECK constraint, which is explicitly out of scope here (see ADR-001 consequences).
3. **New template — "Accounting"** (per `MASTER_ROADMAP.md` Section 5's default template list: Doctor, Reception, Accounting): insert a new `roles` row (`role_key = 'accounting'`, `is_system_role = true`, `role_name = 'Accounting'`, `role_name_ar = 'المحاسبة'`), mapped in `role_permissions` to: `invoices:read/create/update`, `inventory:read/create/update`, `patients:read` (to look up a patient for an invoice), `analytics:read`. This template has **no** corresponding value in `clinic_users.role`'s CHECK constraint yet — see Task 4 below.
4. **One net-new table** — `clinic_user_permission_overrides`: `id uuid pk`, `tenant_id uuid → master_tenants`, `user_id uuid → clinic_users`, `permission_id uuid → permissions`, `granted boolean` (true = explicit grant beyond template, false = explicit revoke from template), `created_by uuid → clinic_users`, `created_at timestamptz default now()`. RLS: readable/writable only by users with `users:update` permission within their own tenant.
5. **`clinic_users.role` CHECK constraint:** left exactly as-is in this package (still limited to the 4 existing values). The new `Accounting` template cannot yet be assigned to a real user via `clinic_users.role` until a follow-up package relaxes this constraint — **flag this explicitly in the Milestone 3 handoff report as a known limitation**, do not silently work around it.

**Required Services/Hooks (new, following the existing file structure — do not create a `lib/` folder, this project uses `domain/`/`core/`):**
- `src/core/permissions/permissionEngine.ts` (new) — `getEffectivePermissions(userId, tenantId): Promise<Permission[]>`: resolves `clinic_users.role` → matching `roles.role_key` → `role_permissions` → `permissions`, then applies any rows in `clinic_user_permission_overrides` for that user (grants add, revokes remove).
- Extend `src/core/permissions/PermissionGuard.tsx` and add `src/core/permissions/usePermissions.ts` (new) — client hook wrapping `getEffectivePermissions` results (fetched once at session start, not per-render), exposing `hasPermission(key)` / `hasAnyPermission(keys[])`. This supplements, not replaces, the existing `hasPermission(role, permission)` synchronous function in `permissionMatrix.ts` — keep both during transition (`permissionMatrix.ts` remains the fallback/default-template source; `permissionEngine.ts` is the new per-user-aware resolver).

**Files to Create:** `src/core/permissions/permissionEngine.ts`, `src/core/permissions/usePermissions.ts`, one migration file (see Database Impact above).
**Files to Modify:** none required (this package is additive).
**Files to Remove:** none.

**Validation:** unit test `getEffectivePermissions` against all 4 active templates plus one user with an override row.
**Permission Requirements:** N/A (this package builds the engine itself).
**Acceptance Criteria:** a seeded `clinic_admin` user's `getEffectivePermissions()` output exactly matches what `permissionMatrix.clinic_admin` currently returns; adding one override row changes the output correctly.
**Definition of Done:** migration applied, 0 TypeScript/lint errors, unit tests passing, `SECURITY_HOTFIX_MIGRATION.sql` Phase A/B already applied first (do not build new permission infrastructure on top of the unresolved `anon` exposure findings).

---

### Package 3.0.2 — Dynamic Navigation

**Objective:** Replace the static `navItems` array in `DashboardShell.tsx` with a permission-filtered, dynamically generated menu.

**Files to Modify:** `src/features/dashboard/DashboardShell.tsx` — replace the hardcoded `navItems` constant with a call to a new registry (below), filtered through `usePermissions()` from Package 3.0.1.
**Files to Create:** `src/core/navigation/navigationRegistry.ts` — array of `{ href, labelKey, icon, requiredPermission }` for all modules, including the new ones (Inventory, Reports, Follow-up) added as disabled/hidden entries until their packages ship.

**Navigation → Permission Mapping (exact, no ambiguity left for Kimi):**

| href | label (ar) | required permission |
|---|---|---|
| `/` | لوحة التحكم | none (always visible to any authenticated user) |
| `/patients` | المرضى | `patients:read` |
| `/agenda` | الأجندة | `agenda:read` |
| `/queue` | الطابور | `sessions:read` |
| `/invoices` | الفواتير | `invoices:read` |
| `/inventory` | المخزون | `inventory:read` |
| `/reports` | التقارير | `reports:read` |
| `/analytics` | التحليلات | `analytics:read` |
| `/follow-up` | المتابعة | `followup:read` |
| `/settings` | الإعدادات | `settings:read` |

**Route guard:** add a server-side check in `src/app/(dashboard)/layout.tsx` (existing file) — after the existing `auth.getUser()` check, resolve permissions via `permissionEngine.ts` and redirect (not just hide) if the requested path's required permission is absent. This closes the gap the roadmap's acceptance criteria requires ("unauthorized modules never accessible," not just "never shown").

**Acceptance Criteria:** two users with different `clinic_users.role` values see different nav menus from the same build; direct URL entry to an unpermitted route redirects rather than rendering.
**Definition of Done:** verified with at least 2 distinct roles manually; 0 TypeScript/lint errors.

---

### Package 3.0.3 / 3.0.4 — RTL and Responsive Verification (not a rebuild)

**Objective:** Milestone 1 ("Core Foundation") already lists RTL Support and Responsive Foundation as completed scope. This package is **verification against the new/changed surfaces only** (dynamic nav, new Inventory/Reports/Follow-up pages), not a rebuild of shell-level RTL/responsive behavior.
**Task:** manual check of `DashboardShell.tsx`'s mobile `Sheet` drawer and desktop `aside` sidebar after the nav becomes dynamic (item count will change per role — confirm no layout breakage with fewer items). Extend the same pattern to the three new module pages once built in Phase 3.1.
**Acceptance Criteria:** no visual regression in the existing 6 modules; new modules follow the same Tailwind logical-property convention already in use.

---

## Phase 3.1 — Modules

### Package 3.1.1 — Dashboard (resolve the existing route duplication)

**Objective:** Fix the `src/app/page.tsx` vs `(dashboard)/layout.tsx` duplication found during inspection, and make dashboard widgets permission-aware.

**Files to Modify:** `src/app/page.tsx` — remove its independent `auth.getUser()` + manual `<DashboardShell>` wrap; it should render only the dashboard's content, relying on `(dashboard)/layout.tsx` for auth+shell. **Decision needed and now made:** the dashboard stays at `/` (`src/app/page.tsx`), matching `CORE_SYSTEM_INDEX.md`'s documented "official route" — but it must move to sit inside the `(dashboard)` route group's rendering path rather than duplicate the wrapper logic. Concretely: move the dashboard's content into `src/app/(dashboard)/page.tsx` (new file) and reduce `src/app/page.tsx` to a redirect to `/` — **wait, `/` already maps to `src/app/page.tsx` at the App Router root; since `(dashboard)` is a route group (no URL segment), `src/app/(dashboard)/page.tsx` also resolves to `/`, which is a routing conflict (Next.js will not allow both to exist for the same path). Correct resolution: keep the dashboard content in `src/app/page.tsx` exactly where it is (this IS effectively "the dashboard route" already, route groups just don't show in the URL), and instead make `(dashboard)/layout.tsx` also apply to it by moving `src/app/page.tsx`'s file into the `(dashboard)` route group as `src/app/(dashboard)/page.tsx`, and delete the standalone root `src/app/page.tsx`.**
**Files to Create:** `src/app/(dashboard)/page.tsx` (dashboard content, moved from `src/app/page.tsx`, with the duplicate auth/shell logic removed since `(dashboard)/layout.tsx` now provides it).
**Files to Remove:** `src/app/page.tsx` (superseded by the file above).
**Required Components:** widgets become permission-gated using the same `<PermissionGuard>` pattern already used elsewhere — no new gating mechanism.

**Acceptance Criteria:** `/` still resolves correctly (Next.js route groups don't add a URL segment, so this is a safe, mechanical move); dashboard widgets respect permissions; no duplicate auth-check code remains.
**Definition of Done:** manual route test of `/` after the move; build passes.

---

### Package 3.1.2 — Patients (migration, not new build)

**Objective:** Confirm existing `src/domain/patients/`, `src/features/patients/`, `src/app/(dashboard)/patients/page.tsx` meet Milestone 3's permission-driven requirement; wire to the new engine.
**Files to Modify:** wherever `patients.actions.ts` / `patients.queries.ts` currently checks role directly (if any — verify during Task 1), switch to the new `usePermissions()`/`permissionEngine.ts`. **Do not rewrite the domain logic, queries, or UI components** — they already work.
**Acceptance Criteria:** existing Patients functionality unchanged; permission checks now flow through the new engine rather than (or alongside) `permissionMatrix.ts`.
**Definition of Done:** manual regression test of patient search/create/edit/view; 0 errors.

### Package 3.1.3 — Agenda / Appointments (migration, ~85%→100%)
**Objective:** Same pattern as 3.1.2, applied to `src/domain/agenda/`, `src/features/agenda/`, `src/app/(dashboard)/agenda/page.tsx`. Additionally: this module is officially only ~85% per `PROJECT_HANDOFF.md` — **before wiring permissions, first identify and close the remaining 15%** (not specified in any source document — flag to Owner if the gap isn't obvious from testing).
**Acceptance Criteria/DoD:** same pattern as 3.1.2, plus explicit confirmation of what the remaining 15% was and that it's closed.

### Package 3.1.4 — Queue (migration + close Open Item #1)
**Objective:** Wire permissions (`sessions:*` keys already exist). **Mandatory first task: resolve `PROJECT_HANDOFF.md` Open Item #1** — confirm `/queue` actually loads with an authenticated session (the `file_number` column exists, but this was never formally verified end-to-end). Also resolve the `isDoctor` hardcoded flag in `queue/page.tsx` (Known Issue #008) using the new permission engine instead of a manual boolean, now that `src/features/doctor/MyQueueView.tsx` exists.
**Acceptance Criteria:** `/queue` loads successfully for an authenticated session (screenshot/log evidence in the handoff report); `isDoctor` flag removed in favor of a permission or role check.
**Definition of Done:** Open Item #1 formally closed in `PROJECT_HANDOFF.md`.

### Package 3.1.5 — Billing / Invoicing (migration)
**Objective:** Wire permissions to existing `src/domain/invoicing/`, `src/features/invoicing/`, `src/app/(dashboard)/invoices/`. Confirm the "Accounting" template (Package 3.0.1) can reach this module once role activation is unblocked.
**Note:** `DATABASE_SCHEMA.md` confirms no dedicated refund table — `invoice_status = 'refunded'` is the existing pattern. Do not introduce a new refund entity.
**Acceptance Criteria/DoD:** same pattern as 3.1.2.

### Package 3.1.6 — Inventory (net-new)
**Objective:** Build the module that currently has zero domain/feature/route presence — only `inventory_ledger` (consumption log) exists in the database, no stock/catalog table.
**Database Impact:** new table needed — `inventory_items` (catalog: `id`, `tenant_id`, `name`/`name_ar`, `unit`, `reorder_threshold`, `current_stock`, `is_active`, soft-delete). `inventory_ledger` gets a new `item_id → inventory_items` foreign key (currently free-text `material_name` only) — **this is a schema change to an existing table; confirm with Owner before executing, per "never modify database architecture unless explicitly instructed."**
**Files to Create:** `src/domain/inventory/inventory.types.ts`, `inventory.queries.ts`, `inventory.actions.ts`; `src/features/inventory/inventory-list.tsx`, `inventory-form.tsx`; `src/app/(dashboard)/inventory/page.tsx`.
**Permission keys:** `inventory:read/create/update` already exist in `types.ts` — use them as-is.
**Acceptance Criteria:** stock list view, add/adjust stock flow, low-stock indicator; adjustment writes to `inventory_ledger` linked to `inventory_items`.
**Definition of Done:** new migration applied and reviewed; build passes; permission-gated correctly.

### Package 3.1.7 — Reports (unblocked — full spec per ADR-007, 2026-08-05)

**Objective:** Unified report viewer across modules. Not analytics/BI — no charts, no new KPIs (that's 3.1.8). Two-step selection (Module → Report), in-page render, Print + Export PDF only.

**Task 0 (first, before any other task):** check whether a PDF-generation library already exists anywhere in `package.json`/repo. If yes, use it. If none exists, report this back before adding a new dependency — do not assume.

**New shared infrastructure (build once, reusable beyond Reports — per ADR-007):**
- `src/core/features/featureRegistry.ts` — `isFeatureEnabled(tenantId, moduleKey): Promise<boolean>`, queries `feature_flags` for a row matching `flag_key = moduleKey` where `tenant_id IS NULL OR tenant_id = $tenantId`, `is_enabled = true`.
- **Seed migration:** insert one globally-enabled row per module key into `feature_flags`: `patients`, `agenda`, `queue`, `billing`, `inventory`, `followup` (`tenant_id = NULL`, `is_enabled = true`, `flag_name` = each module's display name). This preserves current behavior — every tenant sees every module they already have permission for.

**Reports-specific registries:**
- `src/domain/reports/moduleRegistry.ts` — array of `{ key, label, labelAr, requiredPermission }` for the 6 modules below.
- `src/domain/reports/reportRegistry.ts` — array of `{ key, moduleKey, label, labelAr, dataSource }` for the 18 reports below.

**Report Catalog (exact — no substitutions):**

| Module (key) | Required permission | Reports (key — data source) |
|---|---|---|
| Patients (`patients`) | `patients:read` | Total Patients — `COUNT(*) FROM clinic_patients WHERE tenant_id=$1 AND deleted_at IS NULL`; New Patients — same + `created_at` within selected date range; Active Patients — same + `patient_status='active'` |
| Agenda (`agenda`) | `agenda:read` | Total Appointments — `COUNT(*) FROM master_agenda_events WHERE tenant_id=$1 AND scheduled_start` within range; Cancelled Appointments — same + `status='cancelled'`; Attendance Rate — `completed / (total - cancelled - rescheduled)` within range |
| Queue (`queue`) | `sessions:read` | Waiting Patients — `COUNT(*) FROM clinic_visit_sessions WHERE session_status='waiting'` (current snapshot, no date range); Average Waiting Time — `AVG(waiting_time_minutes)` within range; Completed Queue — `COUNT(*) WHERE session_status='completed'` within range |
| Billing (`billing`) | `invoices:read` | Revenue Summary — `SUM(amount_paid_subunits) FROM clinic_invoices` within range; Paid Invoices — `COUNT(*) WHERE invoice_status='paid'` within range; Outstanding Invoices — `COUNT(*), SUM(amount_due_subunits) WHERE invoice_status IN ('issued','partial')` |
| Inventory (`inventory`) | `inventory:read` | Low Stock Items — `SELECT * FROM inventory_items WHERE current_stock <= reorder_threshold AND is_active` (current snapshot); Inventory Movements — `inventory_ledger` joined to `inventory_items` within range; Most Consumed Items — `GROUP BY item_id, SUM(quantity_consumed) ORDER BY DESC` within range |
| Follow-up (`followup`) | `followup:read` | Scheduled Follow-ups — `COUNT(*) FROM retention_followups WHERE delivery_status='pending' AND scheduled_for >= now()`; Completed Follow-ups — `COUNT(*) WHERE delivery_status IN ('sent','delivered')` within range; Overdue Follow-ups — `COUNT(*) WHERE delivery_status='pending' AND scheduled_for < now()` |

**Date range:** a single simple date-range picker (default: current calendar month), applied to every report whose data source says "within range." No period-comparison, no presets beyond a plain start/end date — comparison features are explicitly out of scope per ADR-007.

**UI Flow / Files to Create:**
- `src/app/(dashboard)/reports/page.tsx` — server-side permission guard (`reports:read`, matching `navigationRegistry.ts`), renders the client shell.
- `src/features/reports/reports-shell.tsx` — overview blurb + Module dropdown (filtered by `hasPermission(module.requiredPermission) && isFeatureEnabled(tenantId, module.key)`) + Report dropdown (filtered to `reportRegistry` entries for the selected module) + date-range input (shown only when the selected report's data source needs one).
- `src/features/reports/report-viewer.tsx` — renders the selected report's result in a simple table/summary layout, plus Print (native `window.print()`) and Export PDF buttons.
- `src/domain/reports/reports.queries.ts` — one query function per report key, implementing exactly the data source specified in the table above. No query answers more than what's listed.

**Explicitly Out of Scope (per ADR-007 — do not build):** Excel/CSV export, scheduled/email reports, charts, dashboards, BI, custom report builder, advanced period comparison, any report not in the 18 listed above.

**Acceptance Criteria:** Module dropdown shows only modules the current user has permission for AND that are feature-enabled; Report dropdown updates correctly per module; each of the 18 reports returns correct data matching its exact specified query; Print and Export PDF both work; no report/module beyond the specified 18+6 exists.
**Definition of Done:** all 18 reports verified against real data; feature flag seed migration applied; build/lint/type-check clean.

### Package 3.1.8 — Analytics (extend, don't rebuild)
**Objective:** `src/domain/analytics/` is extensive and closed (27 P0 KPIs). Extend the existing `kpi.registry.ts` / `kpi.definitions/` pattern with any new KPIs Inventory/Reports/Follow-up introduce — **do not create a parallel analytics engine.**
**Acceptance Criteria:** existing Analytics tests/build unaffected; new KPIs (if any) follow the exact `kpi.definitions/*.ts` pattern already established.

### Package 3.1.9 — Follow-up (net-new UI/domain, DB already exists)
**Objective:** `retention_followups` table is fully modeled (see `DATABASE_SCHEMA.md`) but has no domain layer, no UI, no route.
**Files to Create:** `src/domain/followup/followup.types.ts`, `followup.queries.ts`, `followup.actions.ts`; `src/features/followup/followup-list.tsx`; `src/app/(dashboard)/follow-up/page.tsx`.
**Scope (per `MASTER_ROADMAP.md` Section 19, deliberately limited):** list view, scheduled view, status update only — **no delivery automation** even though `retention_followups.channel`/`notification_queue` could support it; that's a later milestone.
**Permission keys:** `followup:read/create/update` (added in Package 3.0.1).
**Acceptance Criteria:** list + scheduled views render from `retention_followups`; status update writes correctly; no automated sending is implemented.

---

## Phase 3.2 — Integration & Hardening

- **3.2.1** — Confirm every new/modified write path (Inventory, Follow-up, Queue) logs to `audit_trail` (existing table, see `DATABASE_SCHEMA.md`) — do not create a new audit mechanism.
- **3.2.2** — Full RTL + responsive pass across all 9 modules including the 3 new ones.
- **3.2.3** — Template verification: seed one test user per active template (`clinic_admin`, `doctor`, `receptionist`; `accounting` cannot be assigned to a real user yet per Package 3.0.1 Task 5 limitation — verify via direct `getEffectivePermissions()` call instead) and confirm each sees the correct navigation and can/cannot perform the correct actions.

---

## Expected Handoff Deliverables (every package)

Following the exact format already established in the archived `Handoff_Daily_Report_2026-07-29.md`: Task ID, Root Cause (if applicable), Changes Made, Verification, What Was NOT Touched, Remaining Work. Plus: updates to `CHANGELOG.md`, `PROJECT_HANDOFF.md`, and `DATABASE_SCHEMA.md` (if schema changed) — per `KIMI_IMPLEMENTATION_CONTRACT.md`.
