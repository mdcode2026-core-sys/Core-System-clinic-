# CORE SYSTEM — AJM-0 Baseline & Readiness

**Workstream:** AJM — Administrative & Journey Management  
**Stage:** AJM-0 — Baseline & Readiness  
**Status:** CLOSED — baseline frozen; implementation stages may proceed subject to dependency gates  
**Date:** 2026-08-27  
**Repository:** `mdcode2026-core-sys/Core-System-clinic-`  
**Baseline branch:** `main`

## 1. Purpose

AJM-0 establishes the factual implementation baseline for AJM. It does not implement AJM-1 or later domain capabilities.

The baseline was reconciled across:

- approved AJM documentation in GitHub;
- current `main` repository state;
- live Supabase database and applied migrations;
- current Vercel project/deployment state;
- production HTTP/runtime error state;
- existing PJ-era implementations and integration anchors.

The governing execution rule is:

> **Inspect → Reuse → Extend → Create**

No capability is treated as complete merely because source code, a migration, or a UI surface exists.

## 2. Governing documents verified

### AJM

- `docs/CORE-SYSTEM-ADMINISTRATIVE-JOURNEY-MANAGEMENT-BLUEPRINT.md`
- `docs/AJM-IMPLEMENTATION-PLAN.md`
- `docs/AJM-STAGE-INDEX.md`
- `docs/TEAM-ACCESS-ENGINEERING-BLUEPRINT.md`
- `docs/CLINIC-OPERATIONS-WORKFORCE-REFERENCE.md`
- `docs/CLINIC-OPERATIONS-WORKFORCE-FINANCIAL-INTEGRATION-REFERENCE.md`
- `docs/INSIGHTS-ENGINEERING-BLUEPRINT.md`
- `docs/JOURNEY-COORDINATION-ENGINEERING-BLUEPRINT.md`
- `docs/COMMUNICATIONS-ENGINEERING-BLUEPRINT.md`

The Communications blueprint was not present on `main` at the beginning of AJM-0. Its approved PR was merged before the AJM-0 baseline was frozen, so the governing document is now present on `main`.

### PJ / existing architecture

The current repository contains PJ implementation and production-verification records under `docs/pj/`, including Stage 12 Patient Portal verification/fix records. AJM treats PJ as the patient-centered journey authority and does not redefine it.

## 3. AJM stage dependency gate

Approved sequence:

1. AJM-0 — Baseline & Readiness
2. AJM-1 — Team & Access Foundation
3. AJM-2 — Financial & Resources Foundation
4. AJM-3 — Workforce & Operations Foundation
5. AJM-4 — Communications Foundation
6. AJM-5 — Journey Coordination Foundation
7. AJM-6 — Insights & Analytics
8. AJM-7 — PJ & Cross-Domain Integration
9. AJM-8 — Final Validation & Closure

AJM-0 confirms that the sequence is usable. It does **not** authorize skipping dependencies. In particular:

- AJM-2 must reuse the existing financial/resource foundations rather than create a second financial system.
- AJM-3 must keep Workforce separate from Agenda and Team & Access.
- AJM-4 must reuse Patient Portal identity/relationship and existing notification infrastructure.
- AJM-5 must reuse effective permissions and existing clinical handoff/queue concepts where applicable.
- AJM-6 must reuse the existing Analytics/Reports foundations.
- AJM-7 remains gated on the relevant preceding domain foundations.

## 4. Repository reality

The current `main` repository contains meaningful foundations for:

### Team & Access — KEEP / EXTEND

- `roles`, `permissions`, `role_permissions` and `clinic_user_permission_overrides` domain/data structures;
- effective-permission calculation;
- workspace/sidebar architecture;
- user settings and tenant preferences;
- audit/activity infrastructure.

The Team & Access blueprint explicitly preserves Role ≠ Permission, Workspace ≠ authorization boundary, and Clinic Admin as tenant operational authority.

### Agenda — KEEP / EXTEND

- canonical `master_agenda_events` appointment entity;
- provider availability foundation;
- room conflict enforcement;
- Agenda queries/actions/types and availability/conflict engines.

Agenda remains the appointment/scheduling authority.

### Clinical / PJ — KEEP / INTEGRATE

- clinical visit/session structures;
- treatment plans and treatment-plan visit/item relationships;
- queue/workspace flow;
- follow-up and follow-up automation;
- medical files foundation;
- Patient Portal foundation and patient-clinic relationship model.

### Financial & Resources — RECONCILE / EXTEND

Repository/database foundations exist for:

- invoices;
- invoice items;
- invoice payments;
- billing events;
- inventory items;
- inventory ledger;
- financial RPCs/functions;
- procedure/session/resource relationships.

These are not yet evidence of a complete AJM-2 operating domain.

### Insights — KEEP / EXTEND

