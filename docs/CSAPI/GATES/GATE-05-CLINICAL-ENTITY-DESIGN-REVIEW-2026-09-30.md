# CSAPI Gate 05 — Clinical Entity Design Review
## Version 1 — 2026-09-30

Status: ARCHITECTURE REVIEW — PROVISIONAL; NO IMPLEMENTATION AUTHORIZED
Purpose: Resolve the principal entity-cardinality, actor, versioning, migration, projection, consequence, and repeated-execution questions raised by Gate 05 Canonical Entity Relationship & Lifecycle Design V1.

## 1. Cardinality baseline

Patient → Visit: 1:N.
Patient → Clinical Problem: 1:N.
Visit → Clinical Observation: 1:N.
Visit → Clinical Assessment: 0:N.
Visit → Clinical Decision: 0:N.
Visit → Clinical Recommendation: 0:N.
Visit → Procedure Execution: 0:N.
Visit → Clinical Document: 0:N.

Assessment → Observation: N:M when an Assessment explicitly cites supporting observations.
Assessment → Problem: N:M.
Decision → Assessment: N:1 or direct Visit reference when a decision does not require a formal assessment artifact.
Decision → Recommendation: 1:N.
Recommendation → Patient Decision: 0:N over time, preserving decision history.
Problem → Visit: N:M through an explicit problem-visit relationship rather than duplicating the diagnosis text on every Visit.
Problem → Observation: 0:N supporting relationship.
Problem → Recommendation: 0:N.
Recommendation → Procedure Definition: 0..N when a recommendation is composite; otherwise one recommendation should normally represent one coherent clinical action.
Recommendation → Recommendation Item: 1:N when composite recommendations are needed.
Patient Decision may exist at recommendation level and, for composite recommendations, at item level.

## 2. Visit actor participation model

Decision: introduce a supporting Visit Participation concept in Gate 05 implementation design.

Canonical person reference:
- workforce_employees identifies the clinic workforce person.
- clinic_users identifies the authenticated clinic account used to perform a governed action.

Reason:
The live Workforce model already links workforce_employees.user_id to clinic_users.id, while procedure capability is attached to workforce_employees. Therefore clinical person identity and account/action identity must not be conflated.

Visit Participation should support roles such as:
- attending clinician;
- assisting clinician;
- nurse / clinical assistant;
- technician / operator;
- observer;
- recorder;
- reviewer / attester where applicable.

The existing clinic_visit_sessions.doctor_id remains a compatibility/primary-provider context field. It must not prevent multi-actor clinical work.

clinical_work_sessions.performed_by_clinic_user_id remains the Patient Flow work-session actor. Where Clinical needs durable workforce eligibility/person semantics, it should resolve through Workforce rather than treating auth identity as the professional qualification record.

## 3. Procedure Execution actor model

Procedure Execution remains on the existing clinic_visit_procedures foundation unless schema evidence during implementation design proves that a separate table is required.

Required semantic separation:
- performed_by: the workforce actor who actually performed the procedure;
- recorded_by: the clinic user who entered/recorded the event;
- reviewed_by: optional clinical reviewer;
- attested_by: optional final signer;
- created_at / updated_at: technical persistence timestamps;
- occurred_at / performed_at: clinical execution time.

created_by remains historical technical/audit provenance and must not be repurposed silently as performed_by.

## 4. Recommendation and patient-decision semantics

Recommendation is the clinical proposal. Patient Decision is the patient's response.

Recommendation is normally atomic. For a recommendation that contains multiple independently accept/rejectable actions, use Recommendation Items as a supporting structure.

This preserves the approved Patient Decision state set including Partially Accepted without making a single free-text recommendation field carry multiple clinical decisions.

Core rule:
Recommended → Presented → Patient Decision
is separate from
Accepted → Planned → Scheduled → Performed.

## 5. Clinical Document versioning and attestation

Clinical Document is versioned clinical documentation, not a second source of truth.

Implementation design should provide:
- document identity;
- version number;
- Visit linkage;
- document type / template version;
- author/recorder;
- finalization state;
- attestation actor and time where required;
- amendment/supersession reference;
- creation and update timestamps.

Signed/final clinical content must not be silently overwritten.
An amendment creates a new semantic version while preserving the prior version for audit/history.

Existing audit_trail remains the general Governance audit mechanism. It is not replaced by a new generic provenance engine.

## 6. Legacy clinical-data migration strategy

No destructive rewrite is allowed.

Migration order:
1. Establish canonical target entities and relationships.
2. Additive backfill existing safe-to-map clinical data.
3. Verify row counts, patient/Visit relationships, and tenant integrity.
4. Preserve unmappable legacy text as historical documentation rather than inventing structured facts.
5. Dual-write only for a controlled transition if implementation evidence requires it.
6. Deprecate legacy fields only after the new canonical path is runtime verified and historical data is reconciled.

