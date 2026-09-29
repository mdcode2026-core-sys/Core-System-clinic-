# CORE SYSTEM — CSAPI CURRENT EXECUTION HANDOFF

**Updated:** 2026-09-29 — Gate 04 Implementation-Ready Closure  
**Purpose:** Conversation-independent handoff for the next CSAPI execution conversation.  
**Resume token:** `CSAPI`

## 1. Canonical continuation point

Current CSAPI gate state:

- **Gate 01 — Patient Flow:** CLOSED.
- **Gate 02 — Patient Journey:** CLOSED / VERIFIED / PRODUCTION VERIFIED.
- **Gate 03 — Patient & Identity:** CLOSED / VERIFIED / PRODUCTION VERIFIED.
- **Gate 04 — Agenda / Scheduling:** **OPEN — IMPLEMENTATION-READY; implementation not started**.
- **Gate 11 — Follow-up / Retention:** OPEN as a later owning gate; do not pull Gate 11 work into Gate 04 unless a direct dependency is proven.

The next conversation for this gate is the **implementation handoff**, not a new architecture/precheck cycle.

**Gate 04 → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE**

The next CSAPI conversation should instead begin Gate 05 decision/design/planning work. Gate 04 implementation must use the frozen artifacts below as binding execution authority.

Do **not** reopen Gates 01, 02, or 03.

## 2. Mandatory actions for a Gate 04 implementation handoff

Before Gate 04 implementation begins, the implementation owner must:

1. Read `docs/CSAPI/CSAPI-MASTER-STATE.md`.
2. Read `docs/CSAPI/CSAPI-GATES-PLAN.md`.
3. Read this handoff.
4. Read `docs/CSAPI/CSAPI-DECISION-AND-ACTION-LEDGER.md`.
5. Read the authoritative Gate 03 closure record:
   `docs/CSAPI/GATES/GATE-03-FINAL-CLOSURE-RECONCILIATION-2026-09-29.md`.
6. Read the Gate 04 / Agenda source and implementation records already present in the repository.
7. Inspect current GitHub `main`, open PRs/branches, current tests and relevant source.
8. Reconcile repository ↔ migrations ↔ Live Supabase ↔ runtime before coding.
9. Confirm the current main SHA and reconcile any changed repository/DB/runtime evidence before coding.

The ownership/design reconciliation is already complete and frozen. Do not restart it unless new evidence directly contradicts a frozen decision.

**Do not trust this handoff, older documents, PR numbers, or branch names as current reality without checking them against the repository and live evidence.**

## 3. Decisions already established before Gate 04 reconciliation

These decisions are the current working architectural baseline unless new evidence shows a contradiction requiring explicit review.

### Module vs Domain

- **Module** = product/functional unit that may be licensed, entitled, permission-controlled and exposed through product UX.
- **Domain** = business responsibility, source of truth and rule ownership.
- A Module and a Domain are not interchangeable architectural terms.
- `src/domain/*` folders are code organization and are not, by themselves, proof of architectural domain ownership.

### Agenda

- Agenda is the **Module/product surface for scheduling** and the **authority for appointments/scheduling**.
- Appointment/scheduling remains one canonical responsibility; there must not be a second scheduler, calendar engine or competing appointment source of truth.
- Calendar is a visual/operational representation, not the source of truth.
- Queue is real-time patient movement / Visit Operations and is not a scheduling authority.
- Agenda uses the canonical `master_agenda_events` model and the existing Agenda engines/services; do not rebuild Agenda.
- Portal is a future channel that must use the same canonical Agenda authority rather than create a parallel scheduler.

### Patient Journey

- Patient Journey is a **cross-domain longitudinal business concept**, not a single replacement engine.
- Gate 02 is closed. Later domain findings do not reopen it unless a new explicit CSAPI decision supersedes its closure.
- The Patient Flow implementation is closed and must not be reopened as part of Gate 04.

### Treatment Plan / Follow-up

- Treatment Plan owns clinical progression.
- Follow-up owns longitudinal relationship/retention work and has its own **Gate 11**.
- Review is part of Follow-up; it is not a substitute for the Follow-up domain.
- Treatment Plan → Next Action → Agenda is an integration boundary: Treatment Plan produces the clinical next action; Agenda owns the appointment when the action becomes a booking.
- Do not repeatedly return to Treatment Plan to repair defects whose actual owner is Agenda or Follow-up.
- A later Follow-up failure does not reopen Gate 03, Gate 02 or Gate 01.

### Workforce and operational resources

