# DATABASE_SCHEMA.md

**Source:** Generated directly from the live Supabase project `core-system-clinic` (`qaslsjyxjwvdoiczmhgq`) via direct schema inspection — not from the ad-hoc CSV export it replaces (`supabase Data info.md`, now archived).
**Date:** 2026-08-04
**Note:** Row counts reflect the audit snapshot moment and will change; this document should be regenerated periodically, not hand-edited for data changes — only for structural (DDL) changes.

---

## 1. Active Tenant & User Model

### `master_tenants` (4 rows) — **the active tenant table**
Clinic-level record: `clinic_name` (+ `_ar`), `license_key` (unique), `subscription_tier` (`trial`/`essential`/`professional`/`enterprise`/`suspended`), `max_devices`, `subscription_start/end`, `trial_started_at`, `timezone`, `currency` (+ `currency_subunit` for integer-based money math), branding fields (`logo_url`, `primary_color`), contact fields, `country_code`, `is_active`, soft-delete via `deleted_at`. Referenced by nearly every other tenant-scoped table (21 inbound FKs).

### `clinic_users` (3 rows) — **the active user table**
`tenant_id` → master_tenants, `full_name` (+`_ar`), **`role`** (varchar, `CHECK` constrained to exactly `super_admin | clinic_admin | doctor | receptionist`), `specialization`, `employee_code`, `pin_code`, `phone`, `email`, `is_active`, `last_login_at`, `auth_user_id` → `auth.users.id`, soft-delete via `deleted_at`.
**Note:** the `role` CHECK constraint is the hard limit referenced in ADR-001 — it does not yet include `clinic_owner` or `nurse`, both of which already exist as rows in the `roles` reference table below.

---

## 2. Legacy / Orphaned Tables (REMOVED)

> **Status:** Physically removed from the database on 2026-08-22.
> These tables were part of the original architecture and were fully superseded
> by the canonical `master_tenants` / `clinic_users` architecture per ADR-000.

| Table | Status | Superseded By | Removal Date |
|---|---|---|---|
| `tenants` | **DROPPED** | `master_tenants` | 2026-08-22 |
| `users` | **DROPPED** | `clinic_users` | 2026-08-22 |

**Rationale:**
- `tenants` was replaced by `master_tenants` to support the unified tenant model.
- `users` was replaced by `clinic_users` to unify user identity under the clinic domain
  with `auth_user_id` linkage to Supabase Auth.
- All runtime code, RLS policies, FK constraints, and application logic were migrated
  to the canonical architecture before removal.
- Zero active repository dependencies remain on these tables.

## 3. Permission System (see ADR-001 — reused, not replaced)

| Table | Rows | Purpose |
|---|---|---|
| `roles` | **6** (seeded: `super_admin`, `clinic_admin`, `clinic_owner`, `doctor`, `nurse`, `receptionist`) | Becomes the System/Custom Permission Template registry. `is_system_role` (bool) already distinguishes default vs. tenant-defined. Not tenant-scoped (no `tenant_id` column) — global catalog, tenant-specific custom templates would need a `tenant_id` column added when that capability is built. |
| `permissions` | 0 (empty — never populated) | `permission_key`, `permission_name`, `resource`, `action` — the master permission-key catalog. Existing app code uses a different in-code format (`resource:action`, e.g. `patients:read`) in `src/core/permissions/types.ts` — reconcile naming before populating. |
| `role_permissions` | ~~0 (empty — never populated)~~ **89 (populated as of 2026-08-08 — verified live query, this doc was stale)** | Join table: `role_id` → `roles.id`, `permission_id` → `permissions.id`. This is the template-to-permission mapping. |

All three already have permissive `SELECT` RLS policies (`USING (true)`) — readable by any role today. No `INSERT`/`UPDATE`/`DELETE` policy exists yet for any of them.

**Application-layer permission system (currently separate, not wired to the above):** `src/core/permissions/types.ts` defines a hardcoded `UserRole` union and a `Permission` union (`patients:read`, `sessions:create`, `agenda:update`, `invoices:read`, `inventory:create`, `analytics:read`, `users:delete`, `settings:update`, `audit:read`, etc.), consumed by a static `permissionMatrix.ts` and enforced client-side only via `PermissionGuard.tsx`. Note: this in-code catalog already anticipates `sessions:**`, `inventory:**`, and `settings:**` permissions the current RLS/route layer doesn't yet enforce server-side.

---

## 4. Clinical Operations

### `clinic_patients` (3 rows)
Core patient record: name (+`_ar`), `date_of_birth`, `gender` (male/female), phone/email, `preferred_channel` (whatsapp/sms/email), `first_visit_date`, `referral_source`, `patient_status` (active/inactive/vip/blocked), `notes`, soft-delete, and **`file_number`** (added 2026-07-29, confirmed present — see `CHANGELOG.md`).

