# CSAPI Gate 05 — Clinical Implementation Design
## Version 1 — 2026-09-30

Status: IMPLEMENTATION DESIGN — FROZEN / IMPLEMENTATION-READY
Gate: 05 — Clinical Care
Implementation: NOT STARTED
Production mutation: NONE
Design authority: This document plus prior Gate 05 architecture/reconciliation records on the same architecture branch.

## 1. Implementation objective

Implement the Gate 05 Clinical foundation as a comprehensive, specialty-capable clinical model while preserving the simple Clinical Workspace and all established cross-domain ownership boundaries.

Execution must be additive, non-breaking and evidence-driven.

Inspect → Reuse → Extend → Create.

## 2. Existing structures to preserve

Preserve as canonical foundations:
- clinic_visit_sessions for Visit context/lifecycle;
- clinical_work_sessions for Patient Flow execution context;
- clinic_visit_procedures as the starting actual-procedure structure;
- medical_files and medical_file_* structures for Medical Files;
- clinic_treatment_plans / items / visits for Gate 06;
- retention_followups for Gate 11;
- master_agenda_events for Gate 04;
- operational_work_items / operational_work_history for Coordination;
- workforce_employees and workforce_procedure_capabilities for professional identity/eligibility;
- audit_trail for Governance audit.

Do not create a parallel engine for any of the above.

## 3. New canonical Clinical structures

### 3.1 Clinical Observation

Proposed table: clinical_observations.
Minimum semantic fields:
- id;
- tenant_id;
- patient_id;
- visit_id nullable;
- observation_type_key;
- value_payload;
- unit_code nullable;
- effective_at;
- recorded_at;
- performed_by_workforce_employee_id nullable;
- recorded_by_clinic_user_id;
- status;
- source_medical_file_id nullable;
- created_at / updated_at;
- deleted_at only where the established domain policy permits.

Value payload may be typed JSONB, but observation_type_key remains the stable semantic key.
Image-specific measurements remain owned by Medical Files and are linked as source context.

Required indexes:
- tenant + patient + effective_at;
- tenant + visit + effective_at;
- tenant + observation_type_key + effective_at.

RLS must enforce tenant isolation and clinical read/write permissions.

### 3.2 Clinical Assessment

Proposed table: clinical_assessments.
Fields:
- id;
- tenant_id;
- patient_id;
- visit_id;
- summary / narrative;
- status;
- authored_by_clinic_user_id;
- finalized_by_clinic_user_id nullable;
- finalized_at nullable;
- superseded_by_id nullable;
- created_at / updated_at.

Supporting links:
- clinical_assessment_observations(assessment_id, observation_id);
- clinical_assessment_problems(assessment_id, problem_id).

### 3.3 Clinical Problem

Proposed table: clinical_problems.
Fields:
- id;
- tenant_id;
- patient_id;
- problem_type;
- display_name;
- normalized_code nullable;
- coding_system nullable;
- status;
- onset_at nullable;
- resolved_at nullable;
- first_identified_visit_id nullable;
- created_by_clinic_user_id;
- created_at / updated_at;
- deleted_at only under controlled policy.

Supporting relationship:
- clinical_problem_visits(problem_id, visit_id, relevance/status metadata).

This is the longitudinal canonical diagnosis/problem anchor. The current Visit diagnosis text remains transitional history.

### 3.4 Clinical Decision

Proposed table: clinical_decisions.
Fields:
- id;
- tenant_id;
- patient_id;
- visit_id;
- assessment_id nullable;
- decision_type;
- decision_text / structured_summary;
- rationale nullable;
- status;
- authored_by_clinic_user_id;
- finalized_by_clinic_user_id nullable;
- finalized_at nullable;
- superseded_by_id nullable;
- created_at / updated_at.

Lifecycle enforcement:
Draft → Recorded → Final → Superseded.

### 3.5 Clinical Recommendation

Proposed table: clinical_recommendations.
Fields:
- id;
- tenant_id;
- patient_id;
- visit_id;
- decision_id;
- recommendation_type;
- title;
- narrative/details;
- status;
- created_by_clinic_user_id;
- presented_at nullable;
- created_at / updated_at.

Supporting child:
clinical_recommendation_items.
Item fields:
- id;
- recommendation_id;
- action_type;
- procedure_id nullable;
- service_id nullable where Gate 07 schema is available;
- quantity nullable;
- details;
- sequence_no;
- created_at / updated_at.

Atomic recommendations remain preferred. Recommendation Items exist for composite recommendations and preserve Partial Acceptance semantics without using one free-text field for multiple actions.

### 3.6 Patient Decision

