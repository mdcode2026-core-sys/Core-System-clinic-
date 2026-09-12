# CORE SYSTEM — Communications / Chat / Patient Portal Historical Documentation Reconciliation

**Date:** 2026-09-12  
**Status:** Binding reconciliation register  
**Governing contract:** `docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-BINDING-EXECUTION-CONTRACT-2026-09-12.md`

## Purpose

This register prevents historical documentation from reintroducing superseded authority boundaries during future implementation or review.

## Current architectural truth

- Communications is the single authoritative clinic communication domain.
- Patient Portal is a patient-facing Module / Surface / Channel over Communications.
- Global Header Chat is a compact interaction surface over Communications, not a domain and not a separate store.
- Notifications remain a separate notification/feed authority.
- Journey Coordination / Work Center owns operational work, assignment, ownership, priority, due state, handoffs and escalation.
- `communication_message_reads` is the authoritative personal clinic-user read state.
- Basic patient ↔ clinic messaging is Core Communications capability and is not gated by `patient_experience.advanced`.
- `patient_portal_messages` is legacy/current implementation history only and is not the final messaging authority.

## Historical document classification

| Document | Classification | Binding interpretation |
|---|---|---|
| `docs/COMMUNICATIONS-ENGINEERING-BLUEPRINT.md` | Current / aligned | Communications owns patient communication; Portal is the patient-facing channel. |
| `docs/JOURNEY-COORDINATION-ENGINEERING-BLUEPRINT.md` | Current / reconciled | Portal is explicitly a Module / Surface / Channel; Communications owns messaging. |
| `docs/ADR-014-FOLLOW-UP-COMMUNICATIONS-COORDINATION-BOUNDARIES.md` | Current / aligned | Portal is not an independent messaging engine; Notifications remain separate. |
| `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md` | Current / aligned | Header surfaces remain distinct while sharing Communications authority. |
| `docs/AJM-0-BASELINE-READINESS.md` | Historical readiness record | Reuse/keep statements describe the historical baseline, not a competing authority model. |
| `docs/AJM-INTEGRATED-EXECUTION-RECORD-2026-08-29.md` | Historical execution record | Historical implementation decisions must be interpreted through the final 2026-09-12 contract. |
| `docs/DOCUMENTATION_CONSOLIDATION_PLAN.md` | Historical consolidation record | Not an active architecture or implementation authority. |
| `archive/**` | Historical / archive | Never use archived wording to override current binding architecture. |

## Forbidden historical interpretations

The following interpretations are superseded wherever they occur in historical material:

1. Patient Portal is a clinic operational Domain.
2. Patient Portal owns an independent messaging database or engine.
3. Global Chat owns conversations, messages or unread state separately from Communications.
4. Notifications is a replacement for Communications message history.
5. Communications owns Work Center assignment, task, queue, priority, due-date or work-ownership authority.
6. A patient must become a `clinic_user` in order to communicate.
7. Basic patient messaging requires `patient_experience.advanced`.
8. `communication_messages.read_at` is authoritative personal clinic-user read state.

## Review rule

When a historical document is referenced during future work, the current binding contract and this reconciliation register must be applied first. Historical wording may describe what existed at the time, but it must not be used as an implementation instruction when it conflicts with the current contract.

## Closure requirement

Any new document concerning Communications, Patient Portal, Global Chat, Notifications or Work Center must explicitly preserve these authority boundaries. A new parallel architecture must not be introduced merely because a historical document used different terminology.
