# CORE SYSTEM — Patient Journey Final Implementation State

**Stage:** 15 — Documentation + Closure  
**Date:** 2026-08-24  
**Canonical branch:** `main`

## Documentation authority

PJ-01 through PJ-09 and the approved Patient Journey Implementation Plan remain the governing source for scope, classifications, architecture, and acceptance intent. The repository, live Supabase schema/data, and verified runtime behavior are the implementation authority for the final record. Where implementation evolved after the reference documents, this document records the actual implementation rather than preserving obsolete wording.

This follows the PJ governance rule: the plan is the product authority; current repository/database/runtime are the reality authority.

## Implemented Patient Journey

`Patient → Service/Procedure → Appointment → Agenda/Availability → Room/Resource → Arrival → Queue → Doctor Visit → Reception → Completion → Treatment Plan / Follow-up → Automated Follow-up → Continuation of Care`

The implementation reuses the canonical domains and does not introduce parallel patient, appointment, agenda, visit, treatment-plan, follow-up, notification, tenant, permission, or subscription systems.

## Capability classifications preserved

- **Core:** Patient Journey, Service/Procedure Catalog, Treatment Plan, Automated Follow-up.
- **Parallel / Non-blocking:** Medical Photos. Photo/storage failure must not prevent the clinical visit from continuing or closing.
- **Optional / subscription-controlled:** Patient Portal capabilities.
- **Portal independence:** the internal journey remains operational with Portal OFF. This was manually verified by the project owner during Stage 12/13.

## Stage status

| Stage | State |
|---|---|
| 0–10 | Closed/approved in project history |
| 11 | Closed/approved — Medical Photos |
| 12 | Closed — phase closure; manually validated by project owner |
| 13 | Closed — Full Integration |
| 14 | Passed — End-to-End Validation |
| 15 | Documentation + final hygiene |

## Permanent implementation corrections

### Follow-up automation

The automation path was corrected so its PostgreSQL conflict handling matches the actual partial uniqueness definition and its notification insertion uses the valid queue status. The correction is implemented in the permanent repository/database migration path and was re-exercised for idempotency.

### Follow-up integration

Follow-ups are linked to the clinical visit through `retention_followups.session_id`, preserving longitudinal context without making follow-up a prerequisite for visit completion.

### Medical Photos

Medical files are associated with patient/visit context and remain non-blocking. The failure scenario validated during E2E leaves the clinical visit operational.

## Security and isolation

The final Patient Journey preserves tenant boundaries across patients, appointments, procedures, rooms, visits, treatment plans, follow-ups, photos, notifications, users, permissions, subscriptions, and audit information. Authorization is enforced at authoritative server/database boundaries rather than by UI visibility alone.

## Demonstration data

A persistent, intentionally labelled demonstration dataset is maintained for the clinic-admin tenant used for demonstrations. Records created for this purpose are marked `PJ15_DEMO` or carry `PJ15_DEMO` metadata.

The dataset covers realistic daily states: scheduled, confirmed, arrived, completed, no-show, cancelled appointments; active clinical work; treatment planning; successful and failed medical-photo states; manual and automated follow-ups; completed and cancelled follow-ups; and queued notification behavior.

Temporary Stage 14 seed artifacts were removed. The remaining demo dataset is deliberate, labelled, and intended for later viewing/demo use.

## Final rule

This document records implementation reality. It does not redefine PJ scope. Future architectural changes must continue through the normal architecture/change-control process.
