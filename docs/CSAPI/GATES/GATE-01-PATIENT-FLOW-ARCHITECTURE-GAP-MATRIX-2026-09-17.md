# CSAPI Gate 01 — Patient Flow Architecture Gap Matrix

**Date:** 2026-09-17  
**Status:** ENGINEERING RECONCILIATION / NO IMPLEMENTATION AUTHORIZED BY THIS MATRIX  
**Branch:** `architecture/csapi-gate-01-patient-flow-gap-matrix-2026-09-17`  
**Base:** `architecture/csapi-gate-01-patient-flow-architecture-reconciliation-2026-09-17`  
**Canonical product term:** Patient Flow  
**User-facing clinical action:** **Finish**  
**Scope:** Repository code, live Supabase schema/RLS/triggers/functions/data, current Patient Flow/Clinical/Operation/Administration surfaces, and cross-domain relationships relevant to the approved 2026-09-17 Patient Flow architecture.

> This document converts the completed Gate 01 evidence reconciliation into an implementation-oriented Architecture Gap Matrix. It deliberately separates what already exists, what is only partially represented, what is missing, what is unsafe because of bypass paths, and what remains semantically unresolved. It does **not** authorize code, migration, permission, cleanup, or production changes.

## 1. Canonical architecture being reconciled

The approved 2026-09-17 interpretation is:

```text
Visit
  = complete unresolved clinic work episode / journey container

Clinical Work Session
  = one discrete clinical/procedural work unit inside the Visit

Waiting
  = operational queue condition; not clinical initiation

Hold
  = unresolved Visit condition; current clinical work temporarily suspended

Transfer
  = continuation of the same Visit through another actor/room/context

Finish
  = user-facing clinical action meaning the current clinical work is finished;
    it does not by itself mean the Visit is administratively completed

Operational Handoff
  = transfer of unresolved operational responsibility/context

Operational Closure
  = removal of unresolved work from active daily operational workload according
    to configured policy; not final administrative closure

Administrative Closure
  = final clinic-authority disposition of the Visit

Carry-forward
  = continuation of the same unresolved Visit on a later operating date

Follow-up
  = downstream continuity work after authoritative Visit completion;
    unresolved continuation is not automatically Follow-up
```

### Architectural invariants

1. One Visit remains the parent context across the entire unresolved episode.
2. A Visit may contain multiple Clinical Work Sessions.
3. Queue movement does not start clinical work.
4. Hold does not close the Visit.
5. Transfer does not create a new Visit merely because the actor or room changes.
6. Finish does not mean final Visit completion.
7. Operational handoff must not depend permanently on the receptionist who opened the Visit.
8. Operational Closure and Administrative Closure are distinct concepts.
9. Cross-day continuation retains the same Visit identity when unresolved work continues.
10. Follow-up is downstream of authoritative completion and must not absorb Hold/Transfer/Continuation.
11. Procedure, inventory, billing, payment, treatment-plan and medical-file records remain owned by their domains while retaining Visit context.
12. Patient Flow remains the lifecycle authority; generic Journey Coordination must not create a competing clinical state machine.
13. Workspace classification is not the same thing as authorization.
14. Lifecycle changes must ultimately have one enforceable authority, not merely one application helper.
15. Sensitive lifecycle and administrative actions must be tenant-scoped, permission-controlled, and auditable.

## 2. Evidence baseline used for this matrix

### Repository evidence

| Evidence | Current finding |
|---|---|
| `src/domain/queue/queue.types.ts` | `SessionStatus` is only `waiting`, `in_consultation`, `pending_close`, `completed`, `cancelled`, `no_show`; no Hold/Transfer/operational-close/carry-forward state representation. |
| `src/domain/queue/queue.engine.ts` | Application transition validator exists; graph is the historical six-state model. Queue processing rules exist but current query path does not call `processQueue()`. |
| `src/domain/queue/queue.actions.ts` | `callNextPatient()` moves waiting → in_consultation; `holdVisit()` only clears lock; `completeVisit()` intentionally throws because reception owns completion. |
| `src/domain/queue/workspace.actions.ts` | Server actions call `queueEngine.validateTransition()` and directly update `clinic_visit_sessions`; `registerPatientArrival()` can reset an existing session to `waiting`. |
| `src/domain/visit/visit.actions.ts` | Clinical data and procedures are written directly into `clinic_visit_sessions` / `clinic_visit_procedures`; `finishClinicalVisit()` saves documentation and then calls `transitionToPendingReception()`. |
| `src/features/workspaces/ClinicalWorkspace.tsx` | Clinical surface pulls waiting patients, edits visit data, exposes finish action, and has no first-class Hold/Transfer/Work Session object. |
| `src/features/workspaces/OperationWorkspace.tsx` | Operational surface displays waiting/in_consultation/pending_close/completed lanes and can complete pending_close; current drag/drop is constrained to the old state graph. |
| `src/features/patient-flow/PatientFlowBoard.tsx` | Patient Flow board presents Operations/Clinical/Administrative views but uses the same old six-state model and direct transition actions. |
| `src/domain/journey-coordination/work.actions.ts` | Generic operational Work Item model has assignee and explicit handoff/assignment history, but it is not Visit-specific by schema. |
| `src/domain/queue/queue.queries.ts` | Queue is filtered to today's `created_at`; wait time is derived from created_at; result order is created_at ascending. |
| `src/core/i18n/terminology.ts` | Current clinical UI copy still contains longer phrases such as `Finish Visit and Return to Operation`; user-facing action must be simplified to **Finish**. |

### Live Supabase evidence

| Evidence | Current finding |
|---|---|
| `public.clinic_visit_sessions` schema | One row currently carries visit/session identity, lifecycle state, start/end, closure, locking, notes and timestamps. No separate Clinical Work Session table is present in inspected schema. |
| `session_status` constraint | Only six allowed values: waiting, in_consultation, pending_close, completed, cancelled, no_show. |
| Live triggers | `tr_session_buffer`, `tr_auto_close_timer`, `tr_sessions_updated`, `tr_audit_sessions`. |
| `fn_set_session_buffer()` | When `session_ended_at` is first set, it forces `session_status = pending_close` and sets a five-minute `buffer_window_expires_at`. |
| `fn_set_auto_close()` | Only sets `auto_close_at` when `visit_closed_at` changes from NULL to non-NULL **and** new status is `pending_close`, creating semantic tension with current application completion behavior. |
| `rls_sessions_update` | Authenticated users with effective `sessions:update` OR `visits:update` can update Visit rows within their tenant; policy does not enforce the transition graph. |
| Live permissions | Sessions/Visits permissions exist; code references `patient_flow:operations`, `patient_flow:clinical`, `patient_flow:administrative`, but those Patient Flow permission keys were not present in the inspected live permission catalog. |
| Live session rows | 138 completed; 1 waiting; zero in_consultation, pending_close, cancelled, or no_show in the current non-deleted snapshot. |
| Live stale waiting row | One waiting row has `arrived_at = 2026-08-17`, no agenda event, no room, no receptionist initializer, no lock, and no closure; treated as stale fixture/state-integrity evidence, not an active queue patient. |
| Live cross-domain links | 138 visit-procedure rows, 73 inventory-linked rows, 138 invoice-linked rows, 431 follow-ups linked to sessions in the inspected snapshot. |
| Live operational work | `operational_work_items` and `operational_work_history` exist; 17 history rows were observed; this is generic coordination data, not a Visit lifecycle ledger. |
| Live audit | `tr_audit_sessions` records UPDATE events through `fn_audit_changes`; prior inspected session audit evidence contained many NULL actor IDs and no INSERT auditing through this trigger. |

