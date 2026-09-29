# CORE SYSTEM — CSAPI Gate 05 — Implementation-Ready Closure
## Version 1 — 2026-09-30

**Gate:** 05 — Clinical Care  
**Status:** **OPEN — IMPLEMENTATION-READY**  
**Implementation:** **NOT STARTED**  
**Schema migration:** **NOT STARTED**  
**Production mutation:** **NONE**

## 1. Purpose

This record closes the Gate 05 **planning/readiness stage**. It does not close Gate 05 itself.

## 2. Readiness evidence

The following planning stages are complete and frozen:
- Current-State Reconciliation;
- Clinical Capability Map;
- Ownership & Boundary Matrix;
- Canonical Entity Relationship & Lifecycle Design;
- Entity Design Review;
- Clinical Template / Documentation Architecture;
- Clinical Workspace Target Interaction Design;
- Clinical Implementation Design;
- Clinical Execution Contract;
- Clinical Implementation Plan;
- Clinical Verification Plan.

## 3. Final blocker resolution

The previously unresolved authorization/naming item is closed.

Exact Gate 05 permission keys are frozen:
`clinical:read`  
`clinical:write`  
`clinical:finalize`  
`clinical:attest`  
`clinical:manage_templates`  
`clinical:manage_problems`  
`clinical:manage_recommendations`  
`clinical:execute_procedures`  
`clinical:record_patient_decision`

The current Live database does not yet contain these `clinical:*` rows. That is expected and is not a readiness defect: they are explicitly part of the future Gate 05 implementation migration using the existing `public.permissions` registry and effective-permission engine.

Existing `visits:*`, `medical_files:*`, `agenda:*` permissions remain unchanged.

## 4. Cross-domain readiness

Frozen ownership:
- Visit lifecycle → Patient Flow / Visit;
- Appointment → Gate 04 Agenda;
- Clinical progression / Treatment Plan → Gate 06;
- Follow-up → Gate 11;
- Procedure Definition / Catalog → Gate 07;
- Workforce capability → Workforce;
- Medical Files → Medical Files;
- Operational Work → Coordination;
- Audit → Governance.

No duplicate engine is authorized.

## 5. Implementation barrier

**Gate 04 is still OPEN — IMPLEMENTATION-READY and is the active sequential implementation workstream.**

Gate 05 implementation must not start until Gate 04 is CLOSED / VERIFIED / PRODUCTION VERIFIED unless a concrete CSAPI dependency is explicitly recorded.

After Gate 05 reaches Implementation-Ready, Gate 06 planning may begin in a new CSAPI conversation.

**No Gate 06 application implementation, schema migration, Live DB mutation, runtime release or production verification may begin until BOTH Gate 04 and Gate 05 are CLOSED / VERIFIED / PRODUCTION VERIFIED.**

## 6. New-conversation continuation

The next CSAPI conversation may begin with:
**CSAPI**

Its purpose is to perform the same evidence-first Decision → Reconciliation → Design → Implementation-Ready process for **Gate 06 — Treatment Planning**.

That conversation must:
- restore from current repository/DB/runtime evidence;
- not assume this record is still current without reconciliation;
- not start Gate 06 implementation;
- not change Gate 04 or Gate 05 ownership;
- reach Gate 06 Implementation-Ready only;
- leave actual Gate 06 implementation blocked by the two-gate barrier above.

## 7. Final readiness statement

**Gate 05 planning is Implementation-Ready as of 2026-09-30.**

This is an implementation transfer point, not implementation completion and not gate closure.

Confidence: High, based on repository and Live Supabase reconciliation plus synchronized planning artifacts and successful documentation/workstream checks on the Gate 05 planning candidate.
