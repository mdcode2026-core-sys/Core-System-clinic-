# CSAPI Gate 05 — Canonical Clinical Entity Relationship & Lifecycle Design
## Version 1 — 2026-09-30

Status: ARCHITECTURE DESIGN — FROZEN / IMPLEMENTATION-READY INPUT
Gate: 05 — Clinical Care
Prerequisite: Gate 05 Current-State Reconciliation V1
Implementation: NOT AUTHORIZED

## 1. Design objective

Define the canonical relationship model for the comprehensive Clinical foundation without turning Visit into a medical-record mega-table, creating a second Patient Flow/session engine, absorbing Treatment Plan, Follow-up, Agenda, Medical Files, Workforce, Financial or Coordination ownership, creating a generic Clinical Result / Clinical Consequence table, or creating a speculative generic Rules Engine.

The design must support future medical specialties while keeping clinician interaction simple and progressively disclosed.

## 2. Canonical clinical graph

Patient
  |
  +--> Visit / Clinical Encounter
          |
          +--> Clinical Observations
          +--> Clinical Assessment
          +--> Clinical Problems / Diagnoses
          +--> Clinical Decisions
                    |
                    +--> Clinical Recommendations
                              |
                              +--> Patient Decisions
                              +--> Treatment Plan relationship
                              +--> Follow-up requirement
                              +--> Appointment requirement
                              +--> Operational requirement
          +--> Procedure Executions
          +--> Clinical Documents / Notes
          +--> Medical Files (owned externally)

Longitudinal entities such as Clinical Problems and selected Observations may connect to multiple Visits.
Treatment Plan, Follow-up, Appointment and Operational Work remain external owner domains.

## 3. Entity responsibilities and relationships

### 3.1 Visit / Clinical Encounter
Canonical owner: Clinical / Visit, using Gate 01 Patient Flow lifecycle.
Purpose: Represents the actual patient clinical encounter/context.
Relationships:
- belongs to one Patient / clinic patient context;
- may originate from one Appointment;
- may have one or more Patient Flow clinical work-session records;
- contains many clinical observations;
- contains zero or more assessments;
- references zero or more longitudinal problems/diagnoses;
- contains zero or more clinical decisions;
- contains zero or more recommendations;
- contains zero or more procedure executions;
- contains one or more clinical documents/notes where documentation is required;
- may reference many Medical Files;
- may reference Treatment Plan and Follow-up records through explicit cross-domain relationships.
Invariant: Visit lifecycle remains independent from Treatment Plan lifecycle.

### 3.2 Clinical Observation
Canonical owner: Clinical.
Purpose: A recorded clinical fact, observation or measurement made in clinical context.
Relationships:
- belongs to one Patient;
- normally belongs to one Visit when recorded during a visit;
- may remain longitudinally relevant after the source Visit;
- may optionally reference a Clinical Problem/Diagnosis;
- may be included in an Assessment.
Measurement rule: Measurement is a typed form of Observation.
Image-based measurements remain owned by Medical Files / image annotation structures and are linked into Clinical context where appropriate.
Temporal rule: distinguish clinical occurrence/effective time from recording time.

### 3.3 Clinical Assessment
Canonical owner: Clinical.
Purpose: Clinician synthesis/interpretation of available clinical information.
Assessment is not the same thing as an Observation.
Relationships:
- belongs to a Visit;
- may reference one or more Observations;
- may reference one or more Problems/Diagnoses;
- produces or supports one or more Clinical Decisions;
- may be represented in a Clinical Document.
Lifecycle: Draft → Completed → Superseded.

### 3.4 Clinical Problem / Diagnosis
Canonical owner: Clinical.
Purpose: Longitudinal problem/condition/diagnostic anchor.
The initial canonical model should use one longitudinal Clinical Problem entity rather than separate speculative Clinical Problem and Clinical Diagnosis engines.
A problem may carry a diagnostic classification/term when applicable. A later interoperability package may add formal coding without changing ownership.
Relationships:
- belongs to one Patient;
- may be first identified in one Visit;
- may be referenced by many Visits;
- may be supported by many Observations and Assessments;
- may be addressed by many Decisions and Recommendations.
Lifecycle direction: Identified/Active → Resolved/Inactive → Superseded where applicable.
Invariant: Visit-local diagnosis text is not the long-term longitudinal source of truth.

### 3.5 Clinical Decision
Canonical owner: Clinical.
Purpose: Authoritative clinician decision made from the assessment.
A Decision is not merely free text and is not equivalent to a Recommendation.
Relationships:
- belongs to one Visit;
- normally references an Assessment and/or one or more Problems;
- may produce zero or more Recommendations;
- may produce typed cross-domain consequences.
Lifecycle: Draft → Recorded → Final → Superseded.
Authority rule: the final clinical Decision is clinician-authoritative. Automation and AI may assist but do not silently replace it.

