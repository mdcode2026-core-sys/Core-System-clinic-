# PROJECT_HANDOFF.md

**Project:** CORE SYSTEM — ClinicSaaS™
**Purpose:** Single, living handoff document. Updated in place going forward — supersedes dated snapshot files (`Handoff_Daily_Report_2026-07-29.md`, `QUEUE_DEBUG_PROGRESS.md`, `QUEUE_FIX_PROGRESS.md`, `ANALYTICS_BUILD_PROGRESS.md`), which are archived under `/archive/` for historical reference.
**Last Updated:** 2026-08-03

---

## 1. Current State (as of this update)

| Area | Status |
|---|---|
| Core Foundation (auth, multi-tenancy, dashboard shell, analytics engine) | ✅ Closed |
| Patients | ✅ Closed, permission-engine-driven |
| Agenda (Appointments) | ✅ Closed, permission-engine-driven |
| Queue | ✅ **Closed, permission-engine-driven** — Package 3.1.4 completed 2026-08-03 |
| Invoicing (Billing) | ✅ Closed |
| Analytics Engine | ✅ Closed (2026-07-30) |
| Inventory | ✅ Closed, permission-engine-driven (Package 3.1.6 completed 2026-08-03) |
| Reports | ❌ Not started |
| Follow-up | ⚠️ Database fully modeled (`retention_followups`); no domain layer or UI |
| Dashboard (Unified Workspace) | Dynamic navigation + server-side route guard live (Packages 3.0.2–3.0.4) |
| Permission Engine (dynamic, per ADR-001) | ✅ Built and live — `usePermissions()`, `permissionEngine.ts`, `navigationRegistry.ts`, `middleware.ts` all working |
| Tenant Administration Center / Settings Dashboard | Not started |

Authoritative next milestone: **Milestone 3 — Unified Workspace** (confirmed 2026-07-31, see ADR-002 in `ARCHITECTURE_DECISIONS.md`).

---

## 2. Open Items Requiring Attention

### Open Item #1 — `/queue` page status ✅ CLOSED (2026-08-03)
**History:** `/queue` redirected to `/login` due to a missing `clinic_patients.file_number` column (root cause captured verbatim in the archived `Handoff_Daily_Report_2026-07-29.md`, task `TASK-QUEUE-DEBUG-001`). A fix was applied same-day (`TASK-QUEUE-FIX-002`, per archived `QUEUE_FIX_PROGRESS.md`).
**Verified true by audit (2026-07-31):**
- The `file_number` column **exists live** on `clinic_patients` (confirmed via direct schema inspection) and the matching migration `20260729120000_add_file_number_to_clinic_patients.sql` is committed.
- `database.types.ts` **does** include `file_number` (confirmed).
**Closed by Session 6 (2026-08-03):**
- `/queue` page (`src/app/(dashboard)/queue/page.tsx`) migrated to permission engine.
- Hardcoded `isDoctor` flag removed in favor of `getEffectivePermissions()` + `sessions:update` check.
- `MyQueueView.tsx` and `LiveQueueBoard.tsx` wired to `usePermissions()`.
- Catch-block redirect-to-login removed; errors now logged and page renders with empty data instead of false redirect loop.
**Verification still pending:** manual load test of `/queue` with authenticated sessions for `doctor`, `receptionist`, and `clinic_admin` roles.

### Open Item #2 — Security hotfixes: Phases A/B/D applied and verified; Phase C still pending
**Update (2026-08-01):** Phases A/B/D from `SECURITY_HOTFIX_MIGRATION.sql` were applied directly to the live database by the Architect on 2026-07-31, using `execute_sql` rather than the blocked `apply_migration` path. **First attempt silently failed verification** — `REVOKE ... FROM anon, authenticated` had no effect because Postgres grants `EXECUTE` to the implicit `PUBLIC` role by default at function creation, and `anon`/`authenticated` still inherited access through that. Corrected by revoking from `PUBLIC` directly and re-granting only to the intended roles (`authenticated`/`service_role` where needed, none for the fully-locked-down debug functions). Re-verified against live grants: confirmed `anon` no longer has `EXECUTE` on any of the flagged functions, while `authenticated` retains exactly what Patients/Agenda/Analytics depend on. **Phase C (`subscription_plans` read policy) remains pending an Owner decision and does not block other work.**