Specific mapping guidance:
- examination/findings/decision JSONB: current dataset is empty; no meaningful live backfill exists.
- clinical_notes / doctor_notes: preserve exact content as historical Clinical Document material; do not assume each legacy field is a distinct clinical entity.
- diagnosis text: may seed Clinical Problem only when semantic identity is sufficiently clear; otherwise preserve as historical Visit documentation.
- treatment_performed text: do not manufacture Procedure Executions from free text when an explicit procedure relation is unavailable.
- follow_up_required / follow_up_date: remain transitional Visit context until Gate 11 confirms the canonical Follow-up requirement path.

## 7. Clinical Template architecture

Clinical Template is configuration, not clinical data.

The template model must support:
- specialty applicability;
- visit-type applicability;
- versioning;
- sections and fields;
- structured Observation definitions;
- required / optional fields;
- conditional visibility;
- closure requirements;
- controlled workflow sequencing.

Do not build a universal generic Rules Engine as part of Gate 05.
Template evaluation may contain bounded declarative conditions required to render and validate a clinical template, while generalized cross-domain business rules remain outside this implementation.

## 8. Longitudinal Clinical Record projection

Decision: the initial Medical Record implementation is a read/query projection, not a duplicate storage table.

The projection composes canonical clinical and external-owner entities.
Initial implementation should use a server-side clinical history query/service with appropriate indexes.
A materialized/cached projection may be introduced later only if measurable performance evidence justifies it.

Timeline items must carry semantic timestamps where available:
- occurred/effective;
- scheduled;
- recorded;
- attested.

The projection must never infer clinical completion from an appointment record alone.

## 9. Cross-domain consequence contract

No generic clinical_consequences entity.

Each destination domain keeps its own lifecycle and, where necessary, stores an explicit source reference to the Clinical Decision/Recommendation.

Examples:
- Treatment Plan stores its own clinical-plan lifecycle and may reference originating clinical decision/recommendation.
- Follow-up stores its own retention lifecycle and may reference the originating clinical context.
- Agenda stores appointment truth and may receive appointment requirement/context from Clinical.
- Coordination stores operational_work_items and may reference the clinical source.

Exact receiving-side source columns are settled within the owning gate's implementation design. Gate 05 does not preempt Gate 04, Gate 06 or Gate 11 schema authority.

## 10. Repeated Procedure Execution

Decision: actual procedure execution must support repeated executions of the same Procedure Definition within one Visit.

The current unique Visit + Procedure constraint cannot be the final semantic limit because it conflates procedure identity with execution identity.

Implementation design should therefore evolve the existing execution structure toward:
Visit + Procedure Definition + distinct Execution identity/sequence.

Quantity remains quantity of that execution; it must not be used as a substitute for multiple execution events.

Partial, stopped and not-performed outcomes must remain representable.

## 11. Resulting canonical model

Core Clinical entities:
- Visit / Clinical Encounter
- Clinical Observation
- Clinical Assessment
- Clinical Problem
- Clinical Decision
- Clinical Recommendation
- Recommendation Item (supporting child where composite recommendation is needed)
- Patient Decision
- Procedure Execution
- Clinical Document
- Clinical Template

Supporting relationships:
- Visit Participation
- Problem ↔ Visit
- Assessment ↔ Observation
- Assessment ↔ Problem
- Procedure Execution ↔ Recommendation / Patient Decision / Treatment Plan Item where applicable
- Document ↔ canonical clinical facts

External owners:
- Patient / Identity → Gate 03 / Patient domain
- Procedure Definition / Clinic Procedure → Gate 07
- Treatment Plan → Gate 06
- Appointment → Gate 04
- Follow-up → Gate 11
- Operational Work → Coordination
- Medical Files → Medical Files
- Workforce capability → Workforce
- Governance audit → Governance

## 12. Architecture implications

The correct design is now more precise:

Visit is the clinical context anchor.
Clinical entities express facts, interpretation, decisions, recommendations, patient responses and actual execution.
Workforce expresses who the professional is and whether the person is eligible.
clinic_users expresses who authenticated/performed a governed system action.
Patient Flow expresses who owns/executes the clinic-day work session.
Agenda expresses when an appointment is scheduled.
Treatment Plan expresses the longitudinal treatment plan.
Follow-up expresses continuity/retention lifecycle.
Medical Record is a projection across these truths.

## 13. Implementation-design status

Current-State Reconciliation: COMPLETE — V1
Canonical Entity Relationship & Lifecycle Design: COMPLETE — V1
Entity Design Review: COMPLETE — V1 for principal architecture questions
Implementation Design: NOT STARTED
Implementation: NOT STARTED
Schema migration: NOT STARTED
Production mutation: NONE

Next required design stage:
Clinical Template / Documentation Architecture, followed by Clinical Workspace Target Interaction Design.

## 14. Documentation continuity checkpoint

A new CSAPI conversation must resume from:
Gate 05 → Current-State Reconciliation V1 → Canonical Entity Relationship & Lifecycle Design V1 → Entity Design Review V1 → Clinical Template / Documentation Architecture.

Do not reopen Gates 01–03.
Do not reinterpret Gate 04, Gate 06 or Gate 11 ownership.
Do not begin implementation or migration from this document alone.

End of document.