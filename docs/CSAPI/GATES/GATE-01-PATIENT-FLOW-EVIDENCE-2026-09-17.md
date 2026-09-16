# CSAPI Gate 01 — Patient Flow Evidence Reconciliation

**Date:** 2026-09-17
**Gate:** 01 — Patient Flow
**Status:** UNDER REVIEW
**Canonical branch:** `architecture/csapi-decision-gates-2026-09-16`
**Repository evidence reviewed:** `883995de41bb142ff4648a5f869beb9e8cea204e` and current CSAPI branch files
**Live Supabase project:** `core-system-clinic` (`qaslsjyxjwvdoiczmhgq`)
**Live database:** PostgreSQL 17.6.1.141, `eu-central-1`
**Latest live migration observed:** `20260915151711 optimize_clinic_patients_select_rls`

## 1. Evidence boundary

This is the first Gate 01 reconciliation record. It records verified repository and live database evidence only. It does not approve implementation changes and does not close Gate 01.

## 2. Verified lifecycle authority

The current repository contains a single explicit transition authority in `src/domain/queue/queue.engine.ts` and server-side transition actions in `src/domain/queue/workspace.actions.ts`.

The transition graph is:

```text
waiting → in_consultation → pending_close → completed
   │             │                 │
   ├→ no_show    └→ cancelled      └→ cancelled
   └→ cancelled
```

The approved CSAPI baseline is materially represented by the existing implementation:

**Queue → Clinical Visit → Pending Close → Reception Workflow → Completed**

`cancelled` and `no_show` are terminal exception outcomes rather than additional primary lifecycle stages.

## 3. Entry / arrival

`registerPatientArrival()` is the current server-side entry point.

When an Agenda event is supplied, it re-reads `master_agenda_events` using the current tenant and takes patient/provider/room identity from the Agenda record. This preserves the established Agenda authority for scheduled arrival.

Walk-in creation remains supported through creation of `clinic_visit_sessions` directly in `waiting` state.

### Finding

The existing-session branch of `registerPatientArrival()` directly writes `session_status = waiting` rather than passing through `queueEngine.validateTransition()`. This is a meaningful reconciliation finding because the same function can update an existing session without applying the normal lifecycle transition graph.

**Classification:** REQUIRES-VERIFICATION / potential transition-boundary defect.

No fix is proposed yet.

## 4. Queue

The Queue Engine is not merely a UI component. It owns ordering/rules and the transition validator. Workspace actions call it before lifecycle mutations.

The current queue rules include lane isolation and priority/creation ordering. The queue presentation derives waiting/current/pending states from `clinic_visit_sessions`.

**Finding:** No second Patient Flow state machine was identified in the reviewed execution path. UI boards contain presentation-level allowed-target maps, but server-side `queueEngine.validateTransition()` remains the mutation authority.

## 5. Clinical Visit

`src/domain/visit/visit.actions.ts` reads the visit from `clinic_visit_sessions`, requires `visits:update` for clinical documentation, and only saves clinical documentation while the session is `in_consultation`.

`finishClinicalVisit()` saves documentation and then calls the canonical `transitionToPendingReception()` action.

This preserves the separation:

```text
Clinical Visit work
        ↓
Pending Close
        ↓
Reception / Operational completion
```

Procedure rows are stored in `clinic_visit_procedures` and reference `clinic_visit_sessions`; they do not replace the visit lifecycle.

## 6. Pending Close

The repository and live database both represent `pending_close` as a real persisted session state.

The live `clinic_visit_sessions` schema contains `session_ended_at`, `visit_closed_at`, `buffer_window_expires_at`, and `auto_close_at`.

A live trigger `fn_set_session_buffer()` sets `session_status = pending_close` and a five-minute buffer when `session_ended_at` is first populated.

### Finding

There is also a live `fn_set_auto_close()` trigger intended to set `auto_close_at` for a `pending_close` session when `visit_closed_at` changes from NULL. The current application transition sets `visit_closed_at` when transitioning to `completed`, not when entering `pending_close`. This makes the exact intended `auto_close_at` lifecycle ambiguous and requires product/architecture clarification before any change.

**Classification:** REQUIRES-VERIFICATION / documentation-or-trigger semantic drift.

## 7. Reception Workflow / Completed

The server action `completeFromReception()` requires `sessions:close` and transitions through the same server-side transition authority.

`transitionSession()` records `visit_closed_at` when the target is `completed` and clears the clinical lock.

The Patient Flow UI exposes `completed` only from `pending_close` for operational context, while clinical context stops at `pending_close`.

This matches the approved separation of clinical completion from reception/operational completion.

## 8. Agenda relationship

