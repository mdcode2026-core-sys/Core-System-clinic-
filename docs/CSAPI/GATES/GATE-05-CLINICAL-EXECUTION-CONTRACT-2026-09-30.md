# CORE SYSTEM — CSAPI Gate 05 — Clinical Execution Contract
## Version 1 — 2026-09-30

**Status:** FROZEN — IMPLEMENTATION-READY TRANSFER CONTRACT  
**Gate:** 05 — Clinical Care  
**Implementation:** NOT STARTED  
**Schema migration:** NOT STARTED  
**Production mutation:** NONE  
**Dependency barrier:** Gate 05 implementation is blocked until Gate 04 is CLOSED / VERIFIED / PRODUCTION VERIFIED unless an explicit CSAPI dependency is recorded.

## 1. Purpose

This contract converts the approved Gate 05 Clinical architecture into one controlled execution boundary.

It is binding for the future Gate 05 implementation workstream. It does not authorize implementation in the current planning session.

The contract preserves:
- one canonical Visit foundation;
- one Patient Flow lifecycle authority;
- one Medical Files owner;
- one Agenda owner;
- one Treatment Plan owner;
- one Follow-up owner;
- one Workforce capability owner;
- one Governance audit boundary;
- no generic cross-domain Clinical Result / Consequence / Task / Rules Engine.

## 2. Source-of-truth matrix

| Concern | Canonical owner | Gate 05 behavior |
|---|---|---|
| Patient identity / clinic relationship | Gate 03 | consume |
| Visit lifecycle | Patient Flow / Visit | extend clinical data without creating a second lifecycle |
| Clinical facts and decisions | Clinical | own |
| Procedure definition/catalog | Gate 07 | consume |
| Procedure execution during Visit | Clinical | own execution semantics |
| Appointment | Gate 04 Agenda | consume / request |
| Treatment Plan lifecycle | Gate 06 | consume / source references |
| Follow-up lifecycle | Gate 11 | consume / source requirements |
| Workforce professional identity/capability | Workforce | validate performer capability |
| Medical files and image measurements | Medical Files | consume / reference |
| Operational work | Coordination | emit typed requirement/reference |
| Audit | Governance | reuse |

## 3. Canonical application write boundary

All new Gate 05 canonical writes must converge on Clinical server-side actions.

The client must not directly mutate Gate 05 tables.

Required command set:
- createObservation
- updateObservation
- createAssessment
- finalizeAssessment
- createProblem
- resolveProblem
- createDecision
- finalizeDecision
- createRecommendation
- recordPatientDecision
- createProcedureExecution
- updateProcedureExecutionState
- createClinicalDocument
- finalizeClinicalDocument
- attestClinicalDocument
- amendClinicalDocument
- completeClinicalVisitClinicalValidation

Each command must:
1. authenticate the actor;
2. resolve the effective tenant;
3. resolve effective permission;
4. validate Patient/Visit tenant integrity;
5. validate lifecycle state;
6. validate actor/provenance semantics;
7. persist the complete atomic clinical action when multiple writes form one business action;
8. write canonical Governance audit information where required;
9. return stable domain errors.

## 4. Exact authorization contract

Existing permissions remain unchanged:
- `visits:read`
- `visits:update`
- all `medical_files:*`
- all `agenda:*`

Gate 05 introduces exactly these new permission keys in the existing permission registry:
- `clinical:read`
- `clinical:write`
- `clinical:finalize`
- `clinical:attest`
- `clinical:manage_templates`
- `clinical:manage_problems`
- `clinical:manage_recommendations`
- `clinical:execute_procedures`
- `clinical:record_patient_decision`

No aliases, renamed synonyms or parallel permission engine are permitted.

### Permission mapping
- Clinical Record and canonical clinical reads → `clinical:read`
- Observation / Assessment / Decision / clinical-document draft writes → `clinical:write`
- Problem administration → `clinical:manage_problems`
- Recommendation administration → `clinical:manage_recommendations`
- Patient response capture → `clinical:record_patient_decision`
- Procedure Execution mutation → `clinical:execute_procedures`
- finalization → `clinical:finalize`
- attestation → `clinical:attest`
- template administration → `clinical:manage_templates`

Where multiple authority levels apply, the required permissions are additive. A permission never grants Workforce medical capability.

## 5. Actor and provenance contract

