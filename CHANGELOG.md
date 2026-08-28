# CHANGELOG.md

Reconstructed baseline as of 2026-07-31 from committed migration files and archived handoff records. Maintained going forward per change — not regenerated from scratch each time.

---

## 2026-08-28 — Global UX/IA Stage 4 — Workspace Personalization
- Extended the canonical Stage 3 Workspace implementation with a permission/feature-aware Widget Library for adding authorized Widgets.
- Added Widget add/remove personalization while preserving Widget definitions and Domain ownership.
- Added desktop native drag-and-drop reordering within the existing Widget layers.
- Added mobile-friendly move-up/move-down controls so personalization does not depend on desktop drag-and-drop.
- Preserved natural Widget sizing and normal vertical scrolling for additional Widgets instead of forcing a fixed visible set.
- Allowed explicitly selected authorized Widgets to persist on a surface even when they are not that surface's default Widget set.
- Kept presentation persistence scoped to authenticated user + Workspace surface and retained the existing local persistence boundary.
- Connected Widget toolbar actions to the single WorkspaceRenderer orchestration state, eliminating independent per-Widget hook state and ensuring immediate UI updates.
- Added bilingual Arabic/English labels for all new personalization controls through the existing render-time i18n catalogue.
- No database migration, authorization redesign, Workspace Membership layer, PJ change, AJM Domain change, Patient Flow change or Queue replacement was introduced.
- Runtime validation remains the final closure gate for Stage 4.

## 2026-08-28 — Global UX/IA Stage 3 — Workspace Foundation
- Reused the existing canonical Workspace engine, renderer, shell, registry and persistence instead of creating a second Workspace system.
- Established the existing `/` surface as an explicit working surface with bilingual context/title/description and separated Quick Actions from Status/Analytics presentation.
- Added explicit default Workspace contexts to the existing Widget registry so the same Widget catalogue can be presented appropriately across Global/Home, Operations and Clinical contexts.
- Scoped existing Workspace presentation state to authenticated user + Workspace surface, preventing Home preferences from bleeding into Operations or Clinical.
- Threaded Workspace context through the existing Widget renderer/toolbar path without changing authorization or Domain ownership.
- Added bilingual Working Surface messaging through the existing render-time i18n catalogue.
- No database schema/data migration was required; live production Workspace permissions were verified directly.
- No PJ Patient Flow/Queue logic, AJM Domain ownership, authorization engine, Global Search, Dashboard, or Administration Workspace route was changed.
- Runtime/production validation remains the final closure gate for Stage 3.