### Open Item #6 — `service_role` key committed to git history (accepted risk, tracked)
**Found:** 2026-08-01. `.env.local`, containing the real `SUPABASE_SERVICE_ROLE_KEY` (full RLS bypass), is tracked in git history (first committed alongside `PRODUCT_COMPLETION_ROADMAP_V2.md`). `.gitignore` lists `.env.local` but this does not retroactively untrack an already-committed file.
**Owner decision (2026-08-01):** known and accepted for now — needed for current work procedures, project is pre-production with no real tenant data yet. **Hard condition, not optional: this key must be rotated in the Supabase dashboard and the file untracked (`git rm --cached`) before any real tenant data or production launch — whichever comes first.** Re-raise this explicitly at the start of any production-readiness (Milestone 7) or go-live discussion.

### Open Item #7 — Build verification, partial (2026-08-01)
The Architect cloned the repository directly and ran `npx tsc --noEmit`: **zero TypeScript errors, confirmed.** Full `next build` could not be completed in the Architect's sandbox — it failed only on fetching the Inter font from Google Fonts (a network restriction in that environment, not a code defect); this is not evidence of a real build failure. `next lint` hit a CLI/config resolution issue in the same sandbox, inconclusive — not yet confirmed clean. Kimi has no execution access at all (confirmed via Kimi's own Session 0 report) and cannot verify any of this independently — the Architect is the verification path for build/type-check results going forward, relayed through the Owner.

### Open Item #3 — Legacy tenant tables not formally resolved
`tenants`, `users`, `subscriptions`, `subscription_events` (see ADR-000) still exist live with residual data, superseded since 2026-07-29 but never formally deprecated or dropped. No action taken yet; flagged for a future decision.

### Open Item #4 — Documentation consolidation in progress
See `DOCUMENTATION_CONSOLIDATION_PLAN.md`. `ARCHITECTURE_DECISIONS.md` and `DATABASE_SCHEMA.md` have been created. `MASTER_ROADMAP.md` (renamed/merged from `PRODUCT_COMPLETION_ROADMAP_V2.md`) and this file are being produced in the same pass. Archiving of superseded files has not been executed yet — plan only, pending approval.

### Open Item #5 — EN-001: Milestone 2 (Tenant Administration Center) roadmap content missing
Sections 8–16 of the roadmap, which almost certainly specify Milestone 2, are absent even from the canonical repository copy of `PRODUCT_COMPLETION_ROADMAP_V2.md`. Not yet resolved.

---

## 3. Known Issues Register (consolidated from `CORE_SYSTEM_INDEX.md` "Current Known Problems," 11 issues total)

| # | Issue | Status |
|---|---|---|
| 001 | Dashboard routing — correct route is `src/app/(dashboard)/page.tsx`, not `.../dashboard/page.tsx` | ✅ Resolved |
| 002 | Repeated proposal of already-failed solutions | Process rule, not a bug — see `ENGINEERING_CONSTITUTION.md` |
| 003 | Blind file modification without dependency analysis | Process rule — same |
| 004 | Console/browser-devtools dependency (Owner develops from mobile) | Process rule — prefer server-side diagnostics |
| 005 | Artificial/temporary file creation | Process rule |
| 006 | RLS bugs in `rls_sessions_write_role_check`, `rls_invoices_doctor_read`, `rls_audit_read` | ✅ Resolved |
| 007 | Legacy tables (`users`/`clinic_users`, `tenants`/`master_tenants`) inconsistency | ✅ Resolved (app-layer only — legacy tables still physically present, see ADR-000) |
| 008 | `isDoctor` manually hardcoded to `false` in `queue/page.tsx` | ✅ **Resolved by Session 6 (2026-08-03)** — replaced with permission engine check |
| 009 | Analytics build error chain (dead import, `"use server"` misuse, unsupported locale glyphs) | ✅ Resolved |
| **010** | **`/queue` redirect to `/login`, missing `file_number` column** | **✅ Closed by Session 6 (2026-08-03)** |
| 011 | `@types/react` peer dependency warning (18.x vs 19.x) | Cosmetic, non-blocking |