Proposed table: patient_decisions.
Fields:
- id;
- tenant_id;
- patient_id;
- visit_id;
- recommendation_id;
- recommendation_item_id nullable;
- decision_state;
- decision_at;
- recorded_by_clinic_user_id;
- patient_statement / notes nullable;
- supersedes_decision_id nullable;
- created_at.

Allowed states:
Accepted, Declined, Deferred, Undecided, Partially Accepted.

Final Declined must not silently become Accepted through an unrelated system mutation.

### 3.7 Visit Participation

Proposed table: clinical_visit_participants.
Fields:
- id;
- tenant_id;
- visit_id;
- workforce_employee_id;
- participation_type;
- is_primary;
- started_at nullable;
- ended_at nullable;
- added_by_clinic_user_id;
- created_at / updated_at.

Professional identity references workforce_employees.
Authenticated action identity remains clinic_users.

The current clinic_visit_sessions.doctor_id remains compatibility/primary-provider context until a later controlled migration proves the new participation model can replace all required reads.

### 3.8 Clinical Document

Proposed aggregate:
- clinical_documents;
- clinical_document_versions.

Document header:
- id;
- tenant_id;
- patient_id;
- visit_id nullable;
- document_type;
- current_version_no;
- status;
- created_at / updated_at.

Document version:
- id;
- document_id;
- version_no;
- template_version_id nullable;
- narrative_content;
- structured_snapshot;
- authored_by_clinic_user_id;
- finalized_by_clinic_user_id nullable;
- finalized_at nullable;
- attested_by_clinic_user_id nullable;
- attested_at nullable;
- amendment_of_version_id nullable;
- created_at.

Finalized/attested versions are immutable.
structured_snapshot is a documentation snapshot, not the canonical source of clinical facts.

### 3.9 Clinical Template

Proposed aggregate:
- clinical_templates;
- clinical_template_versions.

Template header:
- id;
- scope;
- specialty_key nullable;
- visit_type_key nullable;
- tenant_id nullable for clinic-specific configuration;
- name;
- status;
- created_at / updated_at.

Template version:
- id;
- template_id;
- version_no;
- definition_json;
- published_at nullable;
- retired_at nullable;
- created_at.

definition_json contains sections/fields and bounded local conditions.
Published versions are immutable.

## 4. Visit extension

clinic_visit_sessions may be extended with:
- clinical_template_version_id nullable;
- clinical_completion_state only if required by the implementation boundary and without duplicating Patient Flow session_status.

Do not create a second Visit status engine.

Legacy fields remain during migration:
- clinical_notes;
- doctor_notes;
- diagnosis;
- treatment_performed;
- follow_up_required;
- follow_up_date;
- examination;
- findings;
- decision.

They become explicitly transitional and must not receive new competing meanings.

## 5. Procedure Execution extension

Extend clinic_visit_procedures rather than creating clinical_procedure_executions unless schema review proves reuse unsafe.

Add semantic execution fields:
- execution_sequence;
- execution_status;
- started_at;
- completed_at;
- performed_by_workforce_employee_id nullable;
- recorded_by_clinic_user_id nullable;
- reviewed_by_clinic_user_id nullable;
- attested_by_clinic_user_id nullable;
- outcome_code nullable;
- source_clinical_recommendation_id nullable where cross-domain design permits;
- source_recommendation_item_id nullable where appropriate;
- source_treatment_plan_item_id nullable where Gate 06 contract permits.

Execution status values must support:
planned/selected, started, performed, completed, not_performed, partially_performed, stopped.

Remove the semantic limitation imposed by unique(visit_id, procedure_id).
Use an execution identity/sequence boundary so repeated executions are representable.
Quantity remains quantity for one execution event.

Keep created_by for backward compatibility until the migration is complete.

## 6. Cross-domain source-reference contract

Gate 05 may define source semantics but does not modify another gate's ownership without that gate's design authority.

Receiving domains should use explicit source references where a durable relationship is clinically meaningful.

Examples:
- Treatment Plan may reference source clinical decision/recommendation.
- Follow-up may reference source clinical requirement/recommendation.
- Agenda may reference the clinical recommendation/request that caused an appointment requirement.
- Coordination work may reference the originating clinical source.

Actual receiving-side schema changes are executed only in the owning gate's controlled package.

## 7. Canonical clinical command boundaries

Clinical server actions should be the only application-level write path for new Gate 05 clinical entities.

Conceptual commands:
- createObservation;
- updateObservation only while editable;
- createAssessment;
- finalizeAssessment;
- createProblem;
- resolveProblem;
- createDecision;
- finalizeDecision;
- createRecommendation;
- recordPatientDecision;
- createProcedureExecution;
- updateProcedureExecutionState;
- createClinicalDocument;
- finalizeClinicalDocument;
- attestClinicalDocument;
- amendClinicalDocument;
- completeClinicalVisitClinicalValidation.