## 2026-08-08 — Session 11 Recovery (Workspace Architecture)
- **Root cause of build failure:** `workspaceEngine.ts` called the async `isFeatureEnabled()` (from `featureRegistry.ts`) synchronously — a `Promise<boolean>` passed where `boolean` was expected, rejected by `tsconfig strict:true`. Confirmed against real Vercel build log (previous deployment failed at this exact type-check line).
- **`src/core/workspace/workspaceEngine.ts`:** reduced to only the pure, synchronous `resolveWidgetVisibility()` — no Supabase, no async, no React. Matches WORKSPACE_ARCHITECTURE_SPECIFICATION.md §21.
- **New `src/core/features/useFeatureFlags.ts` + `types.ts`:** Feature Engine had a server function but no client Hook counterpart (Permission Engine has both). Closes that structural gap; consumed by the new `useWorkspace.ts` orchestration hook, not by the Engine itself.
- **New `src/core/auth/useTenantId.ts` (client) + `resolveTenantId.ts` (server):** single source of truth for `tenant_id`, reading `clinic_users` — not `user_metadata`/`app_metadata`. Repo-wide grep found 12 files using the metadata-based anti-pattern (5 Session 11 widgets + `usePermissions.ts` + 4 dashboard route pages + `queue.queries.ts`/`queue.actions.ts`/`reports.queries.ts`); all 12 now use the shared resolver.
- **`src/app/layout.tsx`:** was a verbatim, mistaken copy of `(dashboard)/layout.tsx` — missing `<html>`/`<body>`, wrapped every route (including public `/login`) in an auth guard + `WorkspaceShell`. Replaced with a correct minimal root layout; `<Toaster />` (sonner) mounted here.
- **`(dashboard)/layout.tsx`:** `AuthProvider` was defined (`src/core/auth/AuthProvider.tsx`) but never mounted anywhere. 6 real components already called `useAuth()` and would have thrown at render. Now wrapped, scoped to the `(dashboard)` route group.
- **`package.json`:** added missing `sonner` dependency (Vercel build: `Module not found`).
- **`src/domain/invoicing/invoicing.queries.ts`:** added missing `"use server"` (Server/Client boundary violation — `next/headers` reached the client bundle via `BillingSummaryWidget`).
- **New `src/domain/queue/queue.hooks.ts`:** `QueueWidget.tsx` imported a `useQueueStats` hook that never existed. Added as a thin wrapper around the existing `getQueueStats()` server action. Also fixed 4 field-name mismatches against the real `QueueStats` type.
- **`src/features/workspace/widgets/agenda/QuickAppointmentWidget.tsx`:** `useDoctors/useRooms/useProcedures` called without the required `tenantId` argument; `createAgendaEvent` called with a plain object where the real (and elsewhere-used) contract is `FormData`. Widget fixed to match the real contracts — `createAgendaEvent`'s signature was not changed (still used by `agenda-event-form.tsx` with real `FormData`).
- **New `src/domain/invoicing/useBillingSummary.ts`:** `BillingSummaryWidget` referenced a nonexistent `useInvoiceSummary`. Wired instead to the existing, documented Reports catalog queries (`getRevenueSummary`/`getPaidInvoices`/`getOutstandingInvoices` — see ARCHITECTURE_DECISIONS.md Billing report list). No new aggregation logic. `average_invoice` figure dropped (no definition exists anywhere) — flagged as decision required, not invented.
- **`AnalyticsOverviewWidget.tsx`:** real `useAnalyticsOverview(authUserId, datePreset)` returns `KpiResult[]` from the existing KPI registry, not a summary object. Widget now filters for `patients.total`/`appointments.total`/`revenue.total`, which already exist in `kpi.definitions/*.ts`. `conversion_rate` figure dropped (no matching KPI or definition exists) — flagged as decision required.
- **Database — `feature_flags` seed:** `analytics` and `reports` module keys were missing from the 2026-08-04 seed (only 6 of the 8 keys `WORKSPACE_ARCHITECTURE_SPECIFICATION.md` §9 lists were seeded). Added via `supabase/migrations/20260808_seed_analytics_reports_feature_flags.sql`, same pattern as the existing 6 rows (globally-enabled, `tenant_id = NULL`).
- **Removed `src/core/workspace/hooks/useWidgetVisibility.ts`:** confirmed dead code (zero imports anywhere) — a duplicate, unused implementation of the same widget-visibility logic now correctly living in `workspaceEngine.ts` + `useWorkspace.ts`.
- **Removed `src/app/page.tsx`:** duplicate route — both this file and `src/app/(dashboard)/page.tsx` resolved to `/`, and this one additionally `redirect("/dashboard")`ed to a route that doesn't exist (`(dashboard)` is a route group, excluded from the URL).
- **Not fixed — flagged as decision required:** `infrastructure/supabase/server.ts` still resolves the RLS tenant context from `user_metadata`/`app_metadata` internally (used by 19+ files across the whole app — changing it touches the authentication/RLS foundation, out of mechanical-fix scope).
- **Verified pending:** `npm run build` / `npm run lint` — not executed (no Node/network in the working environment used for this recovery). All fixes verified by manual import/signature/type cross-referencing plus live Supabase queries instead.