### `patient_history` (0 rows)
Rollup/aggregate per patient: visit counts, no-show/cancellation counts, revenue total, `loyalty_tier` (standard/silver/gold/vip), last/next visit dates. Appears to be a maintained summary table (likely trigger- or job-updated), not raw transactional data.

### `master_agenda_events` ("Appointments" in the roadmap, 0 rows)
Scheduling record: patient/doctor/room/procedure/inquiry references, `scheduled_start/end`, `buffer_end`, `event_type` (appointment/block/break/emergency), `visit_type`, `status` (scheduled → confirmed → arrived → in_session → completed / no_show / cancelled / rescheduled), `cancellation_reason`, reminder-sent flags.

### `clinic_visit_sessions` ("Queue" in the roadmap, 0 rows)
This is broader than a simple queue — it merges queue state, clinical documentation, and follow-up triggering in one entity: `session_status` (waiting → in_consultation → pending_close → completed/cancelled), timestamps for each stage, room/lock-holder tracking (for concurrent access), `doctor_notes`/`clinical_notes`/`diagnosis`/`treatment_performed`, `follow_up_required` + `follow_up_date`, `patient_satisfaction_score` (1–5), `buffer_window_expires_at`/`auto_close_at`. **Any roadmap plan that treats Queue as a simple check-in/out list should account for this richer existing shape.**

### `clinic_inquiries` (0 rows)
Pre-visit intake: walk-in/appointment/callback/online, links to a patient or a temporary name/phone if not yet a patient, `status` (pending/converted_to_session/cancelled/rescheduled/no_show).

### `clinic_rooms` (0 rows), `clinic_procedures` (0 rows)
Reference data for scheduling (room type/capacity) and service catalog (procedure name, duration, buffer time, base price, tax rate).

---

## 5. Billing ("Invoicing" in code)

### `clinic_invoices` (0 rows)
`subtotal/discount/tax/total/amount_paid_subunits` (integer subunits, not floats), `amount_due_subunits` is a **generated column** (`total - paid`), `payment_method` (cash/card/bank_transfer/installment/mixed), `invoice_status` (draft/issued/paid/partial/cancelled/refunded), `payment_terms` (cash/credit/installment), `discount_approved_by` → clinic_users (approval trail for discounts).

### `invoice_items` (0 rows)
Line items: quantity, `unit_price_subunits`, `discount_subunits`, `tax_subunits`, `tax_rate_percent` (default 16.00), `line_total_subunits` is **generated**.

### `invoice_payments` (0 rows)
Payment records: `amount_subunits`, `payment_method` (cash/card/bank_transfer/insurance/online/other), `transaction_id`, `collected_by` → clinic_users.

**No refund-specific table exists** — refunds appear to be handled via `invoice_status = 'refunded'` rather than a separate `refunds` table. Confirm this before building a Billing execution plan that assumes a dedicated refund entity.

---

## 6. Inventory

### `inventory_items` (NEW in Package 3.1.6)
Product catalog + live stock level per tenant. RLS: 3 policies (read/insert/update). Indexes: PK, tenant_id, low_stock composite.

### `inventory_ledger` (0 rows)
Transaction log with 6 approved Transaction Types:
- `purchase` (+), `purchase_return` (-), `doctor_request` (-)
- `unused_return` (+), `inventory_adjustment_increase` (+), `inventory_adjustment_decrease` (-)
CHECK constraint: `inventory_ledger_consumption_type_check` enforces these 6 types only.
`item_id → inventory_items` (added 2026-08-03) linking ledger to catalog.
`material_name`, `quantity_consumed`, `consumption_type`, `logged_by`, optional `session_id`.

---

## 7. Retention / Follow-up

### `retention_followups` (0 rows)
Already fully modeled: `followup_type` (post_visit_24h/7d, reactivation_30d/60d/90d, appointment_reminder_24h/2h, birthday, custom), `channel` (whatsapp/sms/email/in_app), `message_body`, `delivery_status` (pending/sent/delivered/read/failed/cancelled), `response_received`. This is considerably more built-out at the schema level than the roadmap's minimal initial scope (list/scheduled/status) — no domain layer or UI exists yet to use it.

---

## 8. Analytics

### `analytics_daily_snapshots` (0 rows)
Pre-aggregated daily rollup per tenant: visit counts, new/returning patients, no-shows, cancellations, average wait/session duration, revenue, discounts, `hot_leads_count`, `conversion_rate`, `snapshot_metadata` (jsonb, extensible).

---

## 9. Platform / Subscription (Milestone 5 territory — Super Admin Platform)