Each command must:
1. authenticate actor;
2. resolve tenant;
3. resolve effective permissions;
4. validate entity ownership and current lifecycle state;
5. validate patient/Visit tenant integrity;
6. persist atomically where multiple writes form one clinical action;
7. write Governance audit where required;
8. return explicit domain errors.

No client-side direct mutation for canonical Gate 05 writes.

## 8. Permission model — FROZEN

Reuse the existing effective-permission engine. Gate 05 does not create a second authorization engine.

### Existing permissions retained
- `visits:read` — current Visit read compatibility.
- `visits:update` — current Visit/Patient Flow-compatible Visit editing.
- All existing `medical_files:*` permissions remain owned by Medical Files.
- All existing `agenda:*` permissions remain owned by Agenda.

### Canonical new Gate 05 permission keys
The following exact permission keys are frozen for the Gate 05 implementation migration:
- `clinical:read`
- `clinical:write`
- `clinical:finalize`
- `clinical:attest`
- `clinical:manage_templates`
- `clinical:manage_problems`
- `clinical:manage_recommendations`
- `clinical:execute_procedures`
- `clinical:record_patient_decision`

These names are implementation authority, not current-live rows. The current Live registry has no `clinical:*` keys; the Gate 05 migration will seed exactly these keys into the existing `public.permissions` registry and connect them through the existing role/effective-permission mechanism. No synonym set is permitted.

### Command authorization mapping
| Operation | Required permission |
|---|---|
| Read canonical Clinical entities / Clinical Record projection | `clinical:read` |
| Create or edit Observation / Assessment / Decision / Document draft | `clinical:write` |
| Problem create/update/resolve | `clinical:manage_problems` |
| Recommendation create/update/present | `clinical:manage_recommendations` |
| Patient Decision recording | `clinical:record_patient_decision` |
| Procedure Execution create/update | `clinical:execute_procedures` |
| Finalize an applicable clinical entity/document | `clinical:finalize` |
| Attest an applicable clinical document | `clinical:attest` |
| Create/update/publish/retire template configuration | `clinical:manage_templates` |

Where an operation changes an entity that also requires finalization or attestation, both the base action permission and the finalization/attestation permission are required.

Procedure Execution additionally validates Workforce capability for the selected performer where a capability-controlled procedure is involved. Permission grants are never treated as medical capability.

### Pre-existing compatibility boundary
The new structured Clinical entities use `clinical:*` permissions. The existing Visit lifecycle continues using its established `sessions:*` / `visits:*` permissions according to the owning Patient Flow / Visit commands. Gate 05 does not rename or duplicate those permissions.

## 9. Clinical template validation contract

Before clinical handoff to Gate 01 pending-close:
1. determine applicable published template version;
2. evaluate universal clinical minimums;
3. evaluate template required fields;
4. evaluate required procedure documentation;
5. evaluate required patient decision capture;
6. evaluate required document finalization/attestation;
7. return clinical completion result.

Gate 01 Patient Flow remains the authority that transitions the Visit to pending-close.

## 10. Legacy migration plan

Phase A — schema introduction
- create new canonical tables and support relations;
- add RLS and permissions;
- add new Procedure Execution fields;
- add Visit template-version link;
- no removal of legacy columns.

Phase B — historical backfill
- create Clinical Documents from trustworthy legacy clinical_notes / doctor_notes content;
- preserve diagnosis text as historical documentation unless it can be safely normalized into a Clinical Problem;
- do not manufacture Procedure Executions from treatment_performed free text;
- do not infer examination/findings/decision because current Live data is empty in those JSONB fields;
- preserve follow-up legacy fields until Gate 11 confirms the receiving lifecycle.

Phase C — application cutover
- new Clinical Workspace writes canonical entities;
- legacy fields become compatibility/read-only where appropriate;
- controlled dual-write may be used only if needed for safe transition.

Phase D — retirement
- verify zero new legacy writes;
- verify historical reconciliation;
- remove deprecated write paths only through a dedicated migration/verification package.

## 11. Longitudinal Clinical Record implementation

Initial implementation:
- server-side Clinical Record query/service;
- composition from canonical source entities;
- filters by patient, date, type and relevance;
- no duplicate medical_records table.

Optional later optimization:
- materialized/cache projection only after measurable query-performance evidence.

## 12. Verification contract

### Structural
- all new tables exist;
- PK/FK constraints correct;
- tenant composite integrity where required;
- RLS enabled and tested;
- required indexes exist;
- published template versions immutable;
- Procedure Execution repeated-event uniqueness works;
- no accidental duplicate engines.