## 3. Classification legend

| Class | Meaning |
|---|---|
| 🟢 ALIGNED | Current implementation/data already provides the required concept with no material architectural mismatch found. |
| 🟡 PARTIAL / EXTEND | A usable structure exists, but it does not yet fully represent the approved architecture. Prefer extension/reconciliation before creating new engines. |
| 🔴 MISSING | The approved concept does not currently exist as a first-class implementation capability. |
| ⚠️ BYPASS / SAFETY RISK | Current behavior permits an architectural/security bypass, ambiguous authority, or unsafe mutation path. |
| 🟠 SEMANTIC / POLICY DECISION | Structure exists, but exact business meaning or policy still needs to be made explicit before implementation. |
| 🔵 VERIFICATION ONLY | Existing behavior appears aligned but needs targeted runtime/authenticated proof before being treated as closed. |

## 4. Master Architecture Gap Matrix

| ID | Architecture capability / invariant | Current repository representation | Live DB / Supabase evidence | Gap / exact mismatch | Class | Preferred disposition | Likely boundary affected | Required verification / acceptance |
|---|---|---|---|---|---|---|---|---|
| PF-GAP-001 | Visit is the complete unresolved journey container | `clinic_visit_sessions` is treated as the visit/session object throughout queue and visit code | `clinic_visit_sessions` is the central row linked to procedures, invoices, inventory, follow-ups, etc. | The term "session" conflates the parent Visit with one work interval | 🟡 PARTIAL / EXTEND | Preserve Visit identity; decouple work-session semantics from it | Visit domain, Queue/Patient Flow, data model | Demonstrate one Visit can remain open while multiple work units occur |
| PF-GAP-002 | Clinical Work Session is separate from Visit | No separate domain type/table/record found; `SessionStatus` and `session_*` columns represent both concepts | No inspected first-class work-session relation exists | Multiple discrete clinical/procedural sessions cannot be recorded independently | 🔴 MISSING | Inspect for an additive child work-session representation; do not duplicate Visit | Schema, Visit/Clinical code, audit | One Visit supports ≥2 distinct clinical work units without new Visit ID |
| PF-GAP-003 | Visit may contain multiple clinical/procedural work sessions | UI/action path is single active `in_consultation` row with one start/end pair | Live schema has one `session_started_at` / `session_ended_at` pair | No session history or repeated work-session chronology | 🔴 MISSING | Add additive history/child representation if needed | Schema + Clinical workflow | Doctor → Finish → Laser → Finish → Doctor review remains same Visit |
| PF-GAP-004 | Waiting is operational presence, not clinical initiation | Waiting exists as `session_status`; `callNextPatient` starts consultation | Live waiting row exists | Semantics are conceptually correct but waiting state does not capture queue lane/order authority sufficiently | 🟡 PARTIAL / EXTEND | Keep `waiting`; extend queue semantics separately | Queue + Operations | Reception creates/returns Waiting; clinical actor explicitly starts work |
| PF-GAP-005 | Queue movement cannot itself start clinical work | UI separates waiting and `in_consultation` in normal path | DB does not prohibit direct status updates from API clients with update permission | The server actions are semantically separated but DB permits bypass | ⚠️ BYPASS / SAFETY RISK | Introduce one enforceable lifecycle mutation authority | RLS / RPC / API boundary | Direct attempted lifecycle UPDATE cannot bypass transition rules |
| PF-GAP-006 | Reception can reorder Queue by real-world urgency | `queueEngine` has priority enum/rules, but `getQueue()` orders by `created_at` | No inspected persistent queue-position/ordering authority tied to Visit | Emergency/reception reordering is not implemented as authoritative queue state | 🔴 MISSING | Reuse queue concepts; add persistent/order semantics only where required | Queue data + Operations UI | Reception reorder is visible to clinical users in the exact intended order |
| PF-GAP-007 | Queue priority and routing must not imply clinical start | `QueueLane` and priority exist only in TypeScript enrichment; board actions still transition to consultation | No DB field observed for authoritative queue order/lane | Presentation metadata can diverge from actual workflow | 🟡 PARTIAL / EXTEND | Separate queue metadata from lifecycle status | Queue model | Priority changes reorder queue without altering Visit lifecycle |
| PF-GAP-008 | Clinical start is explicit pull from Waiting | `transitionToClinical()`/`callNextPatient()` exist and set lock holder | Live statuses confirm expected values | Provider/room eligibility is not represented as a complete role/capability model at transition boundary | 🟡 PARTIAL / EXTEND | Centralize eligibility policy with lifecycle transition | Auth + Patient Flow | Only authorized eligible actor can start relevant work |
| PF-GAP-009 | Finish is the user-facing clinical action | Internal `finishClinicalVisit()` exists; UI uses longer terminology in copy | No DB terminology impact | User-facing label is not yet simplified to exact requested **Finish** | 🟡 PARTIAL / EXTEND | Change UI copy/labels only; do not rename internal function blindly | I18N/UI | Clinical action renders exactly `Finish` in supported locales where intended |
| PF-GAP-010 | Finish ends current clinical work, not whole Visit | `finishClinicalVisit()` saves then moves to `pending_close` | `session_ended_at` can force `pending_close` | Current model approximates a clinical handoff but only has one session; it cannot express Transfer/Hold alternatives robustly | 🟡 PARTIAL / EXTEND | Reinterpret pending_close as legacy compatibility only; design explicit work-session outcome semantics | Clinical + Patient Flow | Finish never creates Completed directly unless the authoritative workflow explicitly determines that the Visit is done |
| PF-GAP-011 | Finish must be atomic with clinical documentation | `finishClinicalVisit()` performs `saveClinicalVisit()` and then `transitionToPendingReception()` as separate operations | Two independent updates are possible | Note may save while lifecycle transition fails, leaving partial state | ⚠️ BYPASS / SAFETY RISK | Introduce atomic transaction/RPC boundary for Finish | DB transaction + Clinical action | Either documentation + lifecycle transition both commit, or neither does |
| PF-GAP-012 | Hold is first-class unresolved Visit condition | `holdVisit()` only clears `lock_holder_id` / `lock_timestamp` while keeping `in_consultation` | No Hold status/record in inspected schema | System cannot distinguish active clinical work from suspended work | 🔴 MISSING | Add explicit Hold representation without treating it as Visit closure | Schema + Clinical/Queue | Hold releases actor; Visit remains unresolved; Hold is visible and resumable |
| PF-GAP-013 | Hold history must be auditable | No dedicated hold event/history found | Session audit trigger only logs generic UPDATE | Cannot reliably reconstruct why/when/by whom Hold happened | 🟡 PARTIAL / EXTEND | Add business lifecycle event/history | Audit + Patient Flow | Every Hold has actor, timestamp, reason, prior/next context |
| PF-GAP-014 | Resume from Hold returns to Waiting when appropriate | `resumeVisit()` re-locks the same `in_consultation` session | No Hold state exists to transition from | Resume is modeled as re-locking an active consultation, not re-entering the queue | 🔴 MISSING | Define Hold → Waiting → new work session path | Queue + Clinical | Returning patient appears in Waiting and can be re-ordered before next clinical work |
| PF-GAP-015 | Hold must not become Follow-up | No explicit semantic guard beyond status architecture | Follow-ups are separate rows linked to session IDs | Current absence of Hold makes accidental downstream behavior possible once automation grows | 🟡 PARTIAL / EXTEND | Add lifecycle guards to Follow-up triggers/automation | Follow-up + Patient Flow | Held/continuing Visit cannot automatically create a follow-up solely because it is delayed |
| PF-GAP-016 | Transfer preserves same Visit identity | No Visit transfer action found | Foreign keys allow cross-domain records to continue using same session ID | Actor/room changes are not modeled as transfer events | 🔴 MISSING | Add transfer/handoff semantics around the existing Visit | Patient Flow + Clinical + Audit | Doctor → Laser Room retains exact Visit ID and history |
| PF-GAP-017 | Transfer can change actor | `doctor_id` exists on Visit row; direct UPDATE paths can modify it | FK enforces tenant relationship but not transfer semantics | Assignment mutation is not the same as Transfer event | 🟡 PARTIAL / EXTEND | Treat actor changes as explicit lifecycle/handoff operations, not raw field edits | Auth + Patient Flow | Transfer records source actor, destination actor, authority, reason |
| PF-GAP-018 | Transfer can change room | `room_id` exists on Visit row | Same-tenant room FK exists | Room mutation lacks workflow meaning/history | 🟡 PARTIAL / EXTEND | Explicit transfer/reassignment action over existing field | Patient Flow + Room | Room change preserves Visit and creates auditable transfer record |
| PF-GAP-019 | Transfer can create/continue a new Clinical Work Session | No child work-session model | No inspected work-session table | Impossible to distinguish successive sessions in same Visit | 🔴 MISSING | Extend schema with additive child session representation if validated | Schema + Clinical | Each work session has actor/room/start/end/outcome and Visit FK |
| PF-GAP-020 | Additional procedures remain on same Visit | `clinic_visit_procedures` uses `visit_id` and is queried from Clinical Workspace | Live rows link to Visit; 138 rows observed | Structure is visit-level, not work-session-level | 🟢 ALIGNED (Visit linkage) / 🟡 PARTIAL (session attribution) | Keep Visit FK; consider optional work-session FK later | Clinical Procedure | Multiple procedures from different work sessions remain on one Visit |
| PF-GAP-021 | Multiple distinct procedures per Visit | UI can add procedure; DB unique key is on `(visit_id, procedure_id)` | Current live sample has zero Visits with >1 procedure row | Distinct procedures are structurally possible; repeated same procedure row is constrained to one row per Visit | 🟡 PARTIAL / EXTEND | Verify whether quantity + one row per procedure is sufficient | Procedure schema/UI | Visit with Procedure A + B succeeds; duplicate same procedure handled by quantity/history rules |
| PF-GAP-022 | Procedure attribution to exact Clinical Work Session | No work-session FK found in current action/record path | `clinic_visit_procedures.visit_id` is the available linkage | Cannot answer which room/actor/work session performed each procedure without secondary audit inference | 🔴 MISSING | Add optional child-session linkage after work-session decision | Procedure schema | Procedure is attributable to Visit + specific work session where required |
| PF-GAP-023 | Inventory remains attached to same Visit across transfers | `inventory_ledger` supports `session_id` | Live 73 inventory-linked rows; same-tenant FK exists | Correct Visit linkage exists; work-session/room attribution is missing | 🟢 ALIGNED for Visit context / 🟡 PARTIAL for session provenance | Preserve Visit FK; extend provenance only if needed | Inventory + Patient Flow | Laser consumable remains linked to same Visit after transfer |
| PF-GAP-024 | Billing remains attached to same Visit across transfers | `clinic_invoices.session_id` and same-tenant FK exist | 138 linked invoice rows in inspected snapshot | Current invoice creation function derives procedure lines through Agenda event rather than all Visit procedures | 🟡 PARTIAL / EXTEND | Reconcile invoice source-of-truth around Visit procedure/service records | Billing + Procedure | Invoice includes all authoritative billable work performed within Visit |
| PF-GAP-025 | Financial/payment processing must not close Visit implicitly without authority | Billing code can create invoice from session | Visit has independent lifecycle fields | Cross-domain financial actions are not proven to be lifecycle-authoritative | 🟠 SEMANTIC / POLICY DECISION | Explicitly define which financial outcomes are prerequisites vs consequences | Financial + Patient Flow | Creating/settling invoice does not silently mutate Patient Flow unless an explicit rule says so |
| PF-GAP-026 | Treatment Plan is optional to Visit | Visit and Treatment Plan are separate relations | `clinic_treatment_plans.source_visit_id` / `clinic_treatment_plan_visits.visit_id` exist | No lifecycle coupling issue found in reviewed evidence | 🟢 ALIGNED | Preserve separation | Treatment Plan | Visit can complete without Treatment Plan; Treatment Plan can reference Visit |
| PF-GAP-027 | Medical Files can reference Visit without owning lifecycle | Medical Files actions validate Visit ID | `medical_files.visit_id` FK exists | No medical-files state machine conflict identified | 🟢 ALIGNED / 🔵 VERIFICATION ONLY | Preserve ownership separation | Medical Files | File attachment never changes Visit state by itself |
| PF-GAP-028 | Operational handoff must support A → B without impersonation | Generic `operational_work_items` has `assignWorkItem()` and `handoffWorkItem()` with history | `operational_work_items` + `operational_work_history` exist; same-tenant checks exist | Work engine is not directly connected to Visit lifecycle | 🟡 PARTIAL / EXTEND | Reuse generic work engine and add Visit linkage/event integration | Journey Coordination + Patient Flow | Receptionist B can continue Visit work without accessing A's account |
| PF-GAP-029 | Operational handoff must preserve business meaning | Generic handoff history stores assignment/handoff notes | History exists | Generic work history is not a Visit lifecycle ledger | 🟡 PARTIAL / EXTEND | Bridge Visit events to generic work while keeping Patient Flow authority | Coordination + Audit | Handoff event links to exact Visit and preserves source/destination context |
| PF-GAP-030 | Operational reassignment after short configurable interval | No Visit-specific timer/assignee state exists | Buffer field exists but is attached to session and hard-coded to five minutes | Five-minute timer is a trigger constant, not tenant policy | 🔴 MISSING | Replace hard-coded lifecycle assumptions with tenant configuration | Policy + Visit + Coordination | Clinic Admin can configure short reassignment eligibility |
| PF-GAP-031 | Longer configurable operational/admin escalation window | No scheduler/worker was identified that consumes `auto_close_at` for Visit workflow | `auto_close_at` exists, but trigger semantics are inconsistent with app completion path | 60-minute behavior is not reliably connected to actual closure | 🔴 MISSING / 🟠 SEMANTIC | Decide exact meaning, then implement as policy worker, not field-only timestamp | Policy + background execution + Patient Flow | Expiry triggers only the intended operational/admin action; final closure remains explicit |
| PF-GAP-032 | Timing values are tenant-configurable, not constants | Code/DB include five-minute and sixty-minute literals | `fn_set_session_buffer` = +5 min; `fn_set_auto_close` = +60 min | Current architecture hard-codes examples instead of tenant policies | ⚠️ BYPASS / SAFETY RISK | Move timing to policy configuration | Settings + DB functions/workers | Changing tenant policy changes behavior without schema/code redeployment |
| PF-GAP-033 | Operational Closure is distinct from Administrative Closure | Current model has only `pending_close` and `completed` | `visit_closed_at` is tied to generic completed path | No explicit operational-close disposition exists | 🔴 MISSING | Add explicit operational disposition separate from final closure | Patient Flow + Administration | Operational closure removes daily workload; Visit remains available for admin review/finalization |
| PF-GAP-034 | Administrative Closure is final authoritative disposition | `completeFromReception()` moves pending_close → completed | `visit_closed_at` set during completed update | Current `completed` is owned by reception and conflates finality with operational completion | 🟡 PARTIAL / EXTEND | Redefine finality semantics before changing status names; preserve compatibility layer | Patient Flow + Administration | Only authorized admin/authoritative closure can finalize unresolved Visit |
| PF-GAP-035 | Administration is control plane, not another ordinary queue | Administrative Patient Flow page exists and can call generic `moveFromPatientFlow()` | Live permission catalog does not show `patient_flow:administrative` | Admin surface is structurally present but authorization contract is drifted | ⚠️ BYPASS / SAFETY RISK | Reconcile permissions before expanding admin capabilities | Team & Access + Administration | Administrative actions are explicit, tenant-scoped and separately auditable |
| PF-GAP-036 | Administration can correct/reassign/carry-forward without user impersonation | Generic Work supports assignment; Patient Flow admin board supports generic state moves | No Visit-specific reassignment/carry-forward record found | Admin actions are too coarse-grained and state-based | 🟡 PARTIAL / EXTEND | Create explicit admin operations over Visit/work handoff | Administration + Patient Flow | Admin can assign B without becoming B; audit shows admin actor and target user |
| PF-GAP-037 | Carry-forward keeps same Visit ID | No carry-forward action or field found | Queue queries filter by today's `created_at`, so older unresolved Visit can disappear from active queue | Cross-day continuation is not operationally visible | 🔴 MISSING | Add continuation/carry-forward semantics and query behavior | Queue + Visit + Admin | Unresolved Monday Visit can be resumed Tuesday with same Visit ID |
| PF-GAP-038 | Carry-forward must not become new Follow-up | No explicit carry-forward engine | Follow-up is a separate table linked by session ID | Automation boundary has not been proven against unresolved continuation | 🟡 PARTIAL / EXTEND | Add Follow-up guard based on authoritative completion | Follow-up + Visit | Cross-day unresolved Visit creates no follow-up merely due date change |
| PF-GAP-039 | Follow-up begins downstream of authoritative completed Visit | Follow-up table/actions exist and link to session | 431 linked follow-ups observed; linked sessions in prior snapshot were completed | Normal downstream relationship is present, but exact automation trigger timing remains incompletely verified | 🟢 ALIGNED / 🔵 VERIFICATION ONLY | Preserve downstream boundary; verify automation | Follow-up | Completion can lead to follow-up; Hold/Transfer/Carry-forward cannot masquerade as completion |
| PF-GAP-040 | Direct Visit mutation cannot bypass lifecycle authority | Multiple server actions directly `.update()` `clinic_visit_sessions` after app-level validation | RLS update policy checks tenant + update permission only | Direct PostgREST/API UPDATE remains a bypass of the transition graph | ⚠️ BYPASS / SAFETY RISK | Create one controlled transition operation and restrict arbitrary lifecycle field mutation | RLS + DB function + server actions | All lifecycle state changes go through one audited authority |
| PF-GAP-041 | `registerPatientArrival()` cannot reset an existing arbitrary Visit | Existing-session branch updates patient/provider/room/agenda/arrival/status directly | RLS permits update under sessions:update/visits:update | Existing lifecycle state can be reset to Waiting without transition validation | ⚠️ BYPASS / SAFETY RISK | Restrict arrival to valid arrival states/new visit or explicit return-from-hold path | Arrival + Patient Flow | Calling arrival on completed/in-consultation/pending-close Visit is rejected unless explicit rule permits it |
| PF-GAP-042 | RLS must enforce lifecycle semantics | RLS isolates tenant and permission but not old/new status transition | Live update policy confirms permission-only update boundary | Database security boundary does not protect state machine | 🔴 MISSING | Add DB-enforced transition RPC/guard and restrict direct status updates | Supabase RLS/DB | Unauthorized state mutation fails even when caller has generic update permission |
| PF-GAP-043 | Patient Flow permissions must align between code and live catalog | Code checks `patient_flow:*` | Live permission catalog inspected had sessions/visits/work permissions, no `patient_flow:*` keys | Repository authorization vocabulary and DB authorization vocabulary drift | ⚠️ BYPASS / SAFETY RISK | Reconcile permission catalog before implementation | Team & Access + Patient Flow | Page/action permission decisions are identical in repository and live DB |
| PF-GAP-044 | Role matrix must describe actor authority per transition | Live roles include Clinic Admin, Doctor, Receptionist, etc.; code uses generic sessions update | Current mapping gives broad session update to multiple roles | Actor-specific semantics are not expressed for Hold/Transfer/Finish/admin closure | 🟡 PARTIAL / EXTEND | Build explicit transition/operation capability matrix | Auth + Patient Flow | Each action has actor + context + permission + lock requirements |
| PF-GAP-045 | Workspace is context, not authorization boundary | `moveFromPatientFlow(context)` mixes workspace context with permission checks | Live permission model is global permission based | Context can be treated as permission substitute if drift persists | 🟡 PARTIAL / EXTEND | Use workspace as presentation/context only; use capability policy for authority | Navigation + Auth + Patient Flow | Same capability evaluated identically regardless of surface |
| PF-GAP-046 | Clinical lock belongs to active work, not entire Visit forever | `lock_holder_id` supports one active actor | Live field exists on Visit row | Lock is currently the only mechanism distinguishing active consultation from free session | 🟡 PARTIAL / EXTEND | Move lock semantics to active Clinical Work Session where appropriate | Clinical session + concurrency | Holding/finishing one work session clears only that session's lock |
| PF-GAP-047 | Lock ownership must be validated on Finish | `transitionToPendingReception()` checks lock holder unless admin permission | Current DB update path does not independently enforce lock ownership | App check can be bypassed by direct UPDATE | ⚠️ BYPASS / SAFETY RISK | Put ownership check in authoritative transition function | DB RPC + RLS | Non-owner cannot Finish another actor's active work even with generic UPDATE permission |
| PF-GAP-048 | Finish should produce business event, not merely row mutation | App transition changes status/timestamps; audit trigger records generic UPDATE | `tr_audit_sessions` only generic row update audit | No explicit event such as `clinical_work_finished` | 🟡 PARTIAL / EXTEND | Add business lifecycle event ledger | Audit + Patient Flow | Finish event stores actor, Visit, work-session/context, timestamp, next action |
| PF-GAP-049 | Business lifecycle audit must cover INSERT and lifecycle events | Generic audit trigger only handles UPDATE | Prior live audit evidence showed UPDATE rows only and NULL actors in many records | Cannot reconstruct complete lifecycle chronology from current audit | 🔴 MISSING | Add lifecycle event audit + actor resolution guarantees | Audit | Arrival/start/finish/hold/transfer/close/reassign/carry-forward all reconstructable |
| PF-GAP-050 | Audit actor identity must be reliable | `fn_audit_changes()` resolves auth.uid → `clinic_users.id`, falls back NULL | Previous inspected data had many NULL actor IDs | Missing actors weaken auditability | ⚠️ BYPASS / SAFETY RISK | Make required business-event actor context explicit; do not fail silently for sensitive operations | Audit/Auth | Sensitive lifecycle actions have non-null actor identity |
| PF-GAP-051 | Current Pending Close semantics must be clarified | `pending_close` is returned from clinical path and completed by reception | Trigger sets buffer on `session_ended_at`; auto-close trigger expects `visit_closed_at` + pending_close | Timestamp semantics do not consistently match current application path | 🟠 SEMANTIC / POLICY DECISION | Decide whether pending_close is compatibility state or retained operational phase | Patient Flow + DB | One unambiguous lifecycle contract exists for Pending Close |
| PF-GAP-052 | Five-minute window should represent reallocation/continuation policy, not architecture state | DB hard-codes 5 min on session end | `buffer_window_expires_at` is calculated in trigger | Field may be mistaken for business lifecycle truth | 🟡 PARTIAL / EXTEND | Treat as policy deadline associated with an operational event | Policy + Visit | Expiry changes eligibility/assignment, not Visit identity/finality |
| PF-GAP-053 | Sixty-minute window should represent configured operational/admin handling | DB hard-codes 60 min under a condition rarely reached by current app path | Trigger logic not connected to a known scheduler/closure worker in inspected evidence | Auto-close architecture is incomplete | 🔴 MISSING | Define event + worker + disposition semantics | Background execution + Patient Flow | Expiry creates intended operational disposition and never silently final-closes a Visit |
| PF-GAP-054 | Queue queries must include unresolved carried-forward Visits | `getQueue()` filters `created_at` to today | Live stale waiting Visit created Aug 17 is excluded from today's queue | Continuation Visits can disappear from normal work surfaces | 🔴 MISSING | Query by active/unresolved operational state plus explicit date policy | Queue queries | Unresolved Visit can be surfaced on later operating date |
| PF-GAP-055 | Waiting order must use operational order, not age alone | `getQueue()` orders `created_at` ascending | No persistent order field checked in Visit | Reception's deliberate ordering is not authoritative | 🔴 MISSING | Add queue-position/order mechanism or existing canonical reuse | Queue schema + UI | Emergency can be moved to correct lane/position without changing creation time |
| PF-GAP-056 | Queue realtime should reflect authoritative order/lifecycle | Realtime listens to `clinic_visit_sessions` updates | No dedicated order event source found | Direct row updates can trigger refresh without preserving ordering intent | 🟡 PARTIAL / EXTEND | Realtime should consume authoritative queue/work events | Realtime + Queue | All clients converge on same order after movement/transfer/return |
| PF-GAP-057 | Operation should not present in-consultation as a manually completable lane | `OperationWorkspace` displays `in_consultation` with "clinical waiting" | No DB separation between clinical work and operational waiting beyond status | Old workspace model still makes in-consultation a Visit lane | 🟡 PARTIAL / EXTEND | Present operational responsibility/handoff rather than clinical active state | Operation UI | Reception sees what they can act on, not a misleading clinical work lane |
| PF-GAP-058 | Clinical surface should distinguish waiting, active work, returned, hold, transfer | Current Clinical Workspace shows waiting, active, pending_close only | No corresponding states/records for Hold/Transfer | Clinical user cannot see correct unresolved semantics | 🔴 MISSING | Extend Clinical Workspace from lifecycle model after backend authority is ready | Clinical UI | Clinical user sees only eligible work and correct action set |
| PF-GAP-059 | Administration surface must show unresolved Visits across dates | Admin page calls `getQueue()` | `getQueue()` is today-only | Admin control plane cannot reliably find stale/carry-forward Visits | 🔴 MISSING | Add administrative unresolved-Visit query | Administration + Queries | Admin can find unresolved Visits regardless of operating date |
| PF-GAP-060 | Administrative intervention must be broader than simple state drag/drop | `PatientFlowBoard` maps admin context to same `moveFromPatientFlow` state transitions | No explicit correction/reassign/carry-forward operations represented | Admin is currently a variant of the same state board rather than control plane | 🔴 MISSING | Build explicit admin command surface over authoritative operations | Administration | Admin can correct/reassign/carry-forward/finalize through specific audited commands |
| PF-GAP-061 | Visit completion must not be mistaken for clinical completion | `completeVisit()` is disabled in queue actions; reception completion exists | `visit_closed_at` is set on completed transition | The data model uses one `completed` field/state for finality | 🟠 SEMANTIC / POLICY DECISION | Preserve one final state only after finality semantics are defined | Patient Flow | Finish, operational completion, and final completion are distinguishable in event history |
| PF-GAP-062 | Agenda ↔ Visit compatibility must remain separate | `workspace.actions` documents mapping and keeps pending_close Visit-only | Live linked 138 Agenda/Visit records previously reconciled with zero mismatches | No current mismatch found | 🟢 ALIGNED | Preserve boundaries | Agenda + Visit | Appointment status never becomes the substitute for Visit lifecycle |
| PF-GAP-063 | Arrival from Agenda must derive authoritative appointment identity | `registerPatientArrival()` re-reads `master_agenda_events` when agenda_event_id supplied | FK and tenant filtering exist | Current path is strong but existing-session branch still broad | 🟢 ALIGNED / ⚠️ BYPASS in existing-session path | Preserve Agenda authority; restrict existing-session mutation | Agenda + Arrival | Arrival identity matches Agenda patient/provider/room and cannot overwrite arbitrarily |
| PF-GAP-064 | Walk-in may create a Visit directly in Waiting | `registerPatientArrival()` can insert waiting session | Live schema supports direct Visit creation; one stale walk-in-like row exists | No gap in basic concept | 🟢 ALIGNED | Preserve | Arrival + Visit | Walk-in creates Visit/Waiting without requiring appointment |
| PF-GAP-065 | One receptionist does not permanently own whole Visit | `initialized_by_receptionist` stores initial user only; no Visit assignee | FK exists but is historical initializer only | No explicit operational ownership field for continuation | 🔴 MISSING | Add operational responsibility context separate from initializer | Visit + Coordination | Initializer remains history; current responsible actor can change |
| PF-GAP-066 | Operational work should be assignable without changing initializer | Generic work items can assign/handoff | Work tables support assignee | Integration with Visit absent | 🟡 PARTIAL / EXTEND | Reuse work assignment and link via source metadata or explicit Visit relation | Coordination + Visit | Reassignment does not rewrite historical initializer |
| PF-GAP-067 | Cross-room/procedure financial continuity must use same Visit | Visit-linked invoice/inventory/procedure records exist | Same-tenant FK protections observed | Work-session attribution missing but parent linkage sound | 🟢 ALIGNED / 🟡 PARTIAL | Preserve parent Visit linkage; add child-session attribution only if required | Cross-domain | All downstream records reference same Visit after transfer |
| PF-GAP-068 | Generic Journey Coordination must not own Patient Flow state | Generic Work engine manages statuses and handoffs | Work tables have own status/history | Potential conceptual duplication exists if future code uses Work status as Visit status | 🟢 ALIGNED by design / 🔵 VERIFICATION ONLY | Keep Work lifecycle independent; add explicit event bridge | AJM + Patient Flow | Work completion never silently marks Visit completed |
| PF-GAP-069 | Operational work history should capture Visit-originated events | Generic work history has work_item_id and statuses | History exists | No Visit FK or source integrity guarantee found for Visit-originated work | 🔴 MISSING | Add source linkage/invariant rather than duplicating history | Coordination schema | Every Visit-originated work item identifies its source Visit |
| PF-GAP-070 | Administrative carry-forward needs an audit trail | No explicit operation | No dedicated record/event | No authoritative record of who moved unresolved Visit to future operating date | 🔴 MISSING | Business event record | Audit + Administration | Carry-forward is fully reconstructable |
| PF-GAP-071 | Reopening/correction must be explicitly authorized | Admin board allows coarse state moves | RLS generic update permissions | Broad update permission may permit unsafe transitions if not centralized | ⚠️ BYPASS / SAFETY RISK | Separate admin commands/capabilities from generic updates | Auth + DB | Reopen/correct is denied outside authorized admin operation |
| PF-GAP-072 | Tenant isolation for all Visit relationships | Same-tenant composite FKs exist for patient/doctor/room/agenda/lock/initializer | Live constraints observed | Cross-domain integrity is strong in inspected snapshot | 🟢 ALIGNED | Preserve and extend to any new child work-session records | DB | All new Visit children enforce tenant match |
| PF-GAP-073 | Patient Flow lifecycle audit should capture actor, source, destination, reason | Generic update audit only | `fn_audit_changes` stores old/new JSON and actor role; actor can be NULL | Business-level audit fields are absent | 🔴 MISSING | Add business event structure | Audit | Audit answers who/what/why/from/to for each lifecycle action |
| PF-GAP-074 | Live test data must not be interpreted as proof of scenario support | Current live snapshot mostly completed rows | 138 completed, 1 stale waiting, no active Hold/Transfer cases | Data proves integrity of existing records, not coverage of new scenarios | 🔵 VERIFICATION ONLY | Keep as evidence; create isolated fixtures only when implementation testing is authorized | Test execution | Scenario matrix has authenticated test cases for every new operation |
| PF-GAP-075 | Authenticated end-to-end Patient Flow proof is still incomplete | Static/code paths are inspectable; production protected routes require auth | Current investigation did not establish full authenticated runtime for every scenario | Runtime proof is incomplete | 🔵 VERIFICATION ONLY | Run controlled authenticated E2E only after architecture implementation | E2E | Arrival → Waiting → Work → Finish/Hold/Transfer → Operation → Closure flows pass |
| PF-GAP-076 | Current UI uses legacy status names and actions as if complete architecture | Clinical/Operation/PatientFlow boards rely on six-state graph | Live DB only knows six values | UI cannot express full approved model without backend extension | 🟡 PARTIAL / EXTEND | Do not redesign UI first; stabilize lifecycle contract first | UI + Patient Flow | UI action/state vocabulary matches backend authority |
| PF-GAP-077 | `processQueue()` should be canonical if queue rules are intended to govern order | `QueueEngine.processQueue()` exists | No live DB representation of its computed order | Dead/unused rule path creates false confidence | 🟡 PARTIAL / EXTEND | Either wire the canonical queue engine or retire duplicate/dead path after verification | Queue code | One queue ordering algorithm is demonstrably active |
| PF-GAP-078 | Wait time must reflect operational queue entry, not necessarily Visit creation | `computeWaitTimeMinutes()` uses `created_at` | Visit contains `arrived_at`, but queue query uses `created_at` | Cross-day/return/hold waiting duration can be incorrect | 🟡 PARTIAL / EXTEND | Base waiting metrics on queue-entry events/timestamps | Queue analytics | Wait clock resets/continues according to explicit policy |
| PF-GAP-079 | `arrived_at` should not be overwritten by generic re-registration | Existing `registerPatientArrival()` rewrites `arrived_at` | DB permits update | Historical arrival timing can be lost | ⚠️ BYPASS / SAFETY RISK | Make arrival append/event based; preserve original timestamps | Arrival + Audit | Re-registering does not erase original arrival history |
| PF-GAP-080 | Current receptionist initializer is not current owner | `initialized_by_receptionist` is stored on Visit | FK only | Field is correctly historical but no current-owner equivalent | 🟡 PARTIAL / EXTEND | Add current operational responsibility separately | Visit + Coordination | Current responsibility can move while initializer remains unchanged |
| PF-GAP-081 | Clinical actor type cannot be assumed to be only Doctor | Code queries `getActiveDoctors()` and `doctor_id`; architectural model allows specialist/room operator | Live role catalog contains multiple roles | Current schema naming hardcodes doctor semantics in core Visit path | 🟡 PARTIAL / EXTEND | Generalize work actor capability without breaking current doctor link | Auth + Clinical | Authorized clinical specialists can own relevant work without fake Doctor identity |
| PF-GAP-082 | Room responsibility can be first-class clinical work owner | Current `room_id` is metadata; start validation requires `doctor_id` | Live room FK exists | Room-only clinical/procedural work is not adequately represented | 🟡 PARTIAL / EXTEND | Make actor/capability model support room/procedural responsibility | Clinical + Workforce | Laser/procedure room can receive Visit work without violating authorization |
| PF-GAP-083 | Transfer to investigation outside clinic remains same Visit until resolution | No transfer/hold event path | Visit can retain identity | No external investigation continuation semantics | 🔴 MISSING | Use Hold/Transfer + carry-forward semantics rather than new Visit | Patient Flow + Clinical | External lab/imaging can suspend and resume same Visit |
| PF-GAP-084 | Multiple operating dates do not imply multiple Visits | No cross-day Visit query/action | Visit row has timestamps but no carry-forward state | Current daily query design effectively hides old unresolved Visit | 🔴 MISSING | Separate operating-date workload from Visit identity | Visit + Queue | Same Visit can remain unresolved across dates |
| PF-GAP-085 | Administrative closure must validate required cross-domain disposition | No explicit finalization checklist | Downstream records exist independently | No single authority verifies required clinical/financial/inventory/documentation work | 🟠 SEMANTIC / POLICY DECISION | Define closure prerequisites by domain, then implement explicit finalization check | Administration + Cross-domain | Admin closure reports unresolved blockers before final closure |
| PF-GAP-086 | Operational closure must not destroy or sever historical links | No operational-close implementation | Existing Visit FK graph is intact | Future auto-close design could be tempted to create archive/new Visit | 🟢 DESIGN INVARIANT / 🔵 VERIFICATION ONLY | Preserve Visit identity and links through operational disposition | Patient Flow + DB | Closed-for-day Visit remains queryable and linked |
| PF-GAP-087 | Cancellation / no-show should remain distinct from Hold/Transfer | Existing six-state graph has terminal `cancelled`/`no_show` | Live constraint includes both | No major mismatch found for appointment-related terminal outcomes | 🟢 ALIGNED / 🔵 VERIFICATION ONLY | Preserve terminal semantics and prevent Hold/Transfer from entering them accidentally | Patient Flow | Only authoritative cancellation/no-show operation can set those outcomes |
| PF-GAP-088 | Terminal completion should be irreversible unless explicit admin correction rule exists | `queueEngine` says completed has no outgoing transitions | RLS does not enforce this graph | App says irreversible; DB can still accept generic update | ⚠️ BYPASS / SAFETY RISK | Enforce terminality in authoritative DB operation | DB + Admin | Direct attempt to revert completed Visit fails unless explicit admin command |
| PF-GAP-089 | Administrative reopening must be separate from ordinary transition | No dedicated reopen command | No DB-level transition guard | Reopening would currently be a generic UPDATE if permissions allow | 🔴 MISSING | Separate admin-only command and audit event | Admin + DB | Reopen is auditable and cannot be invoked by normal clinical/operational user |
| PF-GAP-090 | Documentation authority should be independent from Visit lifecycle mutation authority | `saveClinicalVisit()` directly updates Visit row; Finish calls it then lifecycle transition | RLS grants generic `visits:update` | Clinical documentation and lifecycle mutation share same write surface | 🟡 PARTIAL / EXTEND | Split domain commands while keeping atomic Finish orchestration | Clinical + Patient Flow | User can save notes without changing lifecycle; Finish performs both atomically |