- Workforce owns workforce reality: who is available/capable/productive.
- Agenda owns appointments and consumes workforce availability/capability as an integration input.
- Operational resources include people and specialized devices/rooms/equipment as applicable to a service.
- **Consumables/material inventory is not an Agenda booking blocker by default.** Acquisition/readiness of consumables is a separate responsibility.
- A service/procedure defines its operational requirements; Agenda asks the owning domains for the facts it needs.
- Provider is **optional depending on the service**; do not hard-code a universal doctor requirement.
- Multi-resource appointments are valid where clinic policy/service requirements require them.
- Resource concurrency/capacity is **clinic-policy-driven**, not a universal architectural prohibition.
- Walk-in is a core operational scenario, not merely an optional toggle.
- Overbooking is policy-driven; do not invent a universal hard cap.

### UX vs audit

- Patient/unauthorized users should receive only the level of reason/detail appropriate to their authorization.
- Authorized internal users may receive more operational detail.
- Higher-level administrators may see additional detail and may override only where policy permits.
- The audit record must preserve the full decision/source/rule/actor/time/override information.
- UX explanation and audit truth share the same underlying outcome but are not the same disclosure layer.

## 4. Gate 04 ownership baseline

The reconciliation must verify, against actual repository and database evidence:

| Responsibility | Canonical owner |
|---|---|
| Appointment / scheduling | Agenda |
| Calendar representation | Agenda / UI representation; not independent authority |
| Provider/workforce availability | Workforce, consumed by Agenda |
| Room/resource availability | Owning resource/workforce domain, consumed/validated by Agenda |
| Service/procedure requirements | Clinical/service definition domain |
| Patient identity | Patient / Identity domain |
| Patient real-time movement | Patient Flow / Visit Operations |
| Clinical progression | Treatment Plan / Clinical |
| Longitudinal retention/follow-up | Follow-up — Gate 11 |
| Consumable materials | Inventory / procurement domain, not Agenda booking authority |
| Audit | Canonical audit/security boundary |

This table is a reconciliation target, not permission to create new engines.

## 5. Current Agenda implementation baseline to verify

Known canonical implementation from the existing engineering record:

- `src/domain/agenda/agenda.mutation-service.ts` is intended to be the canonical mutation path.
- `src/domain/agenda/agenda.actions.ts` delegates create/update to the mutation service.
- `src/domain/agenda/availability.engine.ts` evaluates workforce/provider availability, blocks/unavailability, provider eligibility/capability and resource/room constraints.
- `src/domain/agenda/conflict.engine.ts` contains the canonical conflict rules.
- `src/domain/agenda/agenda.types.ts` defines the canonical appointment statuses:
  `scheduled`, `confirmed`, `arrived`, `in_session`, `completed`, `no_show`, `cancelled`, `rescheduled`.
- Database authority is `master_agenda_events`.
- Existing exclusion constraints enforce relevant overlap rules.
- Workforce approved absence can prevent overlapping new/updated Agenda events.

These are **inspection targets**. The new conversation must verify their current state before relying on them.

## 6. Known Gate 04 reconciliation questions

The first practical work is not to create a Resource Engine. It is to reconcile ownership and execution paths.

Verify:

1. Who owns `clinic_resources`, `clinic_rooms`, and historical `tenant_devices`?
2. Is `clinic_procedure_resources` canonical, and what exactly does it represent?
3. Which Workforce records are authoritative for provider availability and eligibility?
4. Does every Agenda mutation converge on `agenda.mutation-service.ts`?
5. Are there client-side or other direct mutation paths into `master_agenda_events` that bypass the canonical service?
6. Is the availability engine currently a validator only, or is candidate generation required later?
7. Where is clinic resource/concurrency policy actually stored and enforced?
8. Does Inventory/consumables incorrectly block booking anywhere?
9. Are permissions and reason disclosures consistent with the UX/audit layering decision?
10. Are reschedule/no-show/cancel semantics and audit history complete enough for the current Agenda contract?
11. Are buffer times and conflict constraints internally consistent?
12. Are already-booked appointments handled correctly when workforce/resource availability changes?
13. Are late arrival and overrun correctly separated between planned Agenda time and actual Queue/Visit time?
14. Are emergency insertion, provider transfer, waitlist, booking approval and multi-resource cases explicitly scoped rather than accidentally implemented by ad-hoc logic?
15. Which findings belong to Gate 04, and which belong to later owning gates?

## 7. Gate ownership rule for recurring failures

A recurring failure must be assigned to the domain that owns the violated invariant.

Use this rule:

- If the invariant is **appointment creation/update/status/conflict/availability/calendar representation**, investigate **Agenda / Gate 04**.
- If the invariant is **clinical progression / treatment stage / clinical next action generation**, investigate **Treatment Plan / Clinical ownership**.
- If the invariant is **retention/review/follow-up continuity or communication**, investigate **Follow-up / Gate 11**.
- If the invariant is **patient identity/duplicate/clinic relationship**, it belongs to **Gate 03 / Patient Identity**, already closed unless a direct regression is proven.
- A downstream symptom does not automatically transfer ownership upstream.
- Do not reopen a closed gate merely because another gate exposes a symptom involving data produced by that closed gate.
- A closed earlier gate may be reopened only if current evidence proves a regression or an unresolved dependency that was required for its closure.

## 8. Gate 04 scope boundary

Gate 04 may reconcile and extend Agenda only where required by its approved responsibility:

- appointment authority;
- availability/capacity integration;
- provider/resource/room feasibility;
- conflict prevention;
- appointment lifecycle;
- cancellation/reschedule/no-show semantics;
- calendar representation;
- traceability and audit;
- integration with Patient Journey/Next Action without taking ownership of clinical or follow-up state.

Do not silently expand Gate 04 into:

- Patient Flow rebuild;
- Patient Identity rebuild;
- Treatment Plan redesign;
- Follow-up implementation;
- Inventory/consumables engine;
- a second scheduling/calendar engine;
- a universal resource engine detached from owning domains.

## 9. Required execution method

The governing CSAPI method remains:

**VERIFY → PLAN → IMPLEMENT → BUILD → VERIFY → REVIEW → DOCUMENT → CLOSE**

For Gate 04, the immediate sequence is:

**Current-state reconciliation → ownership matrix → canonical-source reconciliation → execution-path audit → gap classification → explicit decision(s) → implementation only where required → engineering tests → clean DB migration verification → Live Supabase verification → runtime verification → production verification when justified → final reconciliation → documentation → closure.**

Documentation alone never closes a gate.

## 10. Repository / Git rules

- `main` is the production authority.
- Do not make direct main changes for ordinary implementation.
- Do not open a PR for every small investigation or correction.
- Keep one coherent workstream/branch for a material Gate 04 implementation package when a branch is required.
- Do not revive historical CSAPI branches.
- Do not create duplicate engines.
- Preserve existing patient/demo/regression data.
- Migrations must be isolated and reconciled with Live migration history.
- No Vercel deployment for investigation-only work.
- Production deployment is only after the required pre-production evidence passes.
- Do not weaken, delete, skip or relabel failing required tests to obtain green results.

## 11. Gate 03 closure context

Gate 03 is closed by the authoritative record:

`docs/CSAPI/GATES/GATE-03-FINAL-CLOSURE-RECONCILIATION-2026-09-29.md`

The final Gate 03 production evidence passed its identity path. A later Follow-up failure is explicitly outside Gate 03 ownership and does not reopen Gate 03.

Treatment Plan → explicit Update → Next Action → patient-specific Agenda handoff → Stage Advance → Plan Completion also passed in Production. No Treatment Plan or Gate 02 reopening is required solely because of that chain.

## 12. New-conversation instruction — Gate 04 implementation owner

When the next conversation begins with:

**CSAPI**

the AI Engineering Leader must:

1. load the governing CSAPI documents and this handoff;
2. inspect current GitHub/main/open PR state;
3. inspect relevant Live Supabase state;
4. reconcile the handoff against current reality;
5. confirm that Gates 01–03 remain closed;
6. resume at **Gate 04 PRECHECK / OWNERSHIP & INTEGRATION RECONCILIATION**;
7. not start coding before the reconciliation identifies the owning layer and required change;
8. continue without restarting previously closed gates or re-litigating already approved architectural decisions unless current evidence demonstrates a contradiction.

## 13. Handoff status — IMPLEMENTATION-READY

**Gate 04:** OPEN — IMPLEMENTATION-READY  
**Current phase:** IMPLEMENTATION-READY / PLAN FROZEN  
**Implementation:** NOT STARTED  
**Implementation authority:** frozen Gate 04 Execution Contract + Implementation Plan + Verification Plan  
**Immediate implementation action:** create one controlled Gate 04 implementation branch from the then-verified main and execute WP-1 → WP-8 as evidence permits  
**Gate 11 Follow-up:** separate downstream gate; known continuity issue remains deferred to Gate 11  
**Gates 01–03:** CLOSED / VERIFIED / PRODUCTION VERIFIED

**Important:** Implementation-Ready is not Gate 04 closure. Gate 04 remains OPEN until implementation, verification, runtime/production evidence and final reconciliation are complete.