**Addendum (2026-08-08, same day) — real `npm run build` executed by the Owner's team, 5 more issues found and fixed:**
- **`src/shared/components/QueryClientProvider.tsx` was never mounted anywhere** — every `@tanstack/react-query` hook added in this recovery (`useQueueStats`, `useBillingSummary`, the existing `useAnalyticsOverview`) would have thrown "No QueryClient set" at runtime. Not caught by manual review; only a real build/runtime pass surfaces this class of error. Now mounted in `src/app/layout.tsx`, wrapping `children`.
- **`src/app/layout.tsx` — RTL regression introduced, then corrected same day:** the QueryClientProvider fix above was first applied together with `<html lang="en">` (dropping `lang="ar" dir="rtl"`). Neither `(auth)/login` nor `(auth)/register` nor `(auth)/layout.tsx` set their own `dir`, so they were relying entirely on the root layout for RTL — this would have silently rendered the login/register pages left-to-right. Restored `lang="ar" dir="rtl"` on the same `<html>` tag that now also has the correct `QueryClientProvider`.
- **`src/features/workspace/WorkspaceShell.tsx`:** nav icons were rendered as `{item.icon}` (a component reference, not a valid React child) instead of `<item.icon />`. Fixed.
- **`src/features/workspace/widgets/patients/QuickRegistrationWidget.tsx`:** called `createPatientFromObject` with `full_name`/`phone` — the real `PatientInsert` type (`src/domain/patients/patients.types.ts`) requires `first_name`/`last_name`/`phone_primary`. This was incorrectly marked "no issues found" in the earlier manual-only review pass — a real build/type-check catches what manual cross-referencing can miss. Widget now splits the single name input into `first_name`/`last_name` client-side and uses `phone_primary`.
- **`src/core/workspace/widgetRegistry.ts` — moduleKey for the Analytics widget changed back to `ADVANCED_ANALYTICS`** (from `analytics`, which this recovery had restored per `WORKSPACE_ARCHITECTURE_SPECIFICATION.md` §9 and seeded into `feature_flags` accordingly — see entry above). **This directly conflicts with that seed and with §9 and has not been resolved either way — see `PROJECT_HANDOFF.md Open Item #9`.** Left as delivered; not silently overridden in either direction.

## 2026-08-04 — Reports Module (Package 3.1.7)
- **New shared infrastructure `src/core/features/featureRegistry.ts`:** `isFeatureEnabled(tenantId, moduleKey)` queries `feature_flags` for global or tenant-specific enabled flags. Reusable beyond Reports per ADR-007.
- **Seed migration `20260804_seed_feature_flags.sql`:** inserts 6 globally-enabled `feature_flags` rows (`patients`, `agenda`, `queue`, `billing`, `inventory`, `followup`) with `tenant_id = NULL`, preserving current behavior.
- **New `src/domain/reports/moduleRegistry.ts`:** 6 modules with exact keys, labels, and required permissions per Package 3.1.7 table.
- **New `src/domain/reports/reportRegistry.ts`:** 18 reports (3 per module) with exact `dataSource` values per Package 3.1.7 table. No substitutions.
- **New `src/domain/reports/reports.queries.ts`:** one query function per report key, implementing exactly the data source specified. Includes `runReport()` dispatcher.
- **New `src/app/(dashboard)/reports/page.tsx`:** server-side `reports:read` guard via `getEffectivePermissions()`, renders client shell.
- **New `src/features/reports/reports-shell.tsx`:** module dropdown (filtered by `hasPermission + isFeatureEnabled`), report dropdown, date-range picker (shown only when `needsDateRange = true`), Run/Print/Export PDF buttons.
- **`src/features/reports/report-viewer.tsx`:** table render of report results, summary block, Print + Export PDF via `window.print()`.
- **No new PDF-generation library added** — `package.json` confirmed none exists; `window.print()` used per ADR-007 scope.
- **No changes to:** 34 RLS policies, `clinic_users.role` CHECK constraint, `clinic_owner`/`nurse` roles, existing module code, Analytics engine.
- **Verified pending:** build pass, each of 18 reports against real data, module dropdown filtering, Print/Export PDF functionality.

## 2026-08-03 — Patients Permission Wiring (Package 3.1.2)
- **`src/app/(dashboard)/patients/page.tsx`:** wired `patients:create` guard via `usePermissions()` — "Add Patient" button now conditional on permission.
- **`src/features/patients/patient-list.tsx`:** wired `patients:update` and `patients:delete` guards via `usePermissions()` — edit and delete action buttons now conditional.
- **`src/features/patients/patient-detail.tsx`:** wired `patients:update` guard via `usePermissions()` — edit button in detail dialog now conditional.
- **Database correction:** `patients:delete` added to `clinic_admin` in `role_permissions`; `patients:update` removed from `doctor` in `role_permissions`.
- **Verified:** `clinic_admin` sees all actions (create/read/update/delete); `doctor` sees read-only (eye icon only).
- **No changes to:** domain logic, queries, form components, RLS policies, or CHECK constraints.