The repository has Analytics/Reports foundations and KPI definitions. The Insights blueprint requires canonical metrics and explicitly prohibits a second analytical calculation engine.

### Communications — RECONCILE / EXTEND

Existing foundations include:

- `notification_queue`;
- tenant notification channel preferences;
- Patient Portal messages;
- Patient Portal invitations;
- Patient Portal medical-file releases;
- external channel fields for email/SMS/WhatsApp.

The approved Communications blueprint now exists on `main`. The existing implementation is not yet evidence of the complete Communications domain defined by that blueprint.

### Workforce — BUILD / DATA FOUNDATION

No complete Workforce domain model comparable to the approved blueprint is present in the live public schema. Existing user/access and Agenda availability structures are anchors, but they must not be mistaken for Employee/Employment/Leave/Attendance/Payroll/Benefits/Commission/Recruitment/Capacity/Productivity ownership.

### Journey Coordination — BUILD / REUSE / EXTEND

The approved Journey Coordination architecture exists as a governing document, but the live database does not contain a dedicated general coordination model for Tasks, Requests, Handoffs, Next Actions and Escalations. Existing queue, clinical handoff and follow-up work are integration anchors and must be reconciled rather than duplicated.

## 5. Live Supabase baseline

**Project:** `qaslsjyxjwvdoiczmhgq`

Live public schema currently contains **49 public tables** with RLS enabled on the inspected tables.

Important live counts at baseline:

| Area | Live count |
|---|---:|
| Tenants | 5 |
| Clinic users | 9 |
| Roles | 6 |
| Permission catalog entries | 54 |
| Role-permission assignments | 140 |
| User permission overrides | 56 |
| Agenda events | 66 |
| Follow-ups | 140 |
| Notifications | 125 |
| Inventory items | 1 |
| Inventory ledger entries | 1 |
| Patient Portal invitations | 1 |
| Patient Portal messages | 0 |
| Invoices | 0 |
| Invoice payments | 0 |
| Analytics daily snapshots | 0 |

These counts describe the current data state, not product completeness.

### Authorization baseline

Current live system roles are:

- `super_admin` — 44 permissions
- `clinic_admin` — 52 permissions
- `doctor` — 17 permissions
- `receptionist` — 18 permissions
- `accounting` — 9 permissions
- `nurse` — 0 permissions

`clinic_owner` is absent from the current role set and remains retired.

The current `clinic_users.role` database constraint permits the six active role values above. AJM must not reintroduce `clinic_owner`.

### Tenant isolation / RLS

The inspected public tables have RLS enabled. Tenant-scoped foreign keys consistently point to `master_tenants`, and the inspected policy inventory shows tenant-aware policies across the major AJM/PJ tables.

RLS presence is not considered proof of complete authorization correctness; every AJM implementation stage must test authorization at the server/data boundary.

### Database integrity

Important canonical constraints verified in production include:

- Agenda doctor overlap exclusion;
- Agenda room overlap exclusion;
- tenant foreign keys across major operational tables;
- role/permission/override foreign keys;
- invoice/payment relationships;
- inventory ledger relationships;
- Patient Portal clinic relationship and invitation constraints.

## 6. Applied migration reality

The live Supabase migration history contains substantially more applied migrations than the repository migration directory historically represented.

The live migration sequence includes:

- security hardening batches;
- M2 Team & Access corrections;
- PJ Stage 1/3/4/5/6/7/8/9/10/11/12 changes;
- Patient Portal and medical-file changes;
- i18n changes;
- legacy tenant/user removal.

AJM implementation must therefore treat **live schema + repository migrations + current application code** as separate evidence sources and reconcile them before migration changes.

A migration filename being absent from the repository is not permission to recreate its schema effect.

## 7. Production / Vercel baseline

**Vercel project:** `core-system-clinic`  
**Project ID:** `prj_DN3UgHVBUHrFG6i6ycxAWj0bXLbG`  
**Team:** `mdcode2026-core-sys-projects`

At the time of the initial AJM-0 inspection, production was serving the latest deployed `main` commit `b71d3587c03b4a020e8b61ea219837bf2301fcd3` (AJM Stage Index).

After the Communications blueprint was merged, Vercel automatically started a production deployment for commit `39e346a6b20b59c9d24e679769e4f0b9d51d15d3`.

The production application was directly fetched during baseline verification and returned HTTP 200 with a rendered login surface, language switcher, and register route.

Vercel reported **no grouped production runtime errors in the preceding 24 hours** at baseline verification time.

The new AJM-0 documentation commit will create another automatic Vercel deployment; this is documentation-only and is not intended to alter application behavior.

## 8. Reconciliation classification