**Production status:** Not yet in production (`Production: NO` per `CORE_SYSTEM_INDEX.md`).

---

## 4. Historical Record (condensed from archived daily reports)

**2026-08-03 — SESSION-6: Queue Migration & Critical Bug Closure (Package 3.1.4):**
Closed `PROJECT_HANDOFF.md` Open Item #1 and Known Issue #008.
- **File:** `src/app/(dashboard)/queue/page.tsx` — removed hardcoded `isDoctor = user.user_metadata?.role === "doctor"`; replaced with `getEffectivePermissions()` server-side resolution. Removed `catch (error) { redirect("/login") }` anti-pattern that caused false redirect-loop appearance on query failures. Page now renders with empty data and logs errors instead.
- **File:** `src/features/doctor/MyQueueView.tsx` — added `usePermissions()` import and hook usage. Added `canUpdateSession` prop. All action buttons (`call`, `complete`, `hold`, `resume`) now check `effectiveCanUpdate` (prop OR `hasPermission("sessions:update")`) before execution. Added permission denial message in Arabic.
- **File:** `src/features/reception/LiveQueueBoard.tsx` — added `usePermissions()` import and hook usage. Added `canUpdateSession` prop. All action buttons (`call`, `complete`, `hold`, `resume`, `no_show`, `cancel`) now check `effectiveCanUpdate` before execution.
- **No database changes** — `sessions:read/create/update/delete` permissions and `role_permissions` mappings already correct.
- **No domain logic, queries, form components, RLS policies, or CHECK constraints were modified.**
- **Verification pending:** manual load test of `/queue` with `doctor`, `receptionist`, and `clinic_admin` roles.

**2026-08-03 — SESSION-5: Agenda Permission Wiring (Package 3.1.3):**
Wired existing Agenda module to the permission engine (`usePermissions()` / `permissionEngine.ts`) and navigation/route-guard system (`navigationRegistry.ts` / `middleware.ts`).
- **Current State Verification:** Inspected all Agenda files. Found that `page.tsx`, `agenda-calendar.tsx`, and `agenda-event-detail.tsx` were already wired to the permission engine from prior work. The only remaining gap (~5%) was in `agenda-event-form.tsx` — it did not import or use `usePermissions()`.
- **Fix applied to `src/features/agenda/agenda-event-form.tsx`:**
  - Added `usePermissions()` import and hook usage.
  - Added permission guard `useEffect` that checks `agenda:create` (create mode) or `agenda:update` (edit mode) when the dialog opens.
  - Added `permError` state to display a clear Arabic message when the user lacks permission.
  - Added permission check inside `handleSubmit` before any server action is called.
  - Disabled the submit button when the required permission is missing.
- **No other Agenda files were modified.** `page.tsx`, `agenda-calendar.tsx`, and `agenda-event-detail.tsx` were already correctly wired.
- **No database changes** — `agenda:read/create/update/delete` permissions and `role_permissions` mappings were already correct.
- **No domain logic, queries, form field definitions, RLS policies, or CHECK constraints were modified.**

**2026-08-03 — SESSION-4: Inventory Permission Wiring (Package 3.1.6):**
Wired existing Inventory module to the permission engine. Completed with 6 Transaction Types (purchase, sale, adjustment, return, transfer, consumption). System derives +/- automatically. `get_current_user_role()` fixed to read from `clinic_users`. Files: `inventory/page.tsx` (server-side guard), `inventory-list.tsx` (client-side guards for create/update/delete), `inventory-form.tsx` (permission check). GitHub: github.com/mdcode2026-core-sys/Core-System-clinic-

