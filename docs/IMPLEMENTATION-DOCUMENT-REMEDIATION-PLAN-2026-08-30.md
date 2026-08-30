# CORE SYSTEM — Implementation Documentation Remediation Plan

**Date:** 2026-08-30  
**Status:** Ready for execution  
**Scope:** Documentation and implementation-contract remediation only. No code/runtime acceptance is implied by this document.

## 1. Purpose

Convert the Ideal Operational Architecture Audit into a deterministic implementation-documentation package. The goal is to remove ambiguity between architectural decisions, historical decisions, implementation plans, execution claims, validation evidence, and closure.

## 2. Governing rules

1. Architecture is not implementation.
2. An implementation claim is not validation.
3. `CLOSED` is not authoritative unless it references the exact accepted evidence state.
4. Historical documents remain preserved but must be classified as `CURRENT`, `SUPERSEDED`, `HISTORICAL`, `RECONCILED`, or `INVALID/CONTRADICTORY`.
5. Every cross-domain contract must name one owner and one source of truth.
6. No domain may create a second engine for another domain's responsibility.
7. `Implemented`, `Validated`, `Production Verified`, and `Closed` are separate states.

## 3. Remediation workstreams

### R01 — Procedure / Service / Package / Treatment Plan
**Owner:** Medical Master Library / Patient Journey / Financial as applicable.

Required contract:
`Procedure Master → Clinic Procedure → Service → Package/Offer → Treatment Plan → Appointment/Visit`

Must define ownership, identity, clinical meaning, commercial meaning, and handoff boundaries.

### R02 — Treatment Plan → Next Action → Appointment

Required contract:
`Treatment Plan → Treatment Stage/Next Action → Operational Work → Booking requirement → Agenda → Appointment → Visit → next stage`

Must prevent Treatment Plan, Follow-up, Coordination, and Agenda from becoming competing workflow owners.

### R03 — Package / Financial Plan / Installments / Sessions

Explicitly separate:
- Package = commercial commitment.
- Treatment Plan = clinical commitment.
- Financial Plan = financial commitment.
- Appointment = scheduled execution.
- Session/Visit = actual execution.

### R04 — Workforce → Availability → Agenda

Define the effect of working patterns, leave, illness, conferences, official holidays, permissions, and capacity on appointment availability and existing appointments.

### R05 — Staff + Room + Device + Procedure

Define real appointment feasibility as the combination of required procedure, qualified/authorized actor, required room/resource/device, and time capacity.

### R06 — Insurance lifecycle

Define:
`Patient/Coverage → responsibility → service → claim-ready information → claim → reconciliation → patient balance`

Core must not depend on electronic payer integration.

### R07 — Procurement lifecycle

Define:
`Need → Purchase Request/Order → Supplier → Receiving → Inventory → Supplier obligation → Payment`

Inventory remains the stock source of truth; Purchasing does not create a second inventory engine.

### R08 — Revenue → Commission → Payroll

Define the distinction between invoice value, collected revenue, eligible revenue, commission basis, commission, and payroll.

### R09 — Communication → Request → Work

Communication remains communication. Explicit actionable requests may create operational work through Coordination; messages do not become a second task/workflow engine.

### R10 — Domain Event → Coordination → Authorized Actor → Completion

Define:
`Event → Required Work → Authorized Actor → Assignment/Request/Handoff → Execute → Monitor/Escalate → Close → Analyze`

Coordination does not own the originating domain truth.

### R11 — Skill / Qualification / Permission

Standardize:
- Role = organizational label.
- Permission = authorization.
- Skill = competence/capability.
- Qualification = formal credential.

A skill or qualification must never silently become a permission.

### R12 — Documentation authority and closure

Create one current-status authority and require every closure to reference the exact implementation candidate, deployment/database state, validation evidence, and acceptance decision.

## 4. Required artifacts

For each R01–R12 create/update an implementation contract containing:

1. Objective.
2. Business scenario.
3. Domain owner.
4. Source of truth.
5. Trigger.
6. Actors.
7. Authorization.
8. UX/work surface.
9. Persistence responsibility.
10. Cross-domain input/output.
11. State transitions.
12. Failure/escalation path.
13. Audit requirements.
14. Dependencies.
15. Acceptance criteria.
16. Required evidence.
17. Historical documents reconciled.

## 5. Documentation reconciliation matrix

For every relevant historical/current document record:

`Document → Date → Claimed state → Decision represented → Current status → Action → Replacement/reference → Reason`

Actions are limited to:
`KEEP / UPDATE / RECONCILE / SUPERSEDE / ARCHIVE / INVALIDATE`

## 6. Execution order

1. R12 — status/closure authority.
2. R01 — clinical/commercial identity chain.
3. R02 — Treatment Plan to next action.
4. R03 — commercial/financial/session chain.
5. R04 + R05 — workforce/resource feasibility.
6. R06 — insurance.
7. R07 — procurement.
8. R08 — commission/payroll.
9. R09 + R10 — communication and coordination fabric.
10. R11 — authorization/competence terminology.
11. Re-run the full ideal-scenario traceability matrix.

## 7. Definition of documentation completion

A remediation item is `DOCUMENTATION COMPLETE` only when:

- its architecture is identified;
- its owner/source of truth are explicit;
- all dependent domains are named;
- implementation work is unambiguous;
- acceptance criteria are testable;
- historical conflicts are classified;
- superseded documents are linked;
- future implementation evidence is specified.

This status does **not** mean the software is implemented or validated.

## 8. Next stage boundary

After documentation remediation is approved, the next stage may compare the resulting contracts against actual GitHub implementation, Supabase state, Vercel deployment, and runtime behavior. That is a separate validation stage.