This document is a continuation control point, not a substitute for current-state verification.

## 14. Gate 04 — Product / Architecture Decision Freeze — 2026-09-29

The following four decisions were explicitly approved by the Product Owner after the Gate 04 ownership/integration reconciliation:

### D04-01 — Resource concurrency / capacity
- Agenda resource concurrency is policy-driven.
- Default behavior for a resource with no explicit sharing/capacity policy is exclusive use.
- The architecture must support shared/capacity-based use later where the owning clinic/resource policy explicitly permits it.
- Agenda must not encode a universal permanent exclusivity rule.

### D04-02 — Service/Procedure requirements
- The Service/Procedure definition is the canonical source for what operational resources a service requires.
- Agenda is the scheduling authority and consumes those requirements as integration input.
- Agenda determines whether the required provider/room/device/resource combination is schedulable; it does not become the owner of the underlying resource requirement truth.
- Provider/doctor is conditional by service and is not a universal appointment requirement.

### D04-03 — Appointment auditability
- Every Appointment mutation must be traceable through the canonical audit boundary, including create, update, status transition, cancellation, and reschedule.
- Audit evidence must preserve the complete decision context while respecting the permission-aware UX disclosure boundary.

### D04-04 — Workforce source boundary
- Gate 04 consumes the canonical Workforce contract for availability, schedule, leave/unavailability and eligibility/capability.
- Legacy Workforce fallback/source cleanup is outside Gate 04 and remains assigned to the Workforce owning gate.
- Gate 04 must not create another workforce availability engine.

### Engineering findings frozen without additional Product Owner decision
The following are execution findings, not new product decisions:
- The current Agenda TypeScript/server mutation contract still makes doctorId mandatory; this must be reconciled with the approved conditional-provider model.
- The live procedure-resource validator is an inactive/historical compatibility boundary (active_model=false); the historical clinic_procedure_resources model must not be resurrected without evidence. Gate 04 must establish the current canonical Service/Procedure → requirement contract before enforcement.
- The current Agenda audit trigger covers UPDATE, not CREATE; create audit coverage is therefore a Gate 04 implementation gap.
- Direct client mutation hooks exist in agenda.queries.ts, but repository search found no active callers. They are classified as a duplicate/bypass code surface; runtime activation must be verified before removal or routing changes.
- Current database exclusion constraints enforce exclusive doctor/room/resource/patient overlap; these remain defense-in-depth while the approved policy-driven concurrency contract is reconciled.
- Emergency insertion, provider transfer, waitlist and booking approval must remain explicit scoped integration/extension points; no ad-hoc second workflow or scheduler is authorized.
- Existing appointments must not be silently deleted/rebooked merely because Workforce availability changes; impact handling remains an owning-domain/coordination integration concern.
- Late arrival and overruns belong to actual Queue/Visit execution timing and must not silently rewrite the planned Agenda appointment schedule.

### Gate ownership result
No finding currently requires reopening Gate 01, Gate 02 or Gate 03. Follow-up continuity remains Gate 11. Treatment Plan remains the owner of clinical progression and next-action generation; Agenda owns the appointment when that next action becomes a booking.

Gate 04 implementation authorization remains bounded to the approved Gate 04 scope and the four decisions above.

## 15. Gate 04 Implementation Planning / Design — 2026-09-29

Gate 04 precheck and Product Owner decision freeze are complete.

Design authority:
- `GATE-04-OWNERSHIP-INTEGRATION-RECONCILIATION-2026-09-29.md`
- `GATE-04-AGENDA-IMPLEMENTATION-DESIGN-2026-09-29.md`
- `GATE-04-AGENDA-EXECUTION-CONTRACT-2026-09-29.md`
- `GATE-04-IMPLEMENTATION-PLAN-2026-09-29.md`
- `GATE-04-VERIFICATION-PLAN-2026-09-29.md`

Implementation sequence is frozen as WP-1 canonical mutation convergence → WP-2 booking requirement/provider feasibility → WP-3 resource concurrency policy → WP-4 audit completion → WP-5 UI convergence → WP-6 verification infrastructure → WP-7 integrated verification → WP-8 release/closure.

Team-function ownership is documented in the Gate 04 Implementation Plan. The AI Engineering Leader retains technical orchestration and final closure authority; independent QA/Security verification remains independent.

Machine-readable Gate 04 workstream contract and executable verification lanes are deliberately deferred to WP-6, where the runner mappings can be added coherently with the implementation package. No unsupported workstream contract is introduced prematurely.

