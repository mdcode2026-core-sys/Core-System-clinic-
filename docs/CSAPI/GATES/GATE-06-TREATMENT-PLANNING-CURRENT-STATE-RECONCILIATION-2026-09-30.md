# CSAPI Gate 06 — Treatment Planning — Current-State Reconciliation
## 2026-09-30

**Status:** Planning / reconciliation in progress  
**Implementation:** NOT STARTED  
**Schema migration:** NOT STARTED  
**Production mutation:** NONE

## 1. Scope
Gate 06 owns the Treatment Plan lifecycle: plan creation/activation/hold/completion/cancellation, stage/item lifecycle, plan-to-visit linkage semantics, plan next-action generation, and integration contracts with Agenda, Clinical, Financial/Commercial and Follow-up without absorbing their ownership.

Gate 06 does not own appointment scheduling, clinical decision authority, patient identity, visit lifecycle, follow-up continuity, procedure catalog, or operational-work lifecycle.

## 2. Current canonical implementation
Repository main currently contains:
- `src/domain/treatment-plan/treatment-plan.actions.ts`
- `src/domain/treatment-plan/treatment-plan.types.ts`
- `src/domain/treatment-plan/treatment-plan-procedures.actions.ts`
- `src/features/treatment-plans/TreatmentPlanWorkspace.tsx`
- `src/features/patient-context/PatientContextPanel.tsx`

The current domain writes directly through Supabase client calls after application-level effective-permission checks. The current migration lineage originates in `20260822230608_pj_stage8_treatment_plan.sql`, with later integrity, soft-delete, demo-data and next-action hardening migrations.

## 3. Current canonical database state
Live Supabase project `core-system-clinic` is healthy in `eu-central-1`.

The live database contains:
- `clinic_treatment_plans`;
- `clinic_treatment_plan_items`;
- `clinic_treatment_plan_visits`;
- `operational_work_items` / `operational_work_history`;
- `master_agenda_events`;
- `clinic_visit_sessions`;
- `clinic_procedures`;
- `permissions` and the existing effective-permission engine.

The live Treatment Plan foundation is populated (the table inventory reports 96 plans) and is therefore not an empty future feature.

## 4. Current entity semantics
Treatment Plan currently has:
- plan status: draft / active / on_hold / completed / cancelled;
- item status: planned / scheduled / in_progress / completed / skipped / cancelled;
- patient-specific ownership;
- optional source visit;
- ordered plan items;
- optional procedure reference;
- planned date and quantity;
- explicit visit links;
- package reference in current live schema;
- soft-delete columns in current live schema.

The database contains tenant-safe composite relationships for plan → patient, source visit, creator, package and plan-item/visit relationships.

## 5. Current next-action behavior
The current implementation derives an operational-work item from the first eligible plan item when an item is marked completed. The work item is a coordination consequence, not Treatment Plan truth.

The canonical derived state is:
`operational_work_items` with `kind='next_action'`, `source_type='treatment_plan_item'`, `source_id=<plan item>`.

A partial unique index exists so one Treatment Plan stage has at most one active next-action work item.

The current implementation may classify a next action as booking-required when `planned_date` exists. Gate 06 must replace this implicit heuristic with an explicit, durable contract rather than allowing date presence to determine domain ownership.

## 6. Current Agenda boundary
Agenda owns appointment truth in `master_agenda_events`. Treatment Plan must never create or mutate an appointment directly.

The correct boundary is:
**Treatment Plan stage → clinical/operational next action → Coordination work → Agenda booking when an appointment is required.**

The recurring E2E history confirms this boundary: Treatment Plan status transition was corrected so the user explicitly presses **Update** before the transition becomes committed and produces the downstream booking work item. No Agenda domain logic was changed by that correction.

## 7. Current Clinical boundary
Gate 05 explicitly keeps Treatment Plan as a separate Gate 06 owner. Clinical may produce source decisions/recommendations and may consume Treatment Plan outcomes, but Clinical does not own plan lifecycle.

Treatment Plan may later carry typed source references to Clinical decisions/recommendations, but receiving-side Clinical schema is not changed by Gate 06 unless explicitly required by the Gate 06 contract.

## 8. Current Follow-up boundary
Follow-up is Gate 11. Review is part of Follow-up, not Treatment Plan. A plan may produce a clinically meaningful next action that later becomes follow-up work, but Treatment Plan must not become the retention/communication engine.

## 9. Current known weaknesses to reconcile
1. Plan and item write authority is application-only; no protected database command boundary comparable to newer CSAPI patterns has been established.
2. Item status transition rules are permissive: arbitrary status changes are accepted by the current action.
3. Plan status transitions are also permissive and lack a single transition matrix.
4. Completion of an item can create next action, but the rule for which item becomes next is implicit and not modeled as a lifecycle invariant.
5. Next-action type is inferred from `planned_date`; this is not a stable business contract.
6. Visit linking may immediately mark an item completed, conflating “visit linked” with “stage clinically completed”.
7. Plan completion is user-driven and does not enforce a canonical stage-completion rule.
8. Plan/item audit and provenance are not a dedicated lifecycle boundary.
9. Current permissions are legacy `treatment_plans:*` keys and need reconciliation with the platform's later capability/permission architecture; no rename is authorized yet.
10. Package linkage exists in the database but its Gate 07/08 ownership semantics must remain external to Gate 06.
11. Existing E2E evidence proves important continuity paths but does not constitute Gate 06 closure.

## 10. Current migration/repository reality
Live migration history is materially ahead/different from repository main. This is a known project-wide lineage condition and must be treated as evidence, not repaired opportunistically during Gate 06 planning.

No Gate 06 migration is created or applied during planning.

## 11. Reconciliation conclusion
Treatment Plan is a real existing domain with a canonical database foundation and a functioning application surface, but its lifecycle authority is incomplete and partly encoded as client/server-action behavior rather than explicit lifecycle rules.

Gate 06 therefore must **harden and formalize the existing Treatment Plan authority**, not create a second Treatment Plan engine or replace it wholesale.

## 12. Planning gate
This document is a planning evidence record only. No implementation, migration, Live DB mutation, runtime release or production verification is authorized by it.