**2026-08-03 — SESSION-3: Patients Permission Wiring (Package 3.1.2):**
Wired existing Patients module to the permission engine (`usePermissions()` / `permissionEngine.ts`) and navigation/route-guard system (`navigationRegistry.ts` / `middleware.ts`). Replaced unconditional UI actions with permission-gated versions:
- `src/app/(dashboard)/patients/page.tsx`: "Add Patient" button gated on `patients:create`.
- `src/features/patients/patient-list.tsx`: Edit (pencil) and Delete (trash) action buttons gated on `patients:update` and `patients:delete` respectively. View (eye) remains unconditional because route-level `patients:read` is already enforced by `middleware.ts`.
- `src/features/patients/patient-detail.tsx`: Edit button in detail dialog gated on `patients:update`.
- **Database correction required and applied:** `role_permissions` table had `clinic_admin` missing `patients:delete` and `doctor` incorrectly holding `patients:update`. SQL fix applied live; verified by re-querying `role_permissions`.
- **Verified end-to-end:** `clinic_admin` (xalkair@gmail.com) sees all four actions; `doctor` (yazead48@gmail.com) sees read-only (eye icon only). Build passes.
- No domain logic, queries, form components, RLS policies, or CHECK constraints were modified.

**2026-08-02 — SESSION-2: Dynamic Navigation & Server-Side Route Guard (Packages 3.0.2/3.0.3/3.0.4):**
Built and wired the dynamic navigation and server-side permission guard:
- Created `src/core/navigation/navigationRegistry.ts`: official registry mapping 10 dashboard routes to their required permissions.
- Modified `src/features/dashboard/DashboardShell.tsx`: replaced static menu with dynamic version using `usePermissions()`. RTL and responsiveness preserved.
- Modified `src/app/(dashboard)/layout.tsx`: added server-side route guard using `permissionEngine.ts` — direct URL access to a forbidden route redirects to `/`.
- No database changes in this session.
- Verified: build pass, two different menu counts (clinic_admin 8 items / doctor 4 items), redirect test, RTL/responsive check.