### 3.6 Clinical Recommendation
Canonical owner: Clinical.
Purpose: Clinical proposal/action recommended to the patient or care team.
Examples: recommend a procedure; medication; observation; review; Treatment Plan; follow-up.
Relationships:
- belongs to one Clinical Decision;
- belongs to one Visit;
- may reference a Procedure Definition from Gate 07;
- may reference a Problem;
- may generate the patient decision workflow.
Lifecycle: Proposed → Presented → Patient Decision state.
A Recommendation must not be marked performed merely because it was presented or accepted.

### 3.7 Patient Decision
Canonical owner: Clinical.
Purpose: Records the patient's response to a clinical Recommendation.
Allowed conceptual states: Accepted, Declined, Deferred, Undecided, Partially Accepted.
Relationships:
- belongs to one Recommendation;
- belongs to one Patient;
- normally occurs in the Visit context where the recommendation is presented;
- may be revised only through an explicit new decision/history record.
Invariant: Patient Decision is separate from Recommendation, Treatment Plan, Appointment and Procedure Execution.
Accepted does not mean Planned. Planned does not mean Scheduled. Scheduled does not mean Performed.

### 3.8 Procedure Execution
Canonical owner: Clinical.
Definition source: Gate 07 Procedure / Clinic Procedure.
Purpose: The actual clinical performance event.
Relationships:
- belongs to one Visit;
- references exactly one Procedure Definition / clinic procedure at execution;
- may reference a Recommendation and/or Patient Decision where applicable;
- references the performer through Workforce;
- may reference a Treatment Plan item where applicable;
- may generate downstream typed consequences.
Actor semantics must distinguish at minimum: Performed by, Recorded by, Reviewed by, Attested/Signed by where required.
created_by is audit provenance and must not become a synonym for performed_by.
Lifecycle: Selected/Planned → Started → Performed → Completed.
Exceptional outcomes: Not Performed, Partially Performed, Stopped.
Granularity: One Visit plus one Procedure Definition must not be assumed to equal one actual execution forever. Multiple executions of the same procedure may be clinically legitimate.

### 3.9 Clinical Document / Note
Canonical owner: Clinical.
Purpose: Human-readable clinical documentation assembled from structured facts plus narrative.
Model: Hybrid structured + narrative.
May contain structured sections, clinician narrative, and references to Observations, Assessment, Problems, Decisions, Procedure Executions, Recommendations and Patient Decisions.
Invariant: Clinical Document is documentation of clinical truth, not a second source of truth for the same fact.
Lifecycle: Draft → Final → Attested where required → Superseded/Amended as applicable.
Amended or signed content must preserve history rather than silently overwrite prior clinical meaning.

### 3.10 Clinical Template
Canonical owner: Clinical configuration.
Purpose: Defines what a particular visit type/specialty/workflow should expose and what requirements apply.
Template defines sections, fields, structured observation types, required/optional rules, conditional visibility, specialty/visit-type applicability, closure requirements, and limited workflow sequencing where needed.
Template does not own patient clinical data.
Invariant: no universal mandatory field set is imposed on every specialty or visit.

## 4. Cross-domain consequence contract

No generic Clinical Consequences table is introduced.
A Clinical Decision or Recommendation can cause an explicit typed relationship into the owning domain.
Treatment Plan: Clinical may create/recommend/update as permitted; Gate 06 owns lifecycle.
Follow-up: Clinical may produce follow-up required/review requirement/timing context; Gate 11 owns lifecycle.
Appointment: Clinical may produce an appointment requirement and context; Agenda owns scheduling.
Operational Work: Clinical may request an operational action; Coordination owns operational_work_items lifecycle.
Medical Files: Clinical may require or reference clinical media; Medical Files owns storage and media lifecycle.
Financial / Inventory: Clinical may produce typed requirements; those domains own their corresponding truth.

## 5. Longitudinal Medical Record / Timeline

The Medical Record is a read model / projection, not a new mega-table.
The Clinical Record view composes Visits, Problems/Diagnoses, Observations, Assessments, Decisions, Recommendations, Patient Decisions, Procedure Executions, Clinical Documents, Treatment Plans, Follow-up, Medical Files, and relevant Agenda history where appropriate.
Timeline semantics must distinguish clinical occurrence/effective time, scheduled time, documentation/recording time, and attestation time.
The timeline must never imply that a scheduled event was performed merely because it exists in Agenda.
UX rule: current Visit first; deeper longitudinal history available through one-click access without overwhelming the current clinical workspace.

## 6. Provenance and attestation model

Existing audit_trail remains the general Governance audit path.
Gate 05 must not create a second generic audit engine.
Clinical-specific provenance remains required at entity level where audit alone cannot answer clinical questions, including who performed a procedure, who recorded a note, who reviewed a result, who attested a clinical document, and when a fact occurred versus when it was documented.
Use dedicated semantic fields/relationships on the owning clinical entities where needed; Governance supplies the broader audit history.

