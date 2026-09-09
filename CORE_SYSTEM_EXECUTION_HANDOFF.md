# CORE SYSTEM — EXECUTION HANDOFF

**Date:** 2026-09-09 03:16 Asia/Amman
**Current Phase:** PHASE 4 — Database ↔ Documentation Reconciliation (forensic baseline substantially established)
**Baseline Commit:** `cdedb1937edc44bd93dafdceacfa52e70c19bbbb`
**Current Branch:** `reconciliation/execution-baseline-20260909`
**Production Commit:** `cdedb1937edc44bd93dafdceacfa52e70c19bbbb`

## Resume Basis
`CORE_SYSTEM_EXECUTION_HANDOFF.md` and `CORE_SYSTEM_EXECUTION_LEDGER.md` were not present on `main`. Resume point was therefore reconstructed from GitHub, live Supabase, current repository documentation, CI evidence, and Vercel production state.

## Git Baseline
- `main` points to `cdedb1937edc44bd93dafdceacfa52e70c19bbbb`.
- No open pull requests were found.
- Current remote main has the analytics semantic audit/reconciliation repair commit.
- Local working-tree state could not be independently established because no local clone/network path was available; do not treat local state as known.

## Supabase Baseline
Project: `qaslsjyxjwvdoiczmhgq` (`core-system-clinic`), PostgreSQL 17.6.1.141, eu-central-1.

Latest applied migrations in live `supabase_migrations.schema_migrations`:
- `20260908181547 analytics_snapshot_function_execute_hardening`
- `20260908181516 analytics_snapshot_patient_semantics_correction`
- `20260908181428 analytics_canonical_daily_snapshot_generator`

Supabase branch listing currently exposes only the default/main branch; its branch status is reported `MIGRATIONS_FAILED`, while the preview project is ACTIVE_HEALTHY. No isolated branch is currently available for database repair validation.

## Tenants / Operational Data
Corrected per-domain counts were inspected without Cartesian joins. Principal operational tenant is `Zada Clinic test`:
- 279 patients
- 282 agenda events
- 138 visit sessions
- 138 invoices
- 113 inventory ledger rows
- 6 purchase orders
- 8 workforce employees

Other tenants contain smaller audit/demo populations. Explicit PJ/E2E provenance found in Zada patients: 60 `PJ15_E2E_EXPANDED` and 6 `PJ15_DEMO` records; 213 remaining patients require provenance classification before being called realistic clinic data.

## Proven Causal Consistency
For Zada:
- Completed appointments without visits: 0.
- Non-completed appointments with visits: 0.
- Visit patient mismatch: 0.
- Visit doctor mismatch: 0.
- Invoices without visit procedure: 0.
- Invoice patient mismatch: 0.
- Invoice arithmetic mismatch: 0.
- Payments exceeding invoice total: 0.
- All 138 invoice items correspond to the visit procedure and procedure id.
- Invoice line arithmetic and recorded-payment reconciliation: 138/138 consistent.
- 70 procedure-consumption inventory rows have `source_type=procedure_session` and retain visit/procedure linkage.

## Scenario / Provenance Findings
### Confirmed synthetic/E2E evidence
Zada contains a substantial PJ15 synthetic population. No `STAGE14_E2E_TEST` provenance remains in patient notes.

### Treatment Plan reconciliation finding
`clinic_treatment_plans` has 8 non-deleted headers (3 active, 1 cancelled, 1 completed, 2 draft, 1 on_hold), but `clinic_treatment_plan_items` and `clinic_treatment_plan_visits` both contain 0 rows. This conflicts with the current `PJ_E2E_DEMO_DATASET.md` description of treatment-plan items/stages. This is a documentation↔DB reconciliation finding, not yet a code defect and not yet repaired.

### Procurement finding
One Zada receipt item (`AUDIT-PO-001`, Chemical Peel Solution, quantity 10) has no matching inventory-ledger row for its purchase-receipt source. The linked PO is `ordered` even though its ordered quantity is fully received (10/10). Created/received timestamp is 2026-09-07. This requires provenance classification before any data correction; do not mutate baseline data to normalize it.

### Availability finding — confirmed root cause of current real-world E2E booking failure
Zada has exactly one clinic user with role `doctor` (`Dr. Said Saleh`). The only active provider-availability rows (Mon–Fri, 09:00–17:00, valid from 2026-09-01) point to user id `a4e1f8cf-0323-4ac2-80dd-301234c9050b`, which maps to employee `Lina Demo` whose clinic role is `receptionist`. Therefore the canonical doctor has no availability while a receptionist owns the provider-availability records.

The real-world E2E then attempts 14:00–17:00 slots, receives `AGENDA_UNAVAILABLE | Requested time is outside provider working hours` for the only doctor, and then fails because no second doctor option exists. The test is therefore exposing a baseline data integrity mismatch, not merely a UI issue.