## 5. Exact reuse / extend / create map

The matrix does **not** support a blanket rewrite. The preferred architecture is:

### Reuse

- `clinic_visit_sessions` as the parent Visit record.
- `queueEngine` as the conceptual location for transition/ordering rules, subject to making it actually authoritative.
- `clinic_visit_procedures` for Visit-level procedure records.
- `inventory_ledger.session_id` for Visit context.
- `clinic_invoices.session_id` for Visit context.
- Treatment Plan Visit links.
- Medical File Visit links.
- `operational_work_items` and `operational_work_history` for generic operational work/handoff mechanics.
- Existing same-tenant foreign-key integrity strategy.
- Existing Agenda ↔ Visit separation.

### Extend

- Visit lifecycle authority.
- Queue ordering representation.
- Lock semantics.
- Operational responsibility/assignee context.
- Audit/business events.
- Policy configuration for reassignment/escalation.
- Billing derivation from authoritative Visit work performed.
- Permission vocabulary and transition capability matrix.
- Queries for unresolved/carry-forward Visits.

### Potentially create, only after verification

- A first-class Clinical Work Session child representation.
- A Visit lifecycle/business-event ledger.
- Explicit Visit operational handoff/assignment relation or a governed source relation into `operational_work_items`.
- Explicit carry-forward/operational disposition record if existing structures cannot represent it safely.
- Authoritative DB transition RPC/guard.
- Tenant-configurable Patient Flow policy storage if no reusable policy/config structure exists.