## 7. Identity and tenant invariants

Every canonical clinical entity must remain bound to tenant and patient context, plus source Visit where applicable.
Cross-tenant references are forbidden.
Patient identity is inherited from Gate 03 and must not be duplicated inside Clinical.
A patient's global identity does not by itself authorize access to another clinic's clinical history.

## 8. Deletion / amendment semantics

Clinical history is auditable historical data.
Normal correction should prefer amend, supersede, resolve, mark not performed, or explicit cancellation where valid.
Hard deletion requires the existing controlled destructive-change gate.

## 9. Commercial / entitlement boundary

Clinical architecture and commercial packaging are separate.
The model must support Clinical Core, Advanced Clinical, Specialty Packs, Clinical Intelligence, and Independent Add-ons.
Entitlement controls exposure/activation, not the existence of the architectural capability.
A disabled advanced capability must not corrupt the core Visit or Patient Journey.

## 10. Target minimal canonical data hierarchy

Patient
  ↓
Visit
  ├── Observation
  ├── Assessment
  ├── Problem/Diagnosis references
  ├── Decision
  │     └── Recommendation
  │            └── Patient Decision
  ├── Procedure Execution
  └── Clinical Document / Note

Longitudinal across Visits: Problem / Diagnosis, selected Observations, Clinical history projection.
External owner domains: Procedure Definition / Clinic Procedure → Gate 07; Treatment Plan → Gate 06; Appointment → Gate 04; Follow-up → Gate 11; Operational Work → Coordination; Medical Files → Medical Files; Workforce capability → Workforce; Financial → Financial; Inventory / consumables → owning domain; Governance audit → Governance.

## 11. Implementation consequences

Preserve: clinic_visit_sessions, clinical_work_sessions, clinic_visit_procedures, medical_files, existing Treatment Plan, Follow-up, Agenda, Coordination, and Governance structures.
Likely first-class Gate 05 entities: Clinical Observation, Clinical Assessment, Clinical Problem, Clinical Decision, Clinical Recommendation, Patient Decision, Clinical Document, Clinical Template.
Controlled extensions: Procedure Execution semantics, Visit/documentation canonicalization, contextual Medical File presentation, and typed cross-domain source references.
Explicitly rejected: medical_records mega-table, generic clinical_results, generic clinical_consequences, clinical_tasks, clinical_appointments, duplicate Procedure Catalog, duplicate Follow-up engine, duplicate Treatment Plan engine, duplicate Agenda engine, duplicate authorization engine, duplicate Patient Record engine.

## 12. Open design details before implementation design is frozen

1. Exact relational cardinalities and foreign-key strategy for Observation, Assessment, Problem, Decision, Recommendation and Patient Decision.
2. Whether multi-actor Visit participation needs a supporting Visit Participation structure or can safely reuse existing provider/actor fields.
3. Exact versioning/attestation fields for Clinical Documents and other signed clinical artifacts.
4. Canonical migration strategy from current Visit legacy fields and JSONB into the future model without losing history.
5. Template schema and requirement-evaluation boundary without a generic rules engine.
6. Exact projection strategy for the longitudinal Clinical Record.
7. Required source references for typed Treatment Plan / Follow-up / Agenda / Coordination consequences.
8. Procedure Execution model for repeated same-procedure executions and partial/stopped execution.

These are architecture details, not Product Owner blockers unless they materially change approved clinical workflow or cross-domain ownership.

## 13. Gate 05 continuity checkpoint

A new CSAPI conversation must resume from:
Gate 05 → frozen architecture package → Execution Contract / Implementation Plan / Verification Plan → IMPLEMENTATION-READY → controlled implementation after Gate 04 closure.

Do not reopen Gates 01–03, reinterpret Gate 04 ownership, move Treatment Plan or Follow-up ownership into Clinical, or begin schema implementation from this design alone.

## 14. Status

Gate 05: OPEN
Current-State Reconciliation: COMPLETE — V1
Canonical Entity Relationship & Lifecycle Design: COMPLETE — V1 / PROVISIONAL
Implementation Design: COMPLETE — FROZEN
Implementation: NOT STARTED
Schema migration: NOT STARTED
Production mutation: NONE
Next step: controlled Gate 05 implementation after Gate 04 closure; no new architecture review is pending within this frozen scope.

End of document.

## Final architecture freeze — 2026-09-30

This V1 design is now **FROZEN** as the Gate 05 canonical entity and lifecycle baseline for implementation.

No unresolved entity cardinality, lifecycle ownership, actor/provenance, versioning, cross-domain ownership, or longitudinal-record architecture question remains within the approved Gate 05 scope.

Implementation is still controlled by the Gate 04 → Gate 05 sequencing barrier; this document does not authorize implementation by itself.
