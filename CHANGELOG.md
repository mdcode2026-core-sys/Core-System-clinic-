# CHANGELOG.md

Reconstructed baseline as of 2026-07-31 from committed migration files and archived handoff records. Maintained going forward per change — not regenerated from scratch each time.

---

## 2026-08-29 — Global UX/IA Stage 8 — Global Search — CLOSED / PRODUCTION READY
- Implemented the canonical Global Search surface on the existing Workspace shell.
- Reused existing permission resolution, Supabase server access, tenant boundaries, canonical Domain tables and i18n; no parallel authorization, entitlement, workspace, registry, Queue or Patient Journey architecture was created.
- Search coverage includes Patients, Staff, Invoices, Appointments, Treatment Plans, Services/Procedures, Inventory, Suppliers, Purchase Orders and Patient Portal communication context.
- Added dedicated Stage 8 audit and validation workflow; shared UX Stages 0–8 validation passed including TypeScript, i18n, Stage 5–8 audits, changed-surface ESLint and production build.
- Final production candidate SHA: `4a496d269446345a51215cd4217d84dd3ec1f849`.
- Vercel production deployment: `dpl_6hE65ifG3SoFdbvf93f1qE5GugH2` — READY.
- Production `/` returned HTTP 200 and correctly resolved unauthenticated access to `/login`.
- Final deployment runtime log query reported no runtime errors/log entries during the verification window.
- No Stage 8 database migration was required.
- S8-F-001 remains deferred as a non-blocking AJM / Tenant Administration / Medical Master Library refinement because creating new detail routes solely for Search would violate the reuse/reconcile rule.
- S8-F-002 (earlier Vercel rate-limit condition) is resolved; no token-based workaround or repository secret was introduced.

---

## 2026-08-29 — Global UX/IA Stage 7 — Patient Context — CLOSED / PRODUCTION READY
- Closed Stage 7 after engineering, architecture, GitHub CI, production build, Vercel deployment and available production runtime verification gates passed.
- Patient Context remains a presentation/orchestration surface on the canonical Patient Detail surface; no parallel Patient Journey, Queue, registry, authorization, entitlement or Workspace architecture was created.
- Reused existing AJM/PJ surfaces for Patient History, Agenda, Treatment Plans, Invoices, Follow-up and Patient Portal.
- Final validated `main` SHA: `832d49d888d343018c36fb51454ea6caa0306e80`.
- Final UX Stages 0–7 CI run: #84 — PASS.
- Final Production Candidate Handoff run: #24 — PASS.
- Vercel production deployment: `dpl_2fqPkrb34SUtuAntbFNBqmQAaJxg` — READY.
- Production `/login` returned HTTP 200 from the final deployment; English/RTL-LTR runtime surface and responsive viewport metadata were verified; no Vercel runtime errors were reported during the verification window.
- Production Candidate Handoff now relies on the existing Vercel Git integration for `main` and no longer requires a `VERCEL_TOKEN` repository secret.
- `S7-BLOCKER-001` closed after the validated `main` SHA received a READY production deployment.
- No Stage 7 database migration was required.
- Deferred Patient Communication remains a future/cross-workstream item because no canonical active communication workspace exists in current AJM scope; no parallel system was created.