> **Important:** creating a new table is not automatically required for every gap. The next implementation investigation must prove whether an additive child table, event ledger, existing work structure, or combination provides the smallest non-duplicative model.

## 6. Proposed target authority model (for implementation design, not yet execution)

The safest target boundary indicated by the evidence is conceptually:

```text
Authenticated actor
      ↓
Authoritative Patient Flow operation
      ↓
Resolve tenant + actor capability
      ↓
Read current Visit state / active Work Session
      ↓
Validate operation + actor + current context
      ↓
Validate transition / Hold / Transfer / handoff semantics
      ↓
Persist lifecycle + work-session data atomically
      ↓
Emit business lifecycle audit event
      ↓
Emit downstream domain events / operational work where required
      ↓
Revalidate / realtime notify surfaces
```

Direct client UPDATE of lifecycle fields should not remain a parallel authority.

## 7. Priority grouping for implementation planning

### P0 — Must resolve before claiming Patient Flow architecture is implementation-ready

1. PF-GAP-005 — queue movement vs lifecycle bypass.
2. PF-GAP-011 — Finish atomicity.
3. PF-GAP-012 — Hold representation.
4. PF-GAP-014 — Hold return to Waiting.
5. PF-GAP-016 — Transfer semantics.
6. PF-GAP-019 — multiple Clinical Work Sessions.
7. PF-GAP-028 — Visit-specific operational handoff/reassignment.
8. PF-GAP-032 — tenant-configurable timing policy.
9. PF-GAP-033 / PF-GAP-034 — operational vs administrative closure.
10. PF-GAP-037 — carry-forward.
11. PF-GAP-040 / PF-GAP-042 — enforceable lifecycle authority.
12. PF-GAP-043 — live permission reconciliation.
13. PF-GAP-047 — lock enforcement.
14. PF-GAP-049 / PF-GAP-050 — lifecycle audit completeness.
15. PF-GAP-051 / PF-GAP-053 — timing/Pending Close semantics.

