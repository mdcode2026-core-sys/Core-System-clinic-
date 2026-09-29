
# CSAPI Gate 05 — Clinical Current-State Reconciliation
## Version 1 — 2026-09-30

**Status:** ARCHITECTURE / CURRENT-STATE RECONCILIATION — NO IMPLEMENTATION AUTHORIZED
**Gate:** 05 — Clinical Care
**Purpose:** Reconcile the approved Gate 05 Clinical Capability Map, Ownership & Boundary Matrix, and Entity & Lifecycle Matrix against current repository and Live Supabase reality before schema/implementation design.

## 1. Inherited Gate 05 authority

Gate 05 is the active architectural workstream after Gate 04 reached Implementation-Ready.

The governing clinical principle is:

> Clinical is the heart of CORE SYSTEM. The system is incomplete if clinical work is not excellent for the clinician and does not materially improve clinical outcomes and workflow.

Approved Gate 05 direction:

- Build a comprehensive Clinical/EHR-capable foundation from the beginning.
- Keep clinician UX simple, direct, and progressively disclosed.
- Do not remove advanced clinical capabilities merely because commercial packaging may place them in higher tiers or independent add-ons.
- Commercial entitlement and clinical architecture remain separate concerns.
- Do not create duplicate domains or engines.
- Reuse existing structures where semantically correct; extend them where safe; create genuinely new bounded entities only where required.

No schema or application implementation is authorized by this document.

## 2. Evidence snapshot

Repository main tip at reconciliation:
19e010d0c46245bfc9a8017e6d045f6bbea22aaf

Primary source files inspected:
- src/domain/visit/visit.actions.ts
- src/domain/visit/visit.types.ts
- src/features/workspaces/ClinicalWorkspace.tsx
- src/features/medical-files/ui/MedicalFilesPanel.tsx
- src/features/medical-files/domain/actions.ts
- src/domain/treatment-plan/treatment-plan.actions.ts
- relevant Patient Flow / Work Session migrations and tests

Live Supabase:
- Project: core-system-clinic
- Ref: qaslsjyxjwvdoiczmhgq
- PostgreSQL 17.6.1.141
- eu-central-1
- Latest inspected migration history entry: 20260926105306

## 3. Live Clinical entity inventory

| Canonical concept | Current structure | Current evidence | Classification |
|---|---|---|---|
| Visit / Clinical Encounter | clinic_visit_sessions | 139 rows; 138 completed, 1 waiting | REUSE + EXTEND |
| Clinical Work Session | clinical_work_sessions | table exists; 0 live rows | REUSE for Patient Flow execution context |
| Clinical Observation | none | no canonical table | CREATE later |
| Assessment | none | no canonical table | CREATE later |
| Clinical Problem / Diagnosis | clinic_visit_sessions.diagnosis text | 138 non-null | CREATE canonical longitudinal entity later |
| Clinical Decision | clinic_visit_sessions.decision jsonb | column exists; 0 non-null in current data | EXTEND / bounded child entity |
| Clinical Recommendation | none | no canonical table | CREATE later |
| Patient Decision | none | no canonical table | CREATE later |
| Procedure Definition | clinic_procedures | 17 live rows | Gate 07 owner; REUSE during transition |
| Procedure Execution | clinic_visit_procedures | 138 rows; all have performed_at | REUSE + EXTEND |
| Clinical Document / Note | clinical_notes + doctor_notes + JSONB Visit sections | 138 legacy notes each; JSONB fields empty in current data | CANONICALIZATION GAP |
| Clinical Template | none | no canonical table | CREATE later |
| Medical File | medical_files | 12 rows; 9 medical_photo, 3 image | REUSE |
| Image annotations / measurements | medical_file_annotations / medical_file_measurements | both exist; 0 live rows | REUSE |
| Treatment Plan | clinic_treatment_plans + items + visits | 96 plans; 167 items; 3 links | Gate 06 owner |
| Follow-up | retention_followups | 956 rows; 924 automated, 32 manual | Gate 11 owner |
| Appointment | master_agenda_events | 413 rows | Gate 04 / Agenda owner |
| Operational Work | operational_work_items + history | 108 work items | Coordination owner |
| Provenance / Audit | audit_trail observed in repository | existing Governance audit path | REUSE; no duplicate engine |

## 4. Visit and documentation reconciliation

clinic_visit_sessions is the canonical Visit foundation and must remain so.