Known ownership/documentation correction:
`clinic_resources` is treated as operational resource configuration owned by Clinic Administration / the owning operational-resource boundary for Gate 04; `inventory_items` remains Inventory stock truth. Older umbrella wording must not be used as evidence of a second resource owner.

Next conversation-independent continuation: begin from the frozen Gate 04 implementation contract, not from a new architecture debate.
## 16. Gate 04 security-authority reconciliation — 2026-09-29

Live Supabase inspection confirmed `master_agenda_events` currently exposes INSERT/UPDATE/DELETE privileges to authenticated users and corresponding authenticated RLS write policies. Therefore the final Gate 04 design requires a protected persistence command boundary in addition to server-action convergence.

Implementation constraint:
- first-party mutation decisions remain in `agenda.mutation-service.ts`;
- persistence uses narrow server-role Agenda command functions;
- direct authenticated/anonymous table writes are denied after caller migration;
- no duplicate Availability/Conflict engine is introduced;
- the existing Auth administration client is not repurposed for Agenda persistence.

## 17. Gate 04 Implementation-Ready Closure — 2026-09-29

This handoff closes the planning/decision session at the exact transfer state requested.

### Frozen execution authority
- Gate 04 architecture and ownership reconciliation is complete.
- Four Product Owner-approved decisions are frozen.
- Gate 04 Execution Contract is frozen.
- Gate 04 Implementation Plan is frozen.
- Gate 04 Verification Plan is frozen.
- Security/DB mutation-authority design is frozen.
- No unresolved Product Owner decision remains for the approved Gate 04 scope.
- No application/database implementation was performed as part of this closure.

### Binding integration rule
All Gate 04 implementation must integrate with the already-closed Gates 01–03 exactly as verified. Gate 04 must not alter their ownership or silently introduce duplicate engines.

### Sequential-gate rule
Gate 05 planning may begin now because Gate 04 has reached Implementation-Ready. Gate 05 implementation must not begin before Gate 04 is completed and closed, unless an explicit CSAPI dependency decision proves that earlier implementation is required.

### Handoff principle
The implementation owner inherits the decisions in this handoff as binding engineering instructions, not suggestions. Any deviation requires evidence, classification and explicit decision/change control before implementation proceeds.


## 18. Gate 05 planning checkpoint — 2026-09-30

Gate 05 — Clinical Care has completed its architecture, current-state reconciliation, canonical entity/lifecycle design, template/documentation architecture, Clinical Workspace interaction design, and Implementation Design.

Gate 05 state:
- OPEN — IMPLEMENTATION-READY / implementation not started.
- Clinical architecture is comprehensive from the beginning and specialty-capable.
- Clinician UX remains one simple Clinical Workspace with progressive disclosure.
- Medical Record is a projection/read model, not a mega-table.
- Visit remains independent from Treatment Plan.
- Procedure Definition remains Gate 07; Procedure Execution belongs to Clinical.
- Follow-up remains Gate 11; Clinical produces the clinical requirement/consequence only.
- Agenda remains Gate 04 owner of appointments.
- Patient Flow remains Gate 01 owner of clinic-day Visit lifecycle.
- No generic Clinical Result/Consequence table or generic global Rules Engine is authorized.

Binding Gate 05 artifacts:
- docs/CSAPI/GATES/GATE-05-CLINICAL-CURRENT-STATE-RECONCILIATION-2026-09-30.md
- docs/CSAPI/GATES/GATE-05-CLINICAL-CANONICAL-ENTITY-RELATIONSHIP-LIFECYCLE-DESIGN-2026-09-30.md
- docs/CSAPI/GATES/GATE-05-CLINICAL-ENTITY-DESIGN-REVIEW-2026-09-30.md
- docs/CSAPI/GATES/GATE-05-CLINICAL-TEMPLATE-DOCUMENTATION-ARCHITECTURE-2026-09-30.md
- docs/CSAPI/GATES/GATE-05-CLINICAL-WORKSPACE-TARGET-INTERACTION-DESIGN-2026-09-30.md
- docs/CSAPI/GATES/GATE-05-CLINICAL-IMPLEMENTATION-DESIGN-2026-09-30.md

The next Gate 05 execution step, when Gate 04 is closed or an explicit dependency is approved, is VERIFY current main/relevant cross-domain state → reconcile exact permission/naming boundaries → create one coherent implementation workstream → implement → build/test → runtime verify → production verify where required → document → close.

A new conversation starting with CSAPI must not restart Gate 05 architecture or reopen Gates 01–03 unless current evidence demonstrates a real contradiction/regression. It should use these artifacts as the starting planning authority and verify current reality before implementation.