Distinguish:
- authenticated account/action identity = `clinic_users`;
- professional identity = `workforce_employees`;
- performer = actual professional who performed the clinical act;
- recorder/author = user who recorded the information;
- finalizer = user who finalized content;
- attester = user who attested a document.

Never use `created_by` as a permanent substitute for performer semantics.

## 6. Procedure Execution contract

Reuse `clinic_visit_procedures` unless implementation evidence proves the structure unsafe.

The implementation must support:
- selected/planned;
- started;
- performed;
- completed;
- not_performed;
- partially_performed;
- stopped.

Repeated clinically meaningful executions of the same procedure in one Visit must be representable through execution identity/sequence. The existing unique `(visit_id, procedure_id)` constraint is therefore a migration target and cannot remain as the final execution uniqueness rule.

Sources may include:
- Clinical Recommendation;
- Recommendation Item;
- Treatment Plan Item.

Receiving-domain source columns remain under the owning domain's schema authority where appropriate.

## 7. Clinical completion contract

Before Patient Flow is allowed to hand the Visit to pending-close, Clinical validation must:
1. determine the applicable published template version;
2. evaluate universal clinical minimums;
3. evaluate required template fields;
4. evaluate required procedure documentation;
5. evaluate required Patient Decision capture;
6. evaluate required finalization/attestation rules where configured;
7. return an explicit pass/fail result.

Patient Flow remains the authority that changes the Visit lifecycle.

Clinical validation must never create a second Visit status engine.

## 8. Template/document contract

Published template versions are immutable.

Clinical documents are versioned:
- draft;
- finalized;
- attested;
- amended/superseded.

Finalized/attested content is immutable; an amendment creates a new version preserving the prior version.

A document snapshot is not the canonical source of the clinical fact from which it was generated.

No generic cross-domain rules engine is permitted.

## 9. Legacy compatibility contract

During transition:
- `clinic_visit_sessions.clinical_notes`, `doctor_notes`, `diagnosis`, `treatment_performed`, `follow_up_required`, `follow_up_date`, `examination`, `findings`, `decision` remain available for compatibility;
- new canonical Clinical entities are the source of truth for newly implemented structured behavior;
- no new semantics are invented for legacy columns;
- free-text legacy content is preserved historically unless deterministic normalization is safe;
- free text must never be fabricated into structured facts.

## 10. Cross-domain contract

Gate 05 may emit durable clinical source references, but receiving domains keep lifecycle authority.

Examples:
- Clinical Recommendation → Treatment Plan source reference;
- Clinical Recommendation / requirement → Follow-up source reference;
- Clinical appointment requirement → Agenda source reference;
- operational requirement → Coordination source reference.

Gate 05 must not mutate another gate's lifecycle engine merely to complete its own clinical workflow.

## 11. Data-integrity contract

Every Gate 05 child entity must preserve tenant and patient integrity.

Required invariants:
- child tenant matches Visit/Patient tenant;
- child Patient matches Visit Patient where Visit-linked;
- referenced Procedure belongs to the correct tenant;
- performer belongs to the correct tenant;
- recorder belongs to the correct tenant;
- source Medical File belongs to the same patient/tenant context;
- final records cannot be silently edited;
- patient decision history is append-preserving;
- accepted/declined/deferred states remain explicit and auditable.

## 12. Commercial/entitlement boundary

Clinical architecture is not reduced by commercial package selection.

Entitlements may control which Clinical capabilities are available, but entitlement checks are external to the canonical clinical data model.

No core Clinical entity is duplicated per commercial tier.

## 13. Execution prerequisites

Gate 05 implementation may start only after:
- Gate 04 closure is independently verified;
- the current main SHA is reconciled;
- the implementation branch is created from the verified main;
- the Gate 05 migration plan is reconciled with Live `schema_migrations`;
- permission seeding and role mapping are included in the controlled migration;
- required test fixtures are defined without destroying existing project data.

## 14. Non-goals

This contract does not implement:
- Procedure Master / Specialty Library / Clinic Procedure Catalog — Gate 07;
- Treatment Plan lifecycle — Gate 06;
- Follow-up lifecycle — Gate 11;
- Agenda scheduler — Gate 04;
- Patient Portal — separate entitlement-gated scope;
- full AI clinical assistant — later capability;
- generalized interoperability — later capability.

## 15. Contract status

**FROZEN — IMPLEMENTATION-READY.**

Implementation, migration and production mutation remain **NOT STARTED**.