Current fields include lifecycle/context plus:
- clinical_notes
- doctor_notes
- diagnosis
- treatment_performed
- follow_up_required
- follow_up_date
- examination jsonb
- findings jsonb
- decision jsonb

Current Live dataset:
- 139 Visit rows
- 138 completed
- 1 waiting
- 138 clinical_notes non-null
- 138 doctor_notes non-null
- 138 diagnosis non-null
- 138 treatment_performed non-null
- 92 visits with follow_up_required = true
- 0 examination values
- 0 findings values
- 0 decision values

Current repository saveClinicalVisit behavior writes the newer JSONB fields and also mirrors findings into clinical_notes and decision into doctor_notes.

This proves a canonicalization gap. The long-term architecture must not treat legacy text, JSONB sections, and future structured entities as interchangeable truth.

Current save validation requires at least one of Examination, Findings, or Decision. This is weaker than the approved Gate 05 target of core clinical requirements plus applicable specialty/visit-type template requirements.

Decision:
Keep the Visit structure. Do not rebuild it as a medical-record mega-table. Establish explicit canonical clinical entities and make documentation reference canonical facts.

## 5. Procedure execution reconciliation

Live evidence:
- 138 clinic_visit_procedures rows
- 138 performed_at non-null
- 0 Visit/Procedure tenant mismatches
- 0 missing procedure definitions
- all 138 current rows have created_by equal to the Visit doctor_id
- one distinct creator and one distinct doctor in the current dataset

Repository addVisitProcedure currently writes:
- visit_id
- procedure_id
- quantity
- notes
- performed_at
- created_by

The table has a unique (visit_id, procedure_id) constraint.

Gate 05 conclusion:
This is a valid starting structure, but not the full Procedure Execution model.

Still needed:
- performed_by
- recorded_by
- reviewed / attested by where applicable
- explicit execution lifecycle
- not-performed / partially-performed / stopped outcomes
- support for multiple distinct execution events of the same Procedure in one Visit when clinically meaningful

created_by must not be the semantic substitute for performed_by.

## 6. Patient Flow / Clinical Work Session boundary

clinical_work_sessions is a Patient Flow execution-context structure connected to Visit, queue/events, performer, provider and room.

The live row count of zero is current-data evidence only. It does not invalidate the architecture or Gate 01 runtime verification.

Boundary remains:
- clinic_visit_sessions = canonical Visit/Encounter context
- clinical_work_sessions = Patient Flow work/execution context
- neither is a universal Medical Record

No duplicate Clinical Session engine should be introduced.

## 7. Medical Files reconciliation

Current ClinicalWorkspace passes both patientId and visitId to MedicalFilesPanel.

The upload path can persist both patient_id and visit_id.

However, the current list behavior gives patientId precedence over visitId. When both are supplied, the panel loads the patient's files rather than restricting to the Visit.

This is a Gate 05 context/UX issue, not a justification for a second file store.

Live evidence:
- 12 medical_files
- 9 medical_photo
- 3 image
- 0 with visit_id populated

The zero Visit-linked rows are dataset evidence at inspection time; the current upload path is capable of creating Visit-linked files.

## 8. Treatment Plan boundary

Live evidence:
- 96 Treatment Plans
- 167 Plan Items
- 3 Plan↔Visit links
- 0 plans with source_visit_id populated
- 106 completed Plan Items without a Plan↔Visit link

Repository implementation already treats Treatment Plan as independent and supports next-action creation into operational_work_items.

Gate 05 must not absorb Treatment Plan lifecycle.

Clinical may produce or update Treatment Plan-related clinical consequences, while Gate 06 remains lifecycle owner.

The 106 completed items without visit links are a current integration/data-state observation for Gate 06, not a reason to move ownership into Clinical.

## 9. Follow-up boundary

Live evidence:
- 956 retention_followups
- 934 open
- 21 completed
- 1 cancelled
- 440 Visit-linked
- 924 automated
- 32 manual

Gate 05 owns the clinical consequence “Follow-up required”.
Gate 11 owns Follow-up lifecycle, scheduling/execution and continuity.

Legacy Visit fields follow_up_required / follow_up_date are transitional clinical context, not a second Follow-up engine.

## 10. Clinical UX reconciliation

Current ClinicalWorkspace already provides one clinical surface containing:
- Visit context
- patient/provider/room/appointment
- Medical Files
- Examination
- Findings
- Decision
- Procedure selection
- Save / Finish
- Treatment Plan / Follow-up entry points

