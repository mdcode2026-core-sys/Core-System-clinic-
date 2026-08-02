# CHANGELOG.md

Reconstructed baseline as of 2026-07-31 from committed migration files and archived handoff records. Maintained going forward per change — not regenerated from scratch each time.

---

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
- **`create_tenant_with_subscription()` rewritten:** stopped writing to legacy tables (`tenants`, `users`, `subscriptions`, `subscription_events`, `roles`, `subscription_plans`); now writes only to `master_tenants` and `clinic_users` (see `ARCHITECTURE_DECISIONS.md` ADR-000).
- **`src/core/auth/actions.ts` updated:** explicitly writes `tenant_id`/`role` into both `user_metadata` and `app_metadata` after tenant creation, since the `handle_new_user` trigger fires before the `clinic_users` row exists.
- **`src/infrastructure/supabase/server.ts` updated:** switched from a raw `set_config` RPC call to the dedicated `set_tenant_id()` function.
- **Security fix applied:** `set_tenant_id()` was found using database-connection-wide config scope (`set_config(..., false)`) instead of transaction-local (`true`) — a genuine tenant-isolation risk under connection pooling. Corrected to `true`.
- **Diagnosed and fully reverted:** temporary debug patch on `src/app/(dashboard)/queue/page.tsx` used to capture the exact `/queue` error, then cleanly reverted.

## 2026-07-21 — Initial Schema Baseline
- **Migration `20260721100539_remote_schema.sql`:** initial committed schema — full multi-tenant table set (patients, agenda, invoicing, queue/visit-sessions, inventory ledger, retention follow-ups, analytics snapshots, subscription/billing/platform tables, permissions/roles/role_permissions, audit trail), 34 RLS policies, and all core Postgres functions (`get_current_tenant_id`, `get_current_user_role`, `create_tenant_with_subscription`, `handle_new_user`, invoicing business logic, trigger helpers).
- **Migration `20260721112514_remote_schema.sql`:** same-day constraint refresh — dropped and re-added several `CHECK` constraints (`billing_events`, `clinic_inquiries`, `clinic_invoices`, `clinic_patients`, `clinic_rooms`, `clinic_users`) to update allowed enum values.

---

## Format Going Forward

Each entry should include: date, short title, and either a migration filename (for schema changes) or a file path (for code changes) plus a one-line reason. Task-level detail belongs in `PROJECT_HANDOFF.md`, not here — this file stays a scannable timeline.

# CHANGELOG.md

Reconstructed baseline as of 2026-07-31 from committed migration files and archived handoff records. Maintained going forward per change — not regenerated from scratch each time.

---

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
- **`create_tenant_with_subscription()` rewritten:** stopped writing to legacy tables (`tenants`, `users`, `subscriptions`, `subscription_events`, `roles`, `subscription_plans`); now writes only to `master_tenants` and `clinic_users` (see `ARCHITECTURE_DECISIONS.md` ADR-000).
- **`src/core/auth/actions.ts` updated:** explicitly writes `tenant_id`/`role` into both `user_metadata` and `app_metadata` after tenant creation, since the `handle_new_user` trigger fires before the `clinic_users` row exists.
- **`src/infrastructure/supabase/server.ts` updated:** switched from a raw `set_config` RPC call to the dedicated `set_tenant_id()` function.
- **Security fix applied:** `set_tenant_id()` was found using database-connection-wide config scope (`set_config(..., false)`) instead of transaction-local (`true`) — a genuine tenant-isolation risk under connection pooling. Corrected to `true`.
- **Diagnosed and fully reverted:** temporary debug patch on `src/app/(dashboard)/queue/page.tsx` used to capture the exact `/queue` error, then cleanly reverted.

## 2026-07-21 — Initial Schema Baseline
- **Migration `20260721100539_remote_schema.sql`:** initial committed schema — full multi-tenant table set (patients, agenda, invoicing, queue/visit-sessions, inventory ledger, retention follow-ups, analytics snapshots, subscription/billing/platform tables, permissions/roles/role_permissions, audit trail), 34 RLS policies, and all core Postgres functions (`get_current_tenant_id`, `get_current_user_role`, `create_tenant_with_subscription`, `handle_new_user`, invoicing business logic, trigger helpers).
- **Migration `20260721112514_remote_schema.sql`:** same-day constraint refresh — dropped and re-added several `CHECK` constraints (`billing_events`, `clinic_inquiries`, `clinic_invoices`, `clinic_patients`, `clinic_rooms`, `clinic_users`) to update allowed enum values.

---

## Format Going Forward

Each entry should include: date, short title, and either a migration filename (for schema changes) or a file path (for code changes) plus a one-line reason. Task-level detail belongs in `PROJECT_HANDOFF.md`, not here — this file stays a scannable timeline.

## 2026-08-02 — التنقل الديناميكي والتحقق من الصدفة (حزم 3.0.2/3.0.3/3.0.4)
- **إنشاء `src/core/navigation/navigationRegistry.ts`:** السجل الرسمي لربط 10 مسارات لوحة التحكم بصلاحياتها.
- **تعديل `src/features/dashboard/DashboardShell.tsx`:** استبدال القائمة الثابتة بنسخة ديناميكية باستخدام `usePermissions()`. الحفاظ على RTL والتجاوب.
- **تعديل `src/app/(dashboard)/layout.tsx`:** إضافة حارس المسارات من جانب الخادم باستخدام `permissionEngine.ts` — الدخول المباشر على رابط ممنوع يُعاد توجيهه إلى `/`.
- **لا تغييرات على قاعدة البيانات** في هذه الجلسة.
- **التحقق معلق:** نجاح البناء، اختبار قائمتين مختلفتين، اختبار إعادة التوجيه، فحص RTL/تجاوب.

## 2026-08-03 — Inventory Module Architecture Correction (Package 3.1.6 Rev 2)
- **Migration `20260804000001_inventory_transaction_types.sql`:** replaced generic consumption_type with 6 approved Transaction Types (purchase, purchase_return, doctor_request, unused_return, inventory_adjustment_increase, inventory_adjustment_decrease).
- **Transaction Type system:** user selects type only; system derives (+/-) stock effect automatically. No manual (+/-) input.
- **Fixed `get_current_user_role()`:** now reads from `clinic_users` table instead of non-existent JWT claim `user_role`.
- **Updated CHECK constraint:** `inventory_ledger_consumption_type_check` enforces 6 approved types only.
- **Files modified:** `inventory.types.ts`, `inventory.actions.ts`, `inventory-form.tsx`.
- **Verified:** all 6 transaction types work, negative stock guard works, ledger writes with `item_id` populated.
