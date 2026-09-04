# ADR-014 — Follow-up, Communications & Journey Coordination Boundaries and Pre-Remediation Gate

**Date:** 2026-09-05  
**Status:** Approved — Architectural Baseline  
**Decision Type:** Cross-domain boundary / remediation gate  
**Scope:** Follow-up, Communications, Journey Coordination, Agenda, Treatment Plan, Patient Portal, Notification Queue, Entitlements

## 1. Context

The end-to-end audit of the current CORE SYSTEM architecture, repository implementation, and live operational structures identified that the core concepts already exist, but several boundaries require explicit architectural enforcement before remediation and final production validation.

Historical engineering documents are not sufficient authority where they diverge from the current architecture. This ADR therefore records the current architectural truth that governs the next remediation step.

## 2. Architectural Truth

The following responsibilities are distinct and must remain distinct:

- **Treatment Plan:** authoritative clinical plan and progression.
- **Follow-up:** patient-care continuity and follow-up progression after a visit/treatment.
- **Communications:** creation, management, routing and delivery orchestration of communication.
- **Journey Coordination:** operational work, requests, handoffs, next actions and escalations when operational work is actually required.
- **Agenda:** appointment and scheduling lifecycle.
- **Patient Portal:** patient-facing surface/capability consuming platform services; it is not a separate messaging engine or independent communication domain.
- **Notification Queue:** delivery/execution infrastructure; it is not a business source of truth and must not become a substitute for the Communications domain.

A Follow-up may result in one or more of: communication, operational work, or an appointment. None of these downstream responsibilities becomes owned by Follow-up merely because Follow-up initiated the need.

## 3. Canonical Flow

The governing conceptual flow is:

`Patient Journey → Clinical/Treatment Truth → Treatment Plan → Stage → Next Action / Follow-up → (Communication and/or Work and/or Appointment)`

With ownership remaining:

`Communication → Communications`  
`Work → Journey Coordination`  
`Appointment → Agenda`  
`Clinical progression → Patient Journey / Clinical domain`

A Next Action is not automatically a Work Item. A Work Item is created only when an actual operational action, request, handoff or escalation is required.

## 4. Decisions

### D1 — Follow-up is a distinct continuity capability

Follow-up remains a first-class patient-continuity responsibility. It must not be reduced to a notification table, communication channel, or generic task list.

### D2 — Communications is an independent domain

Communications owns communication records and communication orchestration. Follow-up may request communication, but must not become the communication engine.

### D3 — Journey Coordination owns operational work

Operational work created from a communication request, domain event, or completed follow-up belongs to Journey Coordination. Communications and Follow-up must not implement competing work engines.

### D4 — Appointment ownership remains in Agenda

Follow-up and Treatment Plan may establish a future appointment requirement, but appointment lifecycle and booking remain owned by Agenda.

### D5 — Notification Queue is infrastructure

`notification_queue` is an execution/delivery staging mechanism. Its existence, population, or status must never be treated as proof that a communication was successfully delivered.

### D6 — Follow-up Automation must not directly own communication delivery

The current implementation path that effectively couples Follow-up Automation directly to `notification_queue` is considered architectural drift. Remediation must preserve Follow-up ownership of continuity while routing communication intent through Communications and using the queue only as delivery infrastructure.

### D7 — Entitlement and permission boundaries are independent

RBAC permissions answer **who may perform an action**. Tenant entitlements answer **what the tenant is commercially enabled to use**. Neither may bypass the other.

Clinic Admin administrative authority does not constitute a license/entitlement bypass. The existing Clinic Admin entitlement bypass is therefore a remediation target and must be removed without weakening legitimate administrative permissions.

### D8 — Notification Queue tenant isolation requires hardening

The queue contains potentially sensitive outbound recipient/message data. Its RLS must be reviewed and reduced to the minimum legitimate access boundary before production closure. Structural tenant isolation and least-privilege behavior must both be validated.

### D9 — Provider absence is not itself an architectural blocker

External Email/SMS/WhatsApp provider credentials are deployment/configuration concerns. The architecture is considered ready only if Clinic Admin can configure permitted sender channels and the system can later connect an approved provider without redesigning Follow-up, Communications, or Patient Portal boundaries.

Actual external delivery remains a separate runtime validation requirement.

## 5. Required Remediation Before Production Closure

No production-closure claim may be made until the following are completed and evidenced:

1. Remove the Follow-up → Notification Queue architectural coupling at the business-responsibility level; preserve existing Follow-up records and automation semantics.
2. Route communication intent through Communications.
3. Preserve Coordination as the sole owner of operational Work Items.
4. Remove Clinic Admin entitlement bypass.
5. Harden `notification_queue` RLS and verify tenant isolation/least privilege.
6. Do not delete or alter the existing intentional Follow-up test dataset during remediation or validation.
7. Execute authenticated end-to-end runtime validation covering:
   `Visit → Follow-up → Communication and/or Work and/or Appointment → Completion`.
8. Execute positive and negative permission/entitlement tests.
9. Validate that queued communication is not reported as delivered unless delivery evidence exists.
10. Only after all evidence succeeds may the status become **PRODUCTION CLOSED**. Otherwise status remains **NOT CLOSED — BLOCKER**.

## 6. Non-Goals

This ADR does **not** authorize:

- rebuilding Follow-up;
- rebuilding Communications;
- creating a second notification engine;
- creating a second Work/Task engine;
- moving appointment ownership into Follow-up;
- converting Patient Portal into a separate communication domain;
- deleting or rewriting existing intentional Follow-up test data;
- broad refactoring unrelated to the identified boundary violations.

## 7. Implementation Principle

Remediation follows the established CORE SYSTEM engineering rule:

**Inspect → Reuse → Extend → Create only when genuinely required.**

Existing canonical tables, functions, permissions, and workflows must be reused where they already satisfy the architectural contract. New structures are permitted only where the audit proves an existing structure cannot satisfy the contract safely.

## 8. Validation Gate

This ADR is an architectural decision and remediation gate. It does **not** claim implementation closure, runtime closure, or production readiness by itself.

The next authorized phase is:

**ADR Baseline → Non-Breaking Remediation → Runtime Validation → Production Closure Decision.**