### Authorization
- unauthorized clinical reads denied;
- unauthorized writes denied;
- tenant crossing denied;
- finalize/attest protected;
- template management protected;
- procedure execution protected by effective permission and Workforce capability where configured.

### Lifecycle
- each valid state transition passes;
- invalid transition fails;
- final clinical content cannot be silently edited;
- amendment preserves prior version;
- patient decision history preserved;
- declined recommendation cannot be silently represented as accepted/performed.

### Clinical integrity
- Visit belongs to Patient/tenant;
- all child clinical entities preserve patient/tenant;
- Procedure Execution references valid Clinic Procedure;
- performer references valid Workforce employee when supplied;
- recorder references valid clinic user;
- Medical File source remains in Medical Files ownership.

### Cross-domain
- Treatment Plan remains independent;
- Follow-up remains independent;
- Agenda remains appointment owner;
- Coordination remains work owner;
- Patient Flow remains Visit lifecycle owner.

### UX / E2E
- clinician can complete a normal Visit without opening advanced panels;
- relevant history opens without losing current Visit context;
- recommendation and patient decision are visibly distinct;
- planned/scheduled/performed are visually distinct;
- photo capture/upload does not block continued clinical work;
- finish validates clinical requirements before Patient Flow handoff.

## 13. Non-goals

Not part of Gate 05 implementation:
- Procedure Master / Specialty Library / Clinic Procedure Catalog implementation → Gate 07;
- Treatment Plan lifecycle redesign → Gate 06;
- Follow-up lifecycle redesign → Gate 11;
- Agenda scheduler implementation → Gate 04;
- portal implementation → separate entitlement-gated scope;
- full AI clinical assistant → later capability;
- generalized interoperability package → later capability;
- generic enterprise rules engine.

## 14. Implementation sequence

1. Freeze Gate 05 implementation design.
2. Assert the frozen permission/naming contract against the migration and generated types; no architectural rename or second permission engine is permitted.
3. Create isolated Gate 05 implementation branch.
4. Implement canonical schema additions and Procedure Execution extension.
5. Implement RLS, permissions and domain write actions.
6. Implement Clinical Template evaluator.
7. Implement document/version/attestation flow.
8. Implement Clinical Workspace against canonical actions.
9. Execute structural and authorization tests.
10. Execute local production runtime tests.
11. Execute authenticated E2E clinical scenarios.
12. Integrate with Gate 01 verified Visit lifecycle.
13. Integrate only required Gate 06 / Gate 11 / Gate 04 contracts without absorbing ownership.
14. Main merge only after required evidence passes.
15. Production verification of exact main SHA.
16. Documentation reconciliation and Gate 05 closure.

## 15. Gate 05 implementation-ready status

Gate 05 Architecture: COMPLETE — V1
Current-State Reconciliation: COMPLETE — V1
Canonical Entity Relationship & Lifecycle Design: COMPLETE — V1
Entity Design Review: COMPLETE — V1
Clinical Template & Documentation Architecture: COMPLETE — V1
Clinical Workspace Target Interaction Design: COMPLETE — V1
Implementation Design: COMPLETE — V1
Implementation: NOT STARTED
Schema migration: NOT STARTED
Production mutation: NONE

Gate 05 is therefore:
**IMPLEMENTATION-READY — PLANNING/TRANSFER ONLY**

Implementation-ready does not mean implemented or verified.

## 16. Continuity checkpoint

New CSAPI conversation resume point:
Gate 05 → IMPLEMENTATION-READY → wait for Gate 04 closure → controlled implementation → BUILD/TEST → VERIFY → REVIEW → RECONCILE → DOCUMENT → CLOSE.

Do not reopen Gates 01–03.
Do not reinterpret Gate 04 ownership.
Do not move Treatment Plan or Follow-up lifecycle ownership into Clinical.
Do not implement Gate 05 before Gate 04 closure unless an explicit CSAPI dependency is recorded. Do not use older drafts as execution authority.

End of document.

## Final implementation-readiness reconciliation — 2026-09-30

The final unresolved planning item was the authorization/naming boundary. It is now frozen above.

Readiness conditions now satisfied:
- current repository and Live Supabase reconciliation completed;
- canonical Clinical entity/lifecycle model frozen;
- actor and provenance model frozen;
- Procedure Execution repetition semantics and legacy compatibility strategy frozen;
- Clinical Template/documentation architecture frozen;
- Clinical Workspace target frozen;
- exact Gate 05 permission keys and command mapping frozen;
- cross-domain source-reference ownership frozen;
- implementation sequence frozen;
- verification requirements frozen in the Gate 05 Verification Plan;
- no unresolved Product Owner decision remains within the approved Gate 05 scope.

Implementation remains **NOT STARTED** and no migration/production mutation is authorized by this planning document.