### P1 — Required for coherent end-user workflow

1. PF-GAP-006 / PF-GAP-055 — authoritative queue ordering/reordering.
2. PF-GAP-022 — procedure-to-work-session attribution if needed by reporting/audit.
3. PF-GAP-024 — billing source reconciliation.
4. PF-GAP-035 / PF-GAP-060 — administrative control plane.
5. PF-GAP-054 / PF-GAP-059 — unresolved/cross-day queries.
6. PF-GAP-058 — Clinical Workspace state/action model.
7. PF-GAP-065 / PF-GAP-080 — current operational responsibility.
8. PF-GAP-078 — correct queue wait timing.

### P2 — Hardening and verification

1. PF-GAP-056 — realtime ordering convergence.
2. PF-GAP-062 / PF-GAP-063 / PF-GAP-064 — Agenda/Arrival regression proof.
3. PF-GAP-072 — tenant integrity for future child structures.
4. PF-GAP-074 / PF-GAP-075 — live authenticated scenario proof.
5. PF-GAP-077 — make queue engine path genuinely canonical or retire dead path.
6. PF-GAP-085 — closure prerequisite registry.

## 8. Explicit non-findings / what this investigation did NOT conclude

To prevent future drift, the following were **not** concluded:

- A new Visit table is required. It is not.
- Patient Flow should be rebuilt from zero. It should not.
- Journey Coordination should own Patient Flow lifecycle. It should not.
- Follow-up should be moved inside Patient Flow. It should not.
- Agenda should become the Visit state machine. It should not.
- Every clinical interaction must become a new Visit. It should not.
- Every Hold must create a Follow-up. It should not.
- Every Transfer must create a new Visit. It should not.
- Five minutes and sixty minutes are fixed product constants. They are not.
- Administration should simply receive a copy of the operational queue. It should instead be a control plane.
- Generic `operational_work_items` is a replacement for Visit lifecycle. It is not.
- The current live data proves Hold/Transfer/carry-forward work. It does not; those states are absent from the current snapshot.
- The presence of `queueEngine` alone proves system-wide lifecycle authority. It does not because DB UPDATE policies do not enforce the graph.

