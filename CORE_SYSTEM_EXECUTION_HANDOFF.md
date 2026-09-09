# CORE SYSTEM — EXECUTION HANDOFF

## Purpose

This file is the canonical restart point for the **MASTER REVERSE CAUSAL VALIDATION, FORENSICS, REPAIR & PRODUCTION CLOSURE** program.

It records the current verified execution state. A new conversation must read this file before taking action and must verify its claims against GitHub, Supabase, repository contents, and other available evidence.

> **Rule:** This handoff is a navigation/state artifact, not an authority that overrides primary evidence.

---

## 1. Project

**CORE SYSTEM — Clinic Operating System + Medical CRM + Business Intelligence**

Repository:
`mdcode2026-core-sys/Core-System-clinic-`

Default branch:
`main`

Execution model:
**Inspect → Understand → Reconstruct → Trace → Prove → Root-Cause Repair → Validate → Merge → Production Verify → Clean → Close**

---

## 2. Current Mission

Perform reverse-causal validation of the existing clinic operating system.

The objective is to start from existing database results (**X**) and prove the complete causal path:

`Documentation → Scenario → Architecture → Engineering → Implementation → Execution → Result`

and in reverse:

`Result X → Evidence → Scenario → Constraints → Governing Logic → Canonical Implementation`

using:

`S + C × G − Y = X`

where `Y` represents invalid influence such as bugs, bypasses, duplicate business logic, shadow/legacy implementations, hardcoded/demo paths, stale code, tenant leakage, incorrect state transitions, or other non-canonical influence.

The objective is not merely to reproduce X, but to prove that X is produced through the correct canonical path.

---

## 3. Current Phase

**PHASE 1 — DATABASE REALITY RECONSTRUCTION**

The database has already been partially inspected read-only. The next execution must **continue from that partial evidence**, not restart the investigation from zero.

### Immediate next action

Complete the read-only database reconstruction across all relevant domains, relationships, lifecycle states, ownership boundaries, and scenario families; then reconcile the resulting evidence against the project documentation and architecture.

---

## 4. Baseline Safety State

### Database

- Read-only inspection has been performed.
- No repair should be performed during baseline reconstruction.
- Do not alter existing baseline records.
- Do not add records merely to make a scenario pass.
- Do not delete or rewrite baseline evidence.

### Vercel

- No deployment is authorized as a routine test.
- Preview/production deployment requires an explicit direct instruction at that moment.
- Vercel must not be used as the normal validation environment.

### GitHub

- Work must not be performed directly on `main`.
- Any future code/database repair must use a purpose-specific branch.
- Database changes must be migrations and validated in an isolated Supabase environment/branch when available.

---

## 5. Known Repository State

A dedicated branch was created for establishing these execution-state files:

`docs/execution-handoff-baseline`

These handoff files are documentation/state artifacts only; they are not a substitute for the required repair workflow.

**Important:** The existence of this branch does not authorize merging it into `main`. Merge must follow the project's full Merge Gate.

---

## 6. Database Baseline Evidence Already Observed

Primary operational tenant identified in the inspected data:

**Zada Clinic test**

Observed counts from the prior read-only reconstruction:

- Patients: **279**
- Agenda events/appointments: **282**
- Visits: **138**
- Invoices: **138**
- Inventory movements: **113**
- Purchase orders: **6**
- Followups: **690**
- Employees: **8**

Other observed tenants were mostly empty/test tenants, including:

- `عيادة Yazeed ` — 3 patients and no comparable operational volume
- `Dr. Khaled Al-Dajah Clinic (AUDIT TEST TENANT)` — 1 patient, 1 visit
- `ClinicSaaS™ Default Clinic` — 0 operational patients
- `Test Clinic 2` — 0 operational patients

These values are **baseline evidence only** and must be re-queried before being treated as a current live-state assertion.

---

## 7. Observed Status Evidence — Zada Clinic test

Appointments:

- cancelled: 60
- completed: 138
- no_show: 30
- rescheduled: 30
- scheduled: 24

Followups:

- cancelled: 1
- completed: 1
- open: 688

Followup delivery:

- pending: 516
- null: 174

Invoices:

- issued: 56
- paid: 55
- partial: 27

Patients:

- active: 273
- inactive: 6

Visits:

- completed: 138

Again, these values are a prior read-only snapshot and must be revalidated before use as a current invariant.

---

## 8. Observed Temporal Evidence

Prior inspection found approximately:

- First appointment: `2026-01-06 06:00:00+00`
- Last appointment: `2026-09-09 13:30:00+00`
- First observed created record: `2026-01-01 05:00:00+00`
- Last observed created record: `2026-09-08 14:08:06.395616+00`

These are evidence points, not assumptions. Re-query before relying on them.

---

## 9. Scenario Evidence Already Detected

The database contains a significant family of deliberately identifiable journey records using identifiers such as:

`PJ15E2E001 ... PJ15E2E060`

There are also runtime/E2E-looking records such as:

`E2E-* Patient E2E`

These categories must not be blindly merged.

The next phase must classify them into:

1. Realistic clinic operational scenarios
2. PJ/E2E scenario evidence
3. Runtime test evidence
4. Legacy/unknown/orphan evidence

Some patients already show complete multi-domain patterns such as:

`Patient → Appointment → Visit → Procedure → Invoice → Followup`

and therefore provide useful reverse-causal evidence.

---

## 10. Important Data Anomaly Principle