## Analytics Baseline
`analytics_daily_snapshots` has 259 non-deleted rows across all 5 tenants, with no duplicate tenant/date pairs. Zada has daily snapshots from 2026-01-01 through 2026-09-08. Recent zero snapshots correspond to dates after the historical completed/cancelled/no-show activity window; full raw-to-snapshot date-level reconciliation remains in progress.

## Security / Engineering Finding — HIGH PRIORITY
Live Supabase exposes **two overloads** of `public.adjust_inventory_stock` to `authenticated`:
1. 3-argument overload `(uuid, uuid, integer)` — directly changes `inventory_items.current_stock`, enforces only tenant_id in the update predicate, performs no permission check, and writes no inventory ledger row.
2. Extended 11-argument overload — enforces current-tenant equality, `inventory:adjust`, actor tenant membership, valid source/movement types, non-negative stock, and writes an inventory ledger record.

`consume_procedure_inventory` uses the extended canonical overload. The 3-argument overload is a potential legacy/shadow permission bypass and audit-integrity bypass and must be treated as a blocker until active callers are disproven and the legacy overload is removed/restricted through a migration.

## RLS Baseline
Key patient, agenda, visit, invoice, invoice-item, inventory, procurement, and analytics policies inspected all contain tenant scoping through `get_current_tenant_id()` and/or tenant-aware permission checks. No cross-tenant data leak was proven by the read-only checks performed so far.

## CI / Runtime Baseline
Current main CI run associated with the baseline commit:
- TypeScript: PASS
- Lint: PASS
- I18N: PASS
- UX audits: PASS
- AJM audits: PASS
- Production build: PASS, with webpack circular-dependency warnings
- Authenticated local E2E: PASS (2/2)
- Real-world clinic E2E: **FAIL** at appointment booking as described above.

Vercel production deployment:
- `dpl_3SPDrcPYd73aj1JM1838Xo1vy8cD`
- target: production
- commit: `cdedb1937edc44bd93dafdceacfa52e70c19bbbb`
- `/api/build-info` returns the same SHA, branch `main`, environment `production`.
- No production error/fatal runtime logs were found for this deployment in the inspected 24h window.
- Vercel currently also reports a separate newer deployment in `BUILDING`; this was not initiated by this execution and is not used as production evidence.

## Supabase Advisor Signals Requiring Disposition
Security advisor reported:
- 2 extension-in-public warnings (`pg_net`, `btree_gist`)
- 28 authenticated security-definer-executable warnings
- leaked-password-protection warning
Performance advisor reported broad indexing/RLS optimization warnings. These are not all confirmed blockers; they require classification after the concrete legacy overload issue is resolved.

## Architecture Authority
Current index/roadmap/schema/handoff documents establish:
- `master_tenants` + `clinic_users` is the active tenant model.
- Clinic Admin is highest clinic authority; `clinic_owner` is retired.
- Patient Flow is canonical; Workspace is presentation.
- Agenda↔Visit relationship is canonical.
- PJ-MASTER-DOCS govern Patient Journey semantics and must not be silently changed.

## Current Open Findings
1. **BLOCKER-HIGH:** legacy 3-argument `adjust_inventory_stock` executable by authenticated users and capable of unaudited stock mutation.
2. **BLOCKER-DATA:** Zada provider availability points to a receptionist user, causing canonical doctor availability failure and the real-world E2E failure. Data provenance must be established before correction.
3. **RECONCILIATION:** `AUDIT-PO-001` receipt quantity is received but has no purchase-receipt inventory ledger entry; PO status remains `ordered` despite 10/10 received.
4. **RECONCILIATION:** treatment plan headers exist without treatment plan items/visits while the PJ E2E dataset document describes staged items.
5. **CI-BLOCK:** full real-world clinic E2E is red on baseline main.
6. **SECURITY-DISPOSITION:** Supabase leaked-password-protection warning and extension/RPC advisor findings require closure or explicit risk acceptance before final production closure.
7. **DB-CHANGE-BLOCK:** no isolated Supabase branch is currently exposed for safe migration validation.

## Repairs
No production/application/database repair has been performed in this execution. Baseline remains read-only with respect to Supabase.

## Last Verified State
`main` production matches the baseline commit and is reachable. The system is not yet eligible for Production Closure.

## Next Exact Action
**NEXT ACTION: complete forensic classification of `AUDIT-PO-001`, treatment-plan header-only records, and all 213 non-PJ patient records; then trace every caller of the legacy 3-argument `adjust_inventory_stock` and prepare a branch-based migration/remediation plan without touching Production.**

## Closure State
# NOT CLOSED — BLOCKER