This is consistent with the approved principle:
simple clinician surface, complex structured backend.

But the target is not yet realized. The surface still needs direct access to:
- relevant prior clinical history
- prior procedures in longitudinal context
- active problems/diagnoses
- structured observations/measurements
- explicit recommendations and patient decisions
- Planned vs Scheduled vs Performed distinctions
- provenance and attestation
- specialty/template-driven requirements
- a full Medical Record view without overwhelming the current Visit

These are Gate 05 scope targets and do not reopen Gate 01.

## 11. Action classification

REUSE:
- clinic_visit_sessions
- clinical_work_sessions
- clinic_visit_procedures
- medical_files and image annotation structures
- Treatment Plan structures
- Follow-up structures
- Agenda structures
- Operational Work structures
- existing Governance audit path

EXTEND:
- Visit documentation boundaries
- Procedure Execution semantics
- contextual Medical File presentation
- typed cross-domain clinical consequence routing

CREATE later under the approved Gate 05 design:
- Clinical Observation
- Clinical Assessment
- longitudinal Clinical Problem / Diagnosis
- Clinical Decision
- Clinical Recommendation
- Patient Decision
- Clinical Document / Note
- Clinical Template
- only additional provenance/attestation structures that the existing Governance audit path cannot express

DO NOT CREATE:
- medical_records mega-table
- generic clinical_results
- generic clinical_consequences
- clinical_tasks
- clinical_appointments
- duplicate Procedure Catalog
- duplicate Follow-up engine
- duplicate Treatment Plan engine
- duplicate Agenda engine
- duplicate authorization engine
- duplicate Patient Record engine

## 12. Gate 05 implementation implications

The correct direction is canonical extension plus bounded clinical entities, not a Visit-table rewrite and not a new mega-domain.

Target clinical flow:

Patient / Context
→ Visit
→ History / Relevant Context
→ Examination
→ Observations
→ Assessment / Problems
→ Clinical Decision
→ Recommendation
→ Patient Decision
→ Planned
→ Scheduled
→ Performed
→ Clinical Documentation / Attestation
→ Clinical Consequences / Next Steps

Typed consequences route to owning domains:
- Treatment Plan → Gate 06
- Follow-up → Gate 11
- Appointment requirement → Agenda / Gate 04
- Operational requirement → Coordination
- Medical Files → Medical Files domain
- Financial consequences → Financial
- Resource/consumable consequences → Inventory / owning resource domain

## 13. Readiness blockers before implementation design is frozen

1. Final canonical Clinical entity relationship model.
2. Exact Visit/documentation canonicalization strategy for legacy fields + JSONB.
3. Procedure Execution lifecycle and actor/provenance model.
4. Final Observation / Assessment / Problem / Decision / Recommendation / Patient Decision relationships.
5. Clinical Template model and requirement-evaluation boundary.
6. Longitudinal Clinical Record projection definition.
7. Cross-domain clinical consequence contract.

Later-owning-gate items remain separately assigned:
- Procedure Master / Specialty / Clinic Procedure Catalog → Gate 07
- Treatment Plan lifecycle → Gate 06
- Follow-up lifecycle → Gate 11
- Agenda remediation → Gate 04
- Portal → independent entitlement-gated capability
- AI Clinical Intelligence → later, after canonical clinical data foundation
- Interoperability → later capability package

## 14. Documentation continuity checkpoint

A new CSAPI conversation must resume from:

Gate 05 → Architecture / Current-State Reconciliation V1 → Canonical Clinical Entity Relationship & Lifecycle Design

It must not reopen Gates 01, 02, or 03, reinterpret Gate 04 ownership, or start implementation before Gate 05 design is frozen.

Next work package:
Canonical Clinical Entity Relationship & Lifecycle Design

Then:
Clinical Template / Documentation Architecture

Then:
Clinical Workspace Target Interaction Design

Then:
Gate 05 Implementation Design → IMPLEMENTATION-READY

No migration or application change is authorized by this reconciliation alone.

## 15. Status

Gate 05: OPEN
Architecture: IN PROGRESS
Current-State Reconciliation: COMPLETE — V1
Clinical Capability Map: COMPLETE — V1
Ownership & Boundary Matrix: COMPLETE — V1
Entity & Lifecycle Matrix: COMPLETE — V1
Implementation: NOT STARTED
Schema migration: NOT STARTED
Production mutation: NONE
Next step: Canonical Clinical Entity Relationship & Lifecycle Design

End of checkpoint.