## 9. Required implementation decision sequence after this matrix

The next engineering stage should be performed in this order:

```text
A. Freeze the current findings
        ↓
B. Define exact target Visit + Clinical Work Session data model
        ↓
C. Define exact target operation/transition command contract
        ↓
D. Define actor/capability matrix
        ↓
E. Define Hold / Transfer / Finish / Handoff semantics
        ↓
F. Define operational vs administrative closure
        ↓
G. Define carry-forward semantics
        ↓
H. Define tenant-configurable timing policy
        ↓
I. Define business-event audit contract
        ↓
J. Reconcile cross-domain billing/inventory/procedure sourcing
        ↓
K. Only then write implementation migrations/code
        ↓
L. Run isolated verification + authenticated scenario E2E
```

No step above authorizes implementation by itself.

## 10. Evidence references

Primary repository sources inspected during this reconciliation:

- `src/domain/queue/queue.types.ts`
- `src/domain/queue/queue.engine.ts`
- `src/domain/queue/queue.actions.ts`
- `src/domain/queue/workspace.actions.ts`
- `src/domain/queue/queue.queries.ts`
- `src/domain/visit/visit.actions.ts`
- `src/features/workspaces/ClinicalWorkspace.tsx`
- `src/features/workspaces/OperationWorkspace.tsx`
- `src/features/patient-flow/PatientFlowBoard.tsx`
- `src/domain/journey-coordination/work.actions.ts`
- `src/core/i18n/terminology.ts`
- `src/infrastructure/supabase/database.types.ts`
- relevant Supabase migrations for Visit/PJ/queue/tenant integrity
- `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-ARCHITECTURE-RECONCILIATION-2026-09-17.md`
- `docs/CSAPI/GATES/GATE-01-PATIENT-FLOW-HISTORICAL-DOCUMENTATION-RECONCILIATION-2026-09-17.md`
- `docs/CSAPI/CSAPI-DECISION-AND-ACTION-LEDGER.md`

