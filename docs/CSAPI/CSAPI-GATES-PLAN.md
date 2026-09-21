# CORE SYSTEM — CSAPI DECISION GATES PLAN

Status: ACTIVE / Current sequential plan
Last reconciled: 2026-09-21
Current Gate: Gate 02 — Patient Journey
Previous Gate: Gate 01 — Patient Flow — CLOSED

> This is the CSAPI working gate map derived from CSAPI-DOCUMENTATION-PACK-2026-09-17.zip and reconciled with the completed Gate 01 evidence. A gate may be split, merged, reordered or added only through an explicit CSAPI decision recorded in the ledger.

| # | Gate | Scope | Status |
|---|---|---|---|
| 01 | Patient Flow | Queue, Clinical Visit, Pending Close, Reception Workflow, Completed; Procedure/Session; boundaries with Treatment Plan and Follow-up | CLOSED |
| 02 | Patient Journey | Longitudinal patient lifecycle over time; next actions and continuity | OPEN — PRECHECK READY |
| 03 | Patient & Identity | Canonical identity, clinic relationship, duplicate detection, search, history, insurance, portal relationship | OPEN |
| 04 | Agenda & Scheduling | Agenda authority, Calendar representation, provider/resource availability, conflicts, cancel/reschedule/no-show/context | OPEN |
| 05 | Clinical Care | Clinical Visit, Clinical Decision, Medical Record, Medical Files, Measurements, Photos, Procedure, Session | OPEN |
| 06 | Treatment Planning | Plan lifecycle, stages, next actions, linkage to visits/appointments/packages/finance; not every visit requires a plan | OPEN |
| 07 | Procedures / Services / Packages / Offers | Medical procedure vs clinic service vs commercial package/offer; master/customization relationships | OPEN |
| 08 | Financial & Commercial Flow | Commercial commitment, financial plan, invoice, payment, refund, insurance, expense, revenue | OPEN |
| 09 | Workforce & Resource Eligibility | Staff/provider, skills, qualifications, availability, schedules, leave, rooms, devices, procedure eligibility | OPEN |
| 10 | Inventory & Procurement | Consumption, inventory, reorder, procurement, suppliers, receiving, obligations, supplier payment | OPEN |
| 11 | Follow-up & Retention | Follow-up lifecycle, retention continuity, scheduling/automation, and controlled integrations with Communications, Agenda and Journey Coordination; one Follow-up engine only | OPEN |
| 12 | Communications & Chat | Clinic-wide authorized internal communications; Chat as a compact surface over Communications | OPEN |
| 13 | Notifications & Operational Work | Distinguish Communication, Notification, Operational Work; event-to-output rules | OPEN |
| 14 | Medical Files & Patient Portal | File metadata/storage, clinical relationship, annotations, measurements, AI, portal release permissions, audit | OPEN |
| 15 | Analytics & Reports | Business vs Clinical Analytics; unified report viewer; metric source-of-truth | OPEN |
| 16 | Subscription / Entitlement / Capability | Tenant → Subscription → Entitlement → Capability → Permission/Access; feature flags and limits | OPEN |
| 17 | Security / Authorization | Auth, roles, permissions, overrides, entitlements, RLS, RPC security, tenant/branch isolation | OPEN |
| 18 | Workflow / Automation / Events | Events, transitions, automation, cron, triggers, operational work, notifications, audit, idempotency/retry | OPEN |
| 19 | API / Integration Architecture | Server Actions, API routes, Realtime, Storage, external integrations, future webhooks | OPEN |
| 20 | Global Experience | Login, Home, Header, Sidebar, Workspace, My Workspace, Modules, responsive, RTL/LTR, accessibility, Chat, Notifications, context preservation | OPEN |

## Gate closure rule

No gate is CLOSED based on documentation alone. Closure requires the applicable approved decision, implementation, automated verification, runtime/data/security evidence, and synchronized documentation.

## Gate 02 transition rule

Gate 02 does not reopen Gate 01 and does not redefine Patient Flow authority.

Gate 02 examines the longitudinal continuity contract around the existing Patient Journey implementation:

Patient → Clinical/Operational interaction → Result → Next Action / No Next Action → Future Appointment / Follow-up / Operational Work → Next Interaction → Continuation

The purpose is to prove ownership and continuity, not to create a universal workflow engine.


## Gate 02 ↔ Gate 11 dependency rule

Gate 02 remains the longitudinal continuity decision/integration gate. Gate 11 remains the independent Follow-up & Retention implementation gate.

Gate 02 defines the continuity contract. Gate 11 implements and verifies Follow-up-owned behavior within that contract. Gate 11 does not own Communications, Agenda, Notification delivery infrastructure, or Journey Coordination Work Items.

The map is therefore unchanged; the Gate 11 scope wording above is the reconciled interpretation of its ownership. Any later gate split, merge or reorder requires a separate explicit CSAPI decision recorded in the ledger.