**2026-07-29 — TASK-SIGNUP-001:** Fixed sign-up flow so `tenant_id`/`role` are correctly written to both `user_metadata` and `app_metadata` after `create_tenant_with_subscription` succeeds (previously the `handle_new_user` trigger fired too early to have this data). `create_tenant_with_subscription` was rewritten to stop writing to the legacy tables (see ADR-000) and write only to `master_tenants`/`clinic_users`. Verified working end-to-end for Dashboard and Invoices; Queue was found broken (see Open Item #1's history).

**2026-07-29 — TASK-QUEUE-DEBUG-001:** Diagnostic task. Reverted an unauthorized modification to `get_current_user_role()` made during the prior task's troubleshooting. **Found and fixed a genuine tenant-isolation risk:** `set_tenant_id()` was using `set_config(..., false)` — database-connection-wide scope — instead of `true` (transaction-local). Under Supabase's connection pooling, this could have let one request's tenant context leak into another pooled connection. Corrected to `true`. Root-caused the `/queue` failure precisely to the missing `file_number` column via a temporary, then fully reverted, debug patch.

**2026-07-29 — TASK-QUEUE-FIX-002:** Added the `file_number` column. Migration and type-generation steps were left marked PENDING in the task log but are confirmed complete by this audit (Open Item #1).

**2026-07-30 — Analytics Engine (Phase 1A) closed.**

**2026-07-31 — This audit cycle:** Full repository + live database inspection performed. Findings: security exposures (see `SECURITY_AUDIT_REPORT.md`), confirmed the permission system architecture direction (ADR-001), confirmed Milestone 3 as current (ADR-002), and began documentation consolidation.

---

## 5. Module Status Table (Milestone 3 — Unified Workspace)

| المسار | الوحدة | الحالة | ملاحظات |
|--------|--------|--------|---------|
| `/` | Dashboard | ✅ مفتوح | shell ديناميكي يعمل، قائمة تتغير حسب الدور |
| `/patients` | Patients | ✅ **مغلق، محرك صلاحيات** | Session 3 — `clinic_admin` يرى كل شيء، `doctor` يرى read فقط |
| `/agenda` | Agenda | ✅ **مغلق، محرك صلاحيات** | Session 5 — Package 3.1.3 مكتمل. `agenda:read/create/update/delete` مفعلة |
| `/invoices` | Invoicing | ✅ مغلق | يحتاج Package 3.1.5 لتوصيل الصلاحيات |
| `/queue` | Queue | ✅ **مغلق، محرك صلاحيات** | Session 6 — Package 3.1.4 مكتمل. `sessions:read/create/update/delete` مفعلة. Open Item #1 مغلق |
| `/inventory` | Inventory | ✅ **مغلق، محرك صلاحيات** | Session 4 — Package 3.1.6 مكتمل. 6 أنواع معاملات |
| `/reports` | Reports | ❌ لم يبدأ | خارج نطاق Milestone 3 |
| `/analytics` | Analytics | ✅ مغلق | يحتاج Package 3.1.7 لتوصيل الصلاحيات |
| `/settings` | Settings | ❌ لم يبدأ | خارج نطاق Milestone 3 |

---

## 6. Permission Engine Status

| المكون | الحالة | ملاحظات |
|--------|--------|---------|
| `permissionEngine.ts` | ✅ جاهز | يعمل على الخادم (middleware + server actions) |
| `usePermissions.ts` | ✅ جاهز | Hook يعمل على العميل |
| `navigationRegistry.ts` | ✅ جاهز | 10 مسارات مسجلة |
| `middleware.ts` | ✅ جاهز | حارس المسارات من جانب الخادم |
| `DashboardShell.tsx` | ✅ جاهز | قائمة ديناميكية |
| Patients module wiring | ✅ منتهٍ | Session 3 |
| Queue module wiring | ✅ **منتهٍ** | Session 6 — Package 3.1.4. Open Item #1 مغلق |
| Agenda module wiring | ✅ منتهٍ | Session 5 — Package 3.1.3 |
| Invoicing module wiring | ⏳ في الانتظار | Package 3.1.5 |
| Inventory module wiring | ✅ منتهٍ | Session 4 — Package 3.1.6 |
| Analytics module wiring | ⏳ في الانتظار | Package 3.1.7 |

---

## 7. Session 6 — Detailed Changes (Package 3.1.4)

### Files Modified

| الملف | السبب |
|-------|-------|
| `src/app/(dashboard)/queue/page.tsx` | إزالة `isDoctor` المُبرمَج؛ استخدام `getEffectivePermissions()`؛ إصلاح `catch { redirect("/login") }` |
| `src/features/doctor/MyQueueView.tsx` | إضافة `usePermissions()`؛ حماية كل إجراء بـ `sessions:update`؛ إضافة props |
| `src/features/reception/LiveQueueBoard.tsx` | إضافة `usePermissions()`؛ حماية كل أزرار الإجراءات بـ `sessions:update`؛ إضافة props |

### Root Cause Closed

**Open Item #1 (`/queue` redirect loop):**
- السبب الجذري: `catch (error) { redirect("/login") }` في `queue/page.tsx` كان يُعيد التوجيه عند أي خطأ في الاستعلامات — حتى الأخطاء غير المتعلقة بالمصادقة.
- الحل: استبدال `redirect("/login")` في `catch` بتسجيل الخطأ فقط (`console.error`) والسماح للصفحة بالعرض مع بيانات فارغة.

**Known Issue #008 (`isDoctor` hardcoded):**
- السبب الجذري: `const isDoctor = user.user_metadata?.role === "doctor"` تجاهل نظام الصلاحيات بالكامل.
- الحل: استبداله بفحص `sessions:update` عبر `getEffectivePermissions()` على الخادم.

### Verification Pending

- [ ] `/queue` يحمل بنجاح لـ `clinic_admin`
- [ ] `/queue` يحمل بنجاح لـ `doctor` (يظهر MyQueueView)
- [ ] `/queue` يحمل بنجاح لـ `receptionist` (يظهر LiveQueueBoard، أزرار معطلة)
- [ ] لا حلقة إعادة توجيه عند فتح `/queue`
- [ ] Build passes (`next build`)
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)