| Table | Rows | Purpose |
|---|---|---|
| `subscription_plans` | 4 | Plan catalog (`max_users/devices/branches`, `modules` jsonb, `ai_limits` jsonb, `storage_gb`, `api_rate_limit`). **RLS enabled, zero policies — currently unreadable by anyone. See SECURITY_AUDIT_REPORT SEC-007.** |
| `feature_flags` | 5 → 11 after seed (2026-08-04) → **13 after seed** (2026-08-08) | `flag_key`, `is_enabled`, `allowed_tiers` (array, e.g. `{enterprise}`), `config_json`. Can be tenant-specific (`tenant_id` nullable) or global. **Now actively used by `isFeatureEnabled()` in `src/core/features/featureRegistry.ts` (Package 3.1.7).** Seed data: 8 globally-enabled module flags (`patients`, `agenda`, `queue`, `billing`, `inventory`, `followup` — 2026-08-04; `analytics`, `reports` added 2026-08-08 during Session 11 Recovery, per `WORKSPACE_ARCHITECTURE_SPECIFICATION.md` §9 — see `supabase/migrations/20260808_seed_analytics_reports_feature_flags.sql`). |
| `billing_events` | 0 | Audit trail of subscription lifecycle events (trial_started, upgraded, tier_override_by_admin, etc.), separate from `audit_trail`. |
| `tenant_devices` | 0 | Device registration/fingerprinting per tenant, ties to `master_tenants.max_devices` limit enforcement. |

---

## 10. Cross-Cutting

### `audit_trail` (0 rows) — **use this, do not create a new audit table**
`tenant_id`, `actor_id` → clinic_users, `actor_role`, `action`, `table_name`, `record_id`, `old_values`/`new_values` (jsonb), `reason`, `ip_address`.

### `notification_queue` (0 rows)
Outbound message queue: recipient type/id/phone/email, `channel`, `priority` (1–10), `status` (queued/processing/sent/failed/cancelled), retry tracking. Likely the intended delivery mechanism behind `retention_followups`.

---

## 11. RLS Summary

- **34 policies** exist across the schema, driven by `get_current_tenant_id()` and `get_current_user_role()` (both JWT-based, with a `current_setting` fallback for Server Actions — see `set_tenant_id()`).
- Every table listed above has RLS **enabled**. The one confirmed gap is `subscription_plans` (enabled, zero policies — see security audit).
- `roles`, `permissions`, `role_permissions` have open `SELECT` policies (`USING (true)`) already in place, no write policies yet.

## 12. Planned Schema Additions (approved architecture, not yet built — see `ARCHITECTURE_DECISIONS.md`)

These do not exist in the live database yet. Listed here so `DATABASE_SCHEMA.md` stays the single reference for both current and approved-but-pending structure, per the frozen 2026-07-31 Product Owner decisions.

**Permission Engine (ADR-001, Milestone 3):** `clinic_user_permission_overrides` — the one new table specified in `IMPLEMENTATION_PACKAGE_MILESTONE_3.md` Package 3.0.1.

**Branch-Ready Architecture (ADR-004):** `branches` (`id`, `tenant_id → master_tenants`, `branch_name`/`_ar`, `is_default boolean`, `address`, `phone`, `is_active`, soft-delete). One default row per existing and future tenant.

**Subscription / License Engine (ADR-003, Milestone 5):** the `master_tenants.subscription_tier` column needs splitting — plan identity stays here (or moves to a proper FK against `subscription_plans`), a new lifecycle-state column is added (`trial`/`active`/`expiring_soon`/`grace_period`/`suspended`/`reactivated`/`cancelled`, distinct from plan identity). New tables needed: an add-ons catalog and a per-tenant purchased-add-ons table, a per-tenant resource-consumption/usage table, and the License Engine's own resolved-license representation (likely a view or computed table combining Base Plan + Add-ons + Resource Limits + Feature Flags, per ADR-003's formula).

**Medical Master Libraries & Procedure/Service Catalog (ADR-005, Milestone 4):** `medical_specialties` (global, Super-Admin-managed), `procedure_master_library` (global: internal ID, international code, scientific/medical name, description, categories), `procedure_specialty_map` (many-to-many join), `services` (distinct from procedures) and `service_procedures` (many-to-many join). Existing `clinic_procedures` gains a `master_procedure_id → procedure_master_library` foreign key, becoming the clinic-level customization layer (price, duration, assigned doctors, rooms, colors, commercial name) over the master library rather than a flat standalone catalog.

---

## 13. Extensions

`pg_net`, `btree_gist` — both installed in the `public` schema (see SECURITY_AUDIT_REPORT SEC-010 for the relocation recommendation).