The implementation explicitly documents:

```text
arrived ↔ waiting
in_session ↔ in_consultation
completed ↔ completed
cancelled ↔ cancelled
no_show ↔ no_show
pending_close = Visit-only
```

Live database verification currently shows 138 non-deleted visit sessions linked to Agenda events, and all 138 are `completed` with matching Agenda `completed` status. No current linked-session status mismatch was found.

Tenant integrity checks for session→patient, session→doctor, session→room, session→Agenda, session→initialized-by, and session→lock-holder returned zero mismatches in the live database.

## 9. Treatment Plan and Procedure boundaries

The live schema keeps Treatment Plan separate and optional: `clinic_treatment_plans.source_visit_id` and `clinic_treatment_plan_visits.visit_id` reference visits, but `clinic_visit_sessions` does not require a Treatment Plan.

`clinic_visit_procedures.visit_id` references the visit and therefore keeps Procedure execution related to, but not substituting for, the visit lifecycle.

**Finding:** Current schema evidence is consistent with the approved principle that Treatment Plan is not mandatory for every visit.

## 10. Follow-up / Next Action

Live `retention_followups` records can reference `clinic_visit_sessions`. Current live data contains 430 non-deleted follow-ups linked to sessions, all 430 linked sessions currently being `completed`; 342 additional follow-ups are not linked to a session.

Follow-up has its own trigger/bridge to operational `next_action` behavior. No trigger was found that directly changes `clinic_visit_sessions` when a follow-up is created or updated.

**Finding:** Follow-up remains a downstream domain rather than a second Patient Flow engine in the reviewed implementation.

The exact trigger point for automatically creating follow-up after visit completion is not established by this evidence and remains a Gate 01 decision target if the product requires automatic creation.

## 11. Audit

`clinic_visit_sessions` has an AFTER UPDATE audit trigger. Live audit data currently contains 19 UPDATE audit records for this table.

Audit is therefore present, but this first pass does not yet establish that every lifecycle transition is represented by a dedicated semantic audit event or that the audit history is complete for all historical transitions.

**Classification:** REQUIRES-VERIFICATION.

## 12. Live current-state snapshot

Current non-deleted `clinic_visit_sessions`:

| Status | Count |
|---|---:|
| completed | 138 |
| waiting | 1 |
| in_consultation | 0 |
| pending_close | 0 |
| cancelled | 0 |
| no_show | 0 |

The single live waiting session has no Agenda event, no room, and no receptionist initializer, and its `arrived_at` is 2026-08-17. It is therefore stale relative to the current operational date and should be treated as a data-fixture/state-integrity finding rather than silently interpreted as an active current queue patient.

## 13. Current reconciliation matrix

| Gate area | Current evidence | Initial classification |
|---|---|---|
| Entry / arrival | Existing server action + Agenda authority | Mostly aligned; existing-session reset path requires verification |
| Queue | Queue Engine + persisted session state | Aligned |
| Clinical Visit | Visit domain + canonical handoff | Aligned |
| Pending Close | Persisted state + buffer trigger | Aligned, but auto-close semantics unresolved |
| Reception Workflow | Server-side completion boundary | Aligned |
| Completed | Persisted terminal state + close timestamp | Aligned |
| Agenda linkage | Explicit separate ownership | Aligned; live linked data has zero status mismatches |
| Procedure / Session | Procedure references visit | Aligned |
| Treatment Plan | Optional references | Aligned |
| Follow-up | Separate downstream domain | Aligned; automatic trigger semantics still to verify |
| Audit | Session update audit trigger exists | Present; completeness requires verification |
| Tenant integrity | Live cross-domain checks returned zero mismatches | Aligned for tested relations |
| Permissions | Effective permission checks are server-side | Present; transition-by-transition matrix still to verify |
| Duplicate workflow engine | None found in reviewed mutation path | No duplicate identified |

## 14. Decisions not yet proposed

No Product Owner decision is requested yet. The evidence pass has identified investigation targets that must be completed before proposing a final decision:

1. Existing-session arrival/reset semantics.
2. Exact meaning and intended use of `auto_close_at` versus `buffer_window_expires_at`.
3. Whether follow-up creation is automatic on completion or intentionally downstream/manual/automation-driven.
4. Complete transition-by-transition permission matrix.
5. Completeness of semantic audit coverage.
6. Runtime/manual verification of the full visit path using representative scheduled and walk-in scenarios.

## 15. Next Gate 01 action

Continue evidence reconciliation against the live runtime and repository for the six unresolved targets above. Do not implement or modify Patient Flow until the evidence pass identifies the precise product decisions required and those decisions are explicitly approved.
