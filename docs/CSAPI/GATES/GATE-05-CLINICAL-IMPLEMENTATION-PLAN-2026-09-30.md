# CORE SYSTEM — CSAPI Gate 05 — Clinical Implementation Plan
## Version 1 — 2026-09-30

**Status:** FROZEN — IMPLEMENTATION-READY WORK PACKAGE PLAN  
**Gate:** 05 — Clinical Care  
**Implementation:** NOT STARTED  
**Production mutation:** NONE

## 1. Objective

Implement the approved comprehensive Clinical foundation without rebuilding Visit, Patient Flow, Agenda, Treatment Plan, Follow-up, Medical Files, Workforce or Governance.

The plan is one coherent Gate 05 implementation workstream, not a collection of micro-PRs.

## 2. Work packages

### WP-05-1 — Canonical schema foundation
Owner functions: Database / Backend / Architecture

Scope:
- create Clinical Observation;
- create Clinical Assessment;
- create Clinical Problem;
- create Clinical Decision;
- create Clinical Recommendation + items;
- create Patient Decision;
- create Visit Participation;
- create Clinical Document + versions;
- create Clinical Template + versions;
- extend Visit with the frozen template reference;
- extend Procedure Execution semantics in `clinic_visit_procedures`;
- remove the final semantic dependence on unique `(visit_id, procedure_id)` without losing historical data.

Exit evidence:
- clean migration replay;
- PK/FK/index verification;
- tenant/patient integrity verification;
- no destructive historical data loss.

### WP-05-2 — Authorization / RLS
Owner functions: Database / Security / Backend

Scope:
- seed the exact nine `clinical:*` permission keys;
- map them through the existing effective-permission engine;
- create RLS policies with tenant isolation and action-specific authorization;
- preserve existing Visit/Medical Files/Agenda permission families;
- block direct table mutation where canonical server actions are required.

Exit evidence:
- positive and negative authorization tests;
- cross-tenant denial;
- finalization/attestation protections;
- direct table-write denial for the intended canonical boundary.

### WP-05-3 — Clinical command layer
Owner functions: Backend / Security / Clinical Advisor

Scope:
- implement the command set from the Execution Contract;
- enforce lifecycle transitions;
- enforce actor/provenance semantics;
- enforce atomic multi-row business actions;
- emit canonical audit information.

Exit evidence:
- unit/integration tests for every command;
- invalid-transition tests;
- audit/provenance verification.

### WP-05-4 — Template evaluator and clinical completion validation
Owner functions: Backend / Clinical Advisor / QA

Scope:
- resolve applicable published template version;
- evaluate universal clinical minimums;
- evaluate required template fields;
- validate applicable documentation/procedure/patient-decision requirements;
- return a deterministic Clinical completion result to Patient Flow.

Exit evidence:
- template version immutability tests;
- required-field pass/fail tests;
- no generic workflow/rules engine created.

### WP-05-5 — Clinical longitudinal read model
Owner functions: Backend / Data

Scope:
- implement the Clinical Record projection/query service from canonical entities;
- support patient/date/type/relevance filtering;
- preserve current Visit context while viewing history;
- no `medical_records` mega-table.

Exit evidence:
- longitudinal composition tests;
- tenant isolation;
- pagination/filter correctness;
- no duplicate source-of-truth table.

### WP-05-6 — Clinical Workspace convergence
Owner functions: Frontend / UX / Backend / Clinical Advisor

Scope:
- replace structured Clinical write paths with canonical commands;
- preserve simple normal-path UX;
- surface relevant history, problems, observations, decisions, recommendations and patient decisions progressively;
- make planned/scheduled/performed states distinct;
- keep photo/file actions non-blocking where technically possible;
- preserve Patient Flow handoff.

Exit evidence:
- authenticated clinician E2E;
- mobile/RTL regression checks where applicable;
- normal Visit path works without opening advanced panels.

### WP-05-7 — Verification infrastructure
Owner functions: QA / SDET / DevOps / Security

Scope:
- structural verification;
- clean migration lane;
- authorization/security lane;
- lifecycle lane;
- authenticated application E2E;
- cross-domain boundary checks;
- exact-candidate build/runtime checks.

Exit evidence:
- reproducible machine-readable verification results;
- no weakened/removed failing checks.

### WP-05-8 — Integrated verification / release / closure
Owner functions: QA / Security / DevOps / AI Engineering Leader

Scope:
- integrate only required closed-gate contracts;
- verify Gate 04 appointment boundary;
- verify Gate 06/Future Treatment Plan references without taking lifecycle ownership;
- verify Gate 11/Future Follow-up references without taking lifecycle ownership;
- verify exact main SHA;
- production verification when required;
- final documentation reconciliation.

Exit evidence:
- all required lanes PASS;
- exact main candidate verified;
- final Gate 05 closure record;
- Gate Plan / Master State / Handoff / Ledger synchronized.

## 3. Branch/PR rule

Use one coherent Gate 05 implementation branch after Gate 04 closure.

Do not create a PR for each work package.
Do not revive historical diagnostic branches.
Do not merge until the full candidate satisfies the Gate 05 verification contract.

## 4. Migration sequence

Migration order is frozen conceptually:
1. permission keys / authorization prerequisites;
2. canonical Clinical tables;
3. support/link tables;
4. Visit template linkage;
5. Procedure Execution extension;
6. RLS/policies/constraints/indexes;
7. safe historical backfill;
8. controlled application cutover;
9. deprecated-write retirement only after evidence.

The exact migration filenames/timestamps must be generated through the repository's canonical migration workflow at implementation time. Names are not pre-invented in this planning artifact.

## 5. Historical data rules

Never manufacture structured clinical facts.

Allowed:
- deterministic document creation from trustworthy existing free-text history;
- explicit historical labels;
- preserving existing JSON/text as transitional historical content.

Not allowed:
- inferring examination/findings/decision values from empty JSONB;
- turning treatment free text into claimed Procedure Executions without deterministic evidence;
- silently changing patient clinical history;
- deleting historical notes to make the new model look clean.

## 6. Required cross-domain verification

Gate 05 must prove:
- Gate 01 Visit lifecycle remains authoritative;
- Gate 03 patient identity remains authoritative;
- Gate 04 owns Appointment truth;
- Gate 06 owns Treatment Plan lifecycle;
- Gate 11 owns Follow-up lifecycle;
- Gate 07 owns Procedure Definition/Catalog;
- Medical Files owns media and image measurements;
- Workforce owns capability/eligibility.

A downstream failure is classified by violated invariant and owning gate; it is not automatically moved into Clinical.

## 7. Definition of implementation-ready handoff

The work package is implementation-ready only when:
- all design artifacts are frozen;
- exact permissions are frozen;
- command boundaries are frozen;
- migration sequence is frozen;
- verification lanes are frozen;
- ownership is frozen;
- no unresolved Product Owner decision remains;
- implementation is still not started.

Gate 05 satisfies this definition as of 2026-09-30.

## 8. Sequential barrier

- Gate 04 implementation happens before Gate 05 implementation unless a specific dependency is documented.
- Gate 05 implementation happens before Gate 05 closure.
- Gate 06 planning may start after Gate 05 readiness.
- **Gate 06 implementation is prohibited until BOTH Gate 04 and Gate 05 are CLOSED / VERIFIED / PRODUCTION VERIFIED.**

This barrier is binding.