---

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
- **New `src/core/auth/useTenantId.ts` (client) + `resolveTenantId.ts` (server):** single source of truth for `tenant_id`, reading `clinic_users` — not `user_metadata`/`app_metadata`. Repo-wide grep found 12 files using the metadata-based anti-pattern; all affected files now use the shared resolver.
- **`src/app/layout.tsx`:** corrected the root layout so public routes are not wrapped in the dashboard auth shell; `<Toaster />` is mounted here.
- **`(dashboard)/layout.tsx`:** mounted the existing `AuthProvider` in the dashboard route group.
- **`package.json`:** added missing `sonner` dependency.
- **`src/domain/invoicing/invoicing.queries.ts`:** added missing `"use server"` to preserve the Server/Client boundary.
- **New `src/domain/queue/queue.hooks.ts`:** added the missing thin wrapper around the existing `getQueueStats()` server action and reconciled QueueStats field names.
- **`src/features/workspace/widgets/agenda/QuickAppointmentWidget.tsx`:** reconciled existing doctor/room/procedure and agenda-event contracts rather than changing domain signatures.
- **New `src/domain/invoicing/useBillingSummary.ts`:** wired Billing Summary to existing Reports catalog queries without inventing new aggregation logic.
- **`AnalyticsOverviewWidget.tsx`:** reconciled the widget with the existing KPI registry and dropped undefined metrics rather than inventing definitions.
- **Database — `feature_flags` seed:** added the missing `analytics` and `reports` global feature flags through migration `20260808_seed_analytics_reports_feature_flags.sql`.
- **Removed dead duplicate workspace visibility code and the duplicate root route.**
- **Not fixed — flagged as decision required:** `infrastructure/supabase/server.ts` still resolves RLS tenant context from user metadata internally; changing it touches the authentication/RLS foundation and remained outside mechanical-fix scope.

**Addendum (2026-08-08, same day) — real `npm run build` executed by the Owner's team:**
- Mounted `QueryClientProvider` at the root so existing TanStack Query hooks have a runtime provider.
- Corrected the root RTL/LTR baseline after the provider change.
- Fixed workspace nav icon rendering.
- Reconciled Quick Registration with the real `PatientInsert` contract.
- Preserved the existing Analytics widget module-key decision and documented the outstanding architecture conflict rather than silently overriding it.

## 2026-08-04 — Reports Module (Package 3.1.7)
- **New shared infrastructure `src/core/features/featureRegistry.ts`:** `isFeatureEnabled(tenantId, moduleKey)` queries `feature_flags` for global or tenant-specific enabled flags. Reusable beyond Reports per ADR-007.
- **Seed migration `20260804_seed_feature_flags.sql`:** inserts 6 globally-enabled `feature_flags` rows (`patients`, `agenda`, `queue`, `billing`, `inventory`, `followup`) with `tenant_id = NULL`, preserving current behavior.
- **New `src/domain/reports/moduleRegistry.ts`:** 6 modules with exact keys, labels, and required permissions per Package 3.1.7 table.
- **New `src/domain/reports/reportRegistry.ts`:** 18 reports (3 per module) with exact `dataSource` values per Package 3.1.7 table. No substitutions.
- **New `src/domain/reports/reports.queries.ts`:** one query function per report key, implementing exactly the data source specified. Includes `runReport()` dispatcher.
- **New `src/app/(dashboard)/reports/page.tsx`:** server-side `reports:read` guard via `getEffectivePermissions()`, renders client shell.
- **New `src/features/reports/reports-shell.tsx`:** module dropdown (filtered by `hasPermission + isFeatureEnabled`), report dropdown, date-range picker, Run/Print/Export PDF buttons.
- **New `src/features/reports/report-viewer.tsx`:** table render of report results, summary block, Print + Export PDF via `window.print()`.
- **No new PDF-generation library added.**
- **No changes to existing RLS policies, role CHECK constraints, or Analytics engine.**

## 2026-08-03 — Patients Permission Wiring (Package 3.1.2)
- **`src/app/(dashboard)/patients/page.tsx`:** wired `patients:create` guard via `usePermissions()`.
- **`src/features/patients/patient-list.tsx`:** wired `patients:update` and `patients:delete` guards.
- **`src/features/patients/patient-detail.tsx`:** wired `patients:update` guard.
- **Database correction:** `patients:delete` added to `clinic_admin`; `patients:update` removed from `doctor`.
- **Verified:** `clinic_admin` sees all actions; `doctor` sees read-only.