## 2026-08-02 — التنقل الديناميكي والتحقق من الصلاحيات (حزم 3.0.2/3.0.3/3.0.4)
- **إنشاء `src/core/navigation/navigationRegistry.ts`:** السجل الرسمي لربط 10 مسارات لوحة التحكم بصلاحياتها.
- **تعديل `src/features/dashboard/DashboardShell.tsx`:** استبدال القائمة الثابتة بنسخة ديناميكية باستخدام `usePermissions()`. الحفاظ على RTL والتجاوب.
- **تعديل `src/app/(dashboard)/layout.tsx`:** إضافة حارس المسارات من جانب الخادم باستخدام `permissionEngine.ts` — الدخول المباشر على رابط ممنوع يُعاد توجيهه إلى `/`.
- **لا تغييرات على قاعدة البيانات** في هذه الجلسة.
- **التحقق:** نجاح البناء، اختبار قائمتين مختلفتين (clinic_admin 8 عناصر / doctor 4 عناصر)، اختبار إعادة التوجيه، فحص RTL/تجاوب.

## 2026-08-03 — Inventory Module Architecture Correction (Package 3.1.6 Rev 2)
- **Migration `20260804000001_inventory_transaction_types.sql`:** replaced generic consumption_type with 6 approved Transaction Types (purchase, purchase_return, doctor_request, unused_return, inventory_adjustment_increase, inventory_adjustment_decrease).
- **Transaction Type system:** user selects type only; system derives (+/-) stock effect automatically. No manual (+/-) input.
- **Fixed `get_current_user_role()`:** now reads from `clinic_users` table instead of non-existent JWT claim `user_role`.
- **Updated CHECK constraint:** `inventory_ledger_consumption_type_check` enforces 6 approved types only.
- **Files modified:** `inventory.types.ts`, `inventory.actions.ts`, `inventory-form.tsx`.
- **Verified:** all 6 transaction types work, negative stock guard works, ledger writes with `item_id` populated.

## 2026-07-31 — Engineering Audit & Documentation Consolidation
- Full repository and live-database inspection performed (Repository First Policy established for all future engineering work).
- `SECURITY_AUDIT_REPORT.md` / `SECURITY_HOTFIX_PLAN.md` / `SECURITY_HOTFIX_MIGRATION.sql` produced — no changes applied to production yet, pending Owner approval.
- ADR-001 approved: extend existing `roles`/`permissions`/`role_permissions` schema for the Permission Engine rather than building new tables.
- ADR-002 approved: Milestone 3 (Unified Workspace) confirmed as the current authoritative roadmap target.
- Documentation consolidated: `MASTER_ROADMAP.md`, `ARCHITECTURE_DECISIONS.md`, `DATABASE_SCHEMA.md`, `PROJECT_HANDOFF.md`, `CHANGELOG.md` created/updated per `DOCUMENTATION_CONSOLIDATION_PLAN.md`.

## 2026-07-30 — Analytics Engine Closed
- Phase 1A (Analytics Engine) formally closed per `CORE_SYSTEM_INDEX.md`.

## 2026-07-29 — Signup Flow Fix, Queue Diagnostics, Queue Schema Fix
- **Migration `20260729120000_add_file_number_to_clinic_patients.sql`:** added `file_number` (varchar 50) to `clinic_patients` — root-cause fix for the `/queue` failure (`column clinic_patients_1.file_number does not exist`).
- **Migration `20260729100000_capture_invoice_items_and_payments.sql`:** added `invoice_items` and `invoice_payments` tables.
- `create_tenant_with_subscription()` rewritten: stopped writing to legacy tables (`tenants`, `users`, `subscriptions`, `subscription_events`, `roles`, `subscription_plans`); now writes only to `master_tenants` and `clinic_users` (see `ARCHITECTURE_DECISIONS.md` ADR-000).
- `src/core/auth/actions.ts updated: explicitly writes tenant_id/role into both user_metadata and app_metadata after tenant creation, since the handle_new_user trigger fires before the clinic_users row exists.
- `src/infrastructure/supabase/server.ts updated: switched from a raw set_config RPC call to the dedicated set_tenant_id() function.
- Security fix applied: set_tenant_id() was found using database-connection-wide config scope (set_config(..., false)) instead of transaction-local (true) — a genuine tenant-isolation risk under connection pooling. Corrected to true.
- Diagnosed and fully reverted: temporary debug patch on src/app/(dashboard)/queue/page.tsx used to capture the exact /queue error, then cleanly reverted.

## 2026-07-21 — Initial Schema Baseline
- Migration `20260721100539_remote_schema.sql`: initial committed schema — full multi-tenant table set (patients, agenda, invoicing, queue/visit-sessions, inventory ledger, retention follow-ups, analytics snapshots, subscription/billing/platform... (truncated)