Live Supabase objects inspected include:

- `public.clinic_visit_sessions`
- `public.clinic_visit_procedures`
- `public.master_agenda_events`
- `public.clinic_invoices`
- `public.inventory_ledger`
- `public.patient_package_consumptions`
- `public.retention_followups`
- `public.operational_work_items`
- `public.operational_work_history`
- `public.audit_trail`
- live RLS policies for `clinic_visit_sessions`
- live triggers/functions including `fn_set_session_buffer`, `fn_set_auto_close`, `fn_audit_changes`, and `fn_set_updated_at`
- live permissions / role-permission mappings

## 11. Gate 01 status after this matrix

**Product architecture:** clarified and documented.  
**Current implementation:** materially partial.  
**Current authorization boundary:** not yet sufficient for the expanded model.  
**Current DB lifecycle enforcement:** not sufficient.  
**Hold:** not first-class.  
**Transfer:** not first-class.  
**Clinical Work Session:** not first-class.  
**Operational reassignment:** generic engine exists but is not Visit-integrated.  
**Operational vs administrative closure:** not fully represented.  
**Carry-forward:** not implemented.  
**Timing policy:** hard-coded/semantically inconsistent.  
**Business lifecycle audit:** incomplete.  
**Live scenario proof:** incomplete.  
**Implementation authorization:** **NOT GRANTED BY THIS DOCUMENT**.

**End of Architecture Gap Matrix.**