## 2026-08-02 — التنقل الديناميكي والتحقق من الصلاحيات (حزم 3.0.2/3.0.3/3.0.4)
- **إنشاء `src/core/navigation/navigationRegistry.ts`:** السجل الرسمي لربط مسارات لوحة التحكم بصلاحياتها.
- **تعديل `src/features/dashboard/DashboardShell.tsx`:** استبدال القائمة الثابتة بنسخة ديناميكية باستخدام `usePermissions()` مع الحفاظ على RTL والتجاوب.
- **تعديل `src/app/(dashboard)/layout.tsx`:** إضافة حارس المسارات من جانب الخادم باستخدام `permissionEngine.ts`.
- **لا تغييرات على قاعدة البيانات** في هذه الجلسة.
- **التحقق:** نجاح البناء، اختبار قوائم مختلفة، اختبار إعادة التوجيه، وفحص RTL/تجاوب.

## 2026-08-03 — Inventory Module Architecture Correction (Package 3.1.6 Rev 2)
- **Migration `20260804000001_inventory_transaction_types.sql`:** replaced generic consumption_type with 6 approved Transaction Types (purchase, purchase_return, doctor_request, unused_return, inventory_adjustment_increase, inventory_adjustment_decrease).
- **Transaction Type system:** user selects type only; system derives (+/-) stock effect automatically. No manual (+/-) input.
- **Fixed `get_current_user_role()`:** now reads from `clinic_users` instead of non-existent JWT claim `user_role`.
- **Updated CHECK constraint:** `inventory_ledger_consumption_type_check` enforces the 6 approved types.
- **Files modified:** `inventory.types.ts`, `inventory.actions.ts`, `inventory-form.tsx`.
- **Verified:** all 6 transaction types work, negative stock guard works, ledger writes with `item_id` populated.

## 2026-07-31 — Engineering Audit & Documentation Consolidation
- Full repository and live-database inspection performed (Repository First Policy established for all future engineering work).
- `SECURITY_AUDIT_REPORT.md` / `SECURITY_HOTFIX_PLAN.md` / `SECURITY_HOTFIX_MIGRATION.sql` produced — no production changes applied to the security plan without approval.
- ADR-001 approved: extend existing `roles`/`permissions`/`role_permissions` schema for the Permission Engine rather than building new tables.
- ADR-002 approved: Milestone 3 (Unified Workspace) confirmed as the authoritative roadmap target at that time.
- Documentation consolidated: `MASTER_ROADMAP.md`, `ARCHITECTURE_DECISIONS.md`, `DATABASE_SCHEMA.md`, `PROJECT_HANDOFF.md`, `CHANGELOG.md` created/updated per the consolidation plan.

## 2026-07-30 — Analytics Engine Closed
- Phase 1A (Analytics Engine) formally closed per `CORE_SYSTEM_INDEX.md`.

## 2026-07-29 — Signup Flow Fix, Queue Diagnostics, Queue Schema Fix
- **Migration `20260729120000_add_file_number_to_clinic_patients.sql`:** added `file_number` to `clinic_patients` — root-cause fix for the `/queue` failure.
- **Migration `20260729100000_capture_invoice_items_and_payments.sql`:** added `invoice_items` and `invoice_payments` tables.
- **`create_tenant_with_subscription()` rewritten:** stopped writing to legacy tables and now writes only to `master_tenants` and `clinic_users`.
- **`src/core/auth/actions.ts` updated:** explicitly writes tenant/role metadata after tenant creation.
- **`src/infrastructure/supabase/server.ts` updated:** switched to the dedicated `set_tenant_id()` function.
- **Security fix applied:** corrected `set_tenant_id()` to transaction-local configuration for tenant isolation under pooling.
- **Diagnosed and fully reverted:** temporary debug patch on Queue page.

## 2026-07-21 — Initial Schema Baseline
- **Migration `20260721100539_remote_schema.sql`:** initial committed schema — full multi-tenant table set (patients, agenda, invoicing, queue/visit-sessions, inventory ledger, retention follow-ups, analytics snapshots, subscription/billing/platform tables, permissions/roles/role_permissions, audit trail), 34 RLS policies, and core Postgres functions.
- **Migration `20260721112514_remote_schema.sql`:** same-day constraint refresh for core tables and allowed enum values.