| Capability | Classification | AJM baseline finding |
|---|---|---|
| Tenant / access identity | KEEP | Existing tenant/user architecture is canonical |
| Roles & permissions | KEEP / EXTEND | Strong existing foundation; AJM-1 must complete the approved flexible model |
| Permission overrides | KEEP | Existing effective-permission architecture is retained |
| Workspaces | KEEP | UX organization only; not authorization boundary |
| User settings | KEEP / EXTEND | Belongs to Team & Access |
| Agenda | KEEP / EXTEND | Canonical appointment system; not replaced by Workforce/Coordination |
| Availability | KEEP / EXTEND | Existing provider availability and Agenda conflict logic are reusable |
| Clinical/PJ | KEEP | PJ remains journey authority |
| Treatment Plan | KEEP / INTEGRATE | Financial and coordination integration points exist conceptually |
| Follow-up | KEEP / INTEGRATE | Existing follow-up domain remains owner |
| Patient Portal | KEEP / EXTEND | Existing patient-facing foundation is reusable |
| Billing / Payments | RECONCILE / EXTEND | DB/RPC foundations exist but live data is empty |
| Installments | BUILD / DATA FOUNDATION | Required Core capability; not evidenced as a complete live model in baseline |
| Insurance minimum | BUILD / DATA FOUNDATION | Required Core capability; current payment method support is not a complete insurance model |
| Inventory | KEEP / EXTEND | Existing canonical ledger; purchasing/supplier depth remains incomplete |
| Workforce | BUILD / DATA FOUNDATION | No complete independent workforce domain found in live schema |
| Communications | RECONCILE / EXTEND | Existing notification/portal messaging foundations; broader approved domain remains incomplete |
| Journey Coordination | BUILD / REUSE | General work/request/handoff model not present as a complete independent domain |
| Insights | KEEP / EXTEND | Analytics/Reports foundation exists; canonical convergence remains required |
| Cross-domain event contracts | DATA FOUNDATION / BUILD | Existing triggers/functions exist, but a unified AJM event contract is not yet a complete domain capability |
| AI | DEFER | Prepare structured data; do not build AI in AJM-0 |

## 9. Confirmed risks

### R1 — Documentation/repository/live-schema drift

The project has a history of live migrations that are not represented one-for-one in the repository. This is a governance and migration risk. AJM must reconcile migration state before every schema change.

### R2 — Empty operational data in some domains

Invoices, payments and analytics snapshots are currently empty. This means structural presence cannot be interpreted as production maturity.

### R3 — Domain duplication risk

Existing PJ/Agenda/Follow-up/Portal/Analytics implementations create strong reuse opportunities but also create risk of building duplicate engines. Every AJM stage must establish ownership before adding tables or services.

### R4 — Authorization drift

The current role/permission model is strong but broad. AJM-1 must validate effective access, custom roles, direct permissions/overrides and server-side enforcement rather than assuming the existing UI is sufficient.

### R5 — Workforce/Coordination capability gap

These are the largest structural AJM gaps identified in baseline. They must be implemented as independent domains and must not be hidden inside Team & Access, Agenda, Communications or PJ.

### R6 — Production deployment lag

Vercel deploys `main` automatically. Baseline verification can temporarily observe the previous production deployment while a newer `main` commit is building. Runtime claims must always identify the deployment commit/state checked.

## 10. Explicit non-goals for AJM-0

AJM-0 does **not**:

- implement Team & Access changes;
- implement financial/invoice/installment changes;
- implement Workforce;
- implement Communications runtime capability;
- implement Journey Coordination;
- rebuild Patient Portal;
- rebuild Agenda;
- rebuild Follow-up;
- replace Analytics/Reports;
- introduce a second authorization engine;
- introduce a second Patient Journey;
- introduce AI;
- change subscription packaging decisions already approved;
- change the PJ architecture.

## 11. AJM-0 Definition of Done

The following conditions are satisfied:

- [x] AJM Master Blueprint reviewed from GitHub.
- [x] AJM Implementation Plan reviewed from GitHub.
- [x] AJM Stage Index reviewed from GitHub.
- [x] Domain engineering blueprints referenced by AJM reviewed.
- [x] Communications blueprint reconciled into `main`.
- [x] PJ implementation/verification records inspected in the repository.
- [x] Repository implementation baseline inspected for AJM anchors.
- [x] Live Supabase schema, RLS state, constraints and key data counts inspected.
- [x] Live migration history inspected.
- [x] Vercel project/deployment state inspected.
- [x] Production HTTP behavior verified.
- [x] Recent production runtime error state verified.
- [x] Current-state classification completed.
- [x] Dependency gates and explicit non-goals recorded.
- [x] AJM-0 baseline document committed to the repository.

## 12. Closure decision

**AJM-0 is CLOSED.**

The baseline is frozen as the starting point for AJM implementation. AJM-1 may now begin, subject to its own stage-specific Read → Inspect → Runtime Verification → Reconcile gate.

No AJM-1 implementation is included in this stage.
