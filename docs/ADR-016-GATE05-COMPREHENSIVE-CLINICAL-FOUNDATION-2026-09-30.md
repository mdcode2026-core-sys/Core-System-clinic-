# ADR-016 — Gate 05 Comprehensive Clinical Foundation and Execution Boundary

**Date:** 2026-09-30  
**Status:** Approved / Frozen for Implementation Planning  
**Scope:** Gate 05 — Clinical Care

## 1. Context

CORE SYSTEM requires a clinical foundation capable of supporting multiple medical specialties while keeping clinician interaction simple.

The existing repository and Live Supabase state already contain Visit, Patient Flow, Medical Files, Procedure, Treatment Plan, Follow-up, Agenda and Workforce foundations, but the structured Clinical source of truth is incomplete.

## 2. Decision

Gate 05 will establish a comprehensive Clinical domain using bounded canonical entities:
- Clinical Observation;
- Clinical Assessment;
- Clinical Problem;
- Clinical Decision;
- Clinical Recommendation;
- Patient Decision;
- Procedure Execution;
- Clinical Document / Note;
- Clinical Template;
- Visit Participation support.

`clinic_visit_sessions` remains the Visit foundation.
`clinical_work_sessions` remains Patient Flow execution context.
`clinic_visit_procedures` remains the starting Procedure Execution structure unless implementation evidence proves reuse unsafe.
Medical Files, Agenda, Treatment Plan, Follow-up, Workforce and Governance remain owned by their existing domains.

The Medical Record is a longitudinal projection/read model, not a mega-table.

## 3. Authorization decision

Gate 05 reuses the existing effective-permission engine.

The exact new permission keys are:
- `clinical:read`
- `clinical:write`
- `clinical:finalize`
- `clinical:attest`
- `clinical:manage_templates`
- `clinical:manage_problems`
- `clinical:manage_recommendations`
- `clinical:execute_procedures`
- `clinical:record_patient_decision`

Existing `visits:*`, `agenda:*`, and `medical_files:*` permissions retain their existing ownership and semantics.

No parallel permission engine or synonym set is allowed.

## 4. Clinical authority and provenance

Clinical decisions remain clinician-authoritative.

AI/automation may assist but cannot silently replace a clinician decision.

Authenticated account identity and professional performer identity remain separate:
- `clinic_users` = authenticated/action identity;
- `workforce_employees` = professional identity;
- performer/recorder/finalizer/attester semantics remain explicit.

## 5. Cross-domain boundary

Clinical may create source references and typed consequences, but receiving domains retain lifecycle authority:
- Agenda → appointment;
- Treatment Plan → plan lifecycle;
- Follow-up → continuity lifecycle;
- Coordination → operational work;
- Medical Files → media;
- Workforce → capability.

No generic Clinical Consequence table or universal workflow engine is created.

## 6. Compatibility / migration decision

Legacy Visit clinical columns remain during a controlled transition.

The implementation must not fabricate structured clinical facts from free text or empty JSONB.

The transition is additive/non-destructive:
schema → deterministic historical backfill where safe → canonical application cutover → retirement of deprecated writes only after evidence.

## 7. Sequencing decision

Gate 05 may reach Implementation-Ready while Gate 04 is still open, but Gate 05 implementation is blocked until Gate 04 is CLOSED / VERIFIED / PRODUCTION VERIFIED unless an explicit CSAPI dependency is documented.

Gate 06 planning may begin after Gate 05 reaches Implementation-Ready.

**No Gate 06 implementation, schema migration, Live DB mutation, runtime release or production verification may begin until BOTH Gate 04 and Gate 05 are CLOSED / VERIFIED / PRODUCTION VERIFIED.**

## 8. Consequences

This decision creates one comprehensive clinical foundation without forcing a commercial tier-specific data model or creating duplicate engines.

It also establishes a stable implementation handoff that can be executed after Gate 04 closure.

Implementation is not authorized merely by this ADR.
