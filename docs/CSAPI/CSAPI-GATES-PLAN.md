# CORE SYSTEM — CSAPI DECISION GATES PLAN

Status: ACTIVE / Current sequential plan
Last reconciled: 2026-09-22
Current Gate: Gate 03 — Patient & Identity
Previous Gate: Gate 02 — Patient Journey — CLOSED / VERIFIED / PRODUCTION VERIFIED

> This is the CSAPI working gate map derived from CSAPI-DOCUMENTATION-PACK-2026-09-17.zip and reconciled with the completed Gate 01 evidence. A gate may be split, merged, reordered or added only through an explicit CSAPI decision recorded in the ledger.

| # | Gate | Scope | Status |
|---|---|---|---|
| 01 | Patient Flow | Queue, Clinical Visit, Pending Close, Reception Workflow, Completed; Procedure/Session; boundaries with Treatment Plan and Follow-up | CLOSED |
| 02 | Patient Journey | Longitudinal patient lifecycle over time; next actions and continuity | CLOSED — VERIFIED / PRODUCTION VERIFIED |
| 03 | Patient & Identity | Canonical identity, clinic relationship, duplicate detection, search, history, insurance, portal relationship | IMPLEMENTED — VERIFICATION BLOCKED BY FAILED E2E |
| 04 | Agenda & Scheduling | Agenda authority, Calendar representation, provider/resource availability, conflicts, cancel/reschedule/no-show/context | OPEN |
| 05 | Clinical Care | Clinical Visit, Clinical Decision, Medical Record, Medical Files, Measurements, Photos, Procedure, Session | OPEN |
| 06 | Treatment Planning | Plan lifecycle, stages, next actions, linkage to visits/appointments/packages/finance; not every visit requires a plan | OPEN |
| 07 | Procedures / Services / Packages / Offers | Medical procedure vs clinic service vs commercial package/offer; master/customization relationships | OPEN |
| 08 | Financial & Commercial Flow | Commercial commitment, financial plan, invoice, payment, refund, insurance, expense, revenue | OPEN |
| 09 | Workforce & Resource Eligibility | Staff/provider, skills, qualifications, availability, schedules, leave, rooms, devices, procedure eligibility | OPEN |
| 10 | Inventory & Procurement | Consumption, inventory, reorder, procurement, suppliers, receiving, obligations, supplier payment | OPEN |
| 11 | Follow-up & Retention | Event → follow-up → communication/notification → operational work → completion; one engine only | OPEN |
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


## Gate 02 closure — 2026-09-22

Gate 02 — Patient Journey is CLOSED after approved implementation, automated structural verification, live Supabase continuity integrity verification, main merge, production deployment verification and synchronized closure documentation. The next gate is Gate 03 — Patient & Identity. The 20-gate map remains unchanged.


## Gate 03 current authority — 2026-09-22

Gate 03 architectural/product decisions were explicitly approved and the full READ → INSPECT → VERIFY → RECONCILE decision/reconciliation work was completed.

The Implementation Design is now complete and reconciled in:
`docs/CSAPI/GATES/GATE-03-PATIENT-IDENTITY-IMPLEMENTATION-DESIGN-REVISED-2026-09-22.md`

**Current State:** EXECUTION APPROVED — PRE-IMPLEMENTATION VERIFICATION CONTINUES; MATCH-POLICY BLOCKER RESOLVED.

This state does not authorize application code, migrations, production database mutation, or deployment. The match-policy pre-implementation blocker has been resolved in the authoritative Revised Implementation Design. Continue pre-implementation dependency verification, then proceed to implementation and the normal verification/closure sequence.

The earlier non-revised Implementation Design document is historical/superseded and is not an execution authority.

The 20-gate map remains unchanged. Gate 01 and Gate 02 remain CLOSED and must not be reopened.


### Gate 03 execution approval — 2026-09-22

Execution has been explicitly approved by the Product Owner. Gate 03 is now authorized to proceed through Pre-Implementation Verification → Implement → Test → Runtime Verify → Document → Close, within the approved scope.


### Gate 03 match-policy blocker resolution — 2026-09-22

The initial patient-match-v1 parameters were internally inconsistent: without national ID/card, the maximum score with DOB was 70 while EXACT_MATCH required 80. This was resolved without lowering the 80 threshold. The revised policy retains the weighted high-confidence path and adds a controlled non-government-ID core-profile EXACT_MATCH path requiring exact DOB, first/father/family names, sex, normalized phone, two additional corroborating evidence classes, no strong conflict, and a unique candidate. National ID remains optional and no single field is a unique identity key.

Authoritative resolution: `docs/CSAPI/GATES/GATE-03-PATIENT-IDENTITY-MATCH-POLICY-RESOLUTION-2026-09-22.md`.

Current Gate 03 state: EXECUTION APPROVED — PRE-IMPLEMENTATION VERIFICATION CONTINUES. Gate 01 and Gate 02 remain CLOSED.


## Gate 03 implementation execution reconciliation — 2026-09-22

The approved implementation has been applied to the live Supabase environment and is now under final verification.

Implemented: canonical System Patient Identity foundation, multi-attribute patient matching policy `patient-match-v2`, human REVIEW_REQUIRED resolution, identity-preserving demographic updates, authoritative Patient Module search, separate Portal Identity/auth binding, tenant relationship integrity, direct identity-internal access denial, existing patient identity seeding, and binding Gate 03 verification contract.

Live Supabase migration history records the applied Gate 03 migrations as versions `20260922130830`, `20260922130928`, `20260922131239`, `20260922131621`, and `20260922131803`.

Production deployment remains pending until engineering verification, main integration, and post-main production verification are complete.


## Gate 03 closure correction — 2026-09-22

The earlier Gate 03 CLOSED — VERIFIED / PRODUCTION VERIFIED state is superseded by subsequent verification evidence showing a required GitHub Actions E2E failure.

Gate 03 implementation is complete and the database/live runtime evidence is substantially verified, but the gate closure rule requires all applicable automated verification to pass. Therefore the gate remains open for verification.

Closure is blocked until the failed E2E is investigated, classified, fixed at the correct layer if it is a real defect, and rerun successfully on the exact candidate. A production HTTP 200, Vercel READY deployment, clean Supabase audit, or documentation reconciliation cannot substitute for failed required E2E evidence.

Current execution point:
VERIFY → FAILED E2E ROOT-CAUSE INVESTIGATION → FIX IF REQUIRED → REQUIRED E2E PASS → FINAL RECONCILIATION → CLOSE.

Do not advance to Gate 04. Do not reopen Gate 01 or Gate 02.