Some records appear intentionally synthetic or edge-case-like (for example, apparent name/gender inconsistencies).

Do **not** automatically repair such records.

First determine whether the anomaly is:

- intentional scenario coverage,
- synthetic test data,
- data-quality defect,
- historical/legacy data,
- or actual production behavior.

Evidence must determine the classification.

---

## 11. Required Domain Scope

The reconstruction must cover, where present:

- Tenant
- Authentication
- Users
- Roles
- Permissions
- Patients
- Appointments / Agenda
- Availability
- Rooms / Resources
- Queue / Reception
- Clinical Visits
- Procedures / Services
- Medical Master Library / Service Catalog
- Treatment Plans
- Follow-up
- Automated Follow-up
- Medical Photos
- Patient Portal
- Invoices
- Payments
- Inventory
- Inventory Movements
- Procurement / Purchase Orders
- Employees
- Analytics
- Audit / Activity
- Subscription / Entitlements
- Any other actual domain/entity discovered in the repository or database

---

## 12. Architecture Rules To Preserve

Known governing decisions include:

- **Independent Modules + Integrated Platform**
- Patient Internal Journey is the **Core Platform Journey**
- Subscription model: **Tenant → Subscription → Enabled Modules → Capabilities**
- **Super Admin** is platform owner/lessor only
- **Clinic Admin** is the tenant/main administrator
- Clinic Owner role concept is retired
- Role Templates are editable, not immutable
- PJ documentation is authoritative unless an explicit decision changes it

These decisions must be verified against the current repository/documentation before any repair.

---

## 13. Required Reverse-Causal Chain

For each material baseline result X:

`X`

→ evidence

→ scenario

→ actor

→ role

→ permissions

→ preconditions

→ workflow

→ business rules

→ domain

→ module/capability

→ canonical implementation

→ database operations

→ side effects

→ cross-domain effects

→ analytics effects

→ verification

The analysis must also search for alternate paths that could produce X incorrectly.

---

## 14. Engineering Forensics Scope

The full codebase must be checked for:

- duplicate code
- duplicate business logic
- shadow implementations
- legacy paths
- stale implementations
- dead code
- orphan code
- dead routes
- dead APIs
- duplicate components
- hardcoded business data
- mock/demo paths
- permission bypasses
- tenant isolation failures
- state transition bypasses
- inconsistent authorization
- duplicated calculations
- divergent analytics logic
- undocumented database writes
- client-side-only security decisions

No deletion or refactor is permitted merely because code looks old. Prove ownership, usage, and canonicality first.

---

## 15. Mandatory Change-Control Policy

Every software change, regardless of size, must follow:

1. Create a clear non-main branch.
2. Keep unrelated fixes in logically separated branches.
3. Database changes only through Supabase migrations.
4. Validate DB changes in isolated Supabase branch/environment when available.
5. Run lint, type-check, tests, and build locally/Codespaces/GitHub Actions.
6. Do not use Vercel as the routine test environment.
7. No preview/production deployment unless explicitly requested at that moment.
8. Use small, clear commits.
9. Before merge, require build + tests + migrations + conflict review + architecture/security/integration validation.
10. Merge to `main` only after the full gate passes.
11. Production deployment occurs automatically after main merge if configured.
12. Verify production after deployment.
13. Delete the merged local and remote branch immediately.

---

## 16. Repair Gate

No repair begins until a finding has:

`Evidence → Finding → Root Cause → Affected Scenario → Affected Domain → Canonical Fix → Regression Risk → Validation Method`

Fix the root cause, not merely the visible symptom.

---

## 17. Closure Criteria

The project cannot be declared:

# PRODUCTION CLOSED

until all material areas are proven:

- Architecture integrity
- Database integrity
- Engineering integrity
- Workflow integrity
- Security integrity
- Multi-tenant integrity
- Cross-domain integrity
- Analytics integrity
- Runtime integrity
- Code integrity
- Migration integrity
- Git integrity
- Production integrity
- Branch cleanup

Otherwise state:

# NOT CLOSED — BLOCKER

and identify the blocker with evidence and required action.

---

## 18. Handoff Rules

Every major execution checkpoint must update this file and the execution ledger.

A new conversation should:

1. Read this file.
2. Read `CORE_SYSTEM_EXECUTION_LEDGER.md`.
3. Verify Git state.
4. Verify Supabase state.
5. Verify the repository state.
6. Identify the last verified checkpoint.
7. Execute only the `NEXT EXACT ACTION`.

Do not restart completed work unless new evidence invalidates the previous checkpoint.

---

## 19. Current Next Exact Action

**Complete the read-only Database Reality Reconstruction across the full schema and relevant domains, revalidate the existing baseline counts/statuses, map the existing scenario families and causal relationships, and record the evidence needed for the Documentation ↔ Scenario reconciliation.**

No data mutation.
No repair.
No deployment.
No new test data.

---

## 20. Last Verified State

As of the establishment of this handoff:

- The repository exists and `main` is the default branch.
- The two requested execution-state files did not previously exist on `main`.
- A dedicated documentation branch was created: `docs/execution-handoff-baseline`.
- The database had previously been inspected read-only and yielded the baseline evidence recorded above.
- The reverse-causal execution plan and mandatory GitHub/Supabase/Vercel change-control policy have been defined.
- Full forensic validation and repair are **not yet complete**.
- Production is **not closed**.

**Status: IN PROGRESS — PHASE 1**
