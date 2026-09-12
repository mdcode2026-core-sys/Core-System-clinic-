# CORE SYSTEM — Phase 1 Closure
## Patient Portal Communication Unification

**Date:** 2026-09-12  
**Phase:** 1 — Patient Portal communication unification  
**Governing contract:** `docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-BINDING-EXECUTION-CONTRACT-2026-09-12.md`  
**Execution plan:** `docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-EXECUTION-PLAN-2026-09-12.md`  
**Baseline:** `main` / `9f66d51ed1150b07eb5edad05353e11dea887bd6`

## Closure decision

**PRODUCTION CLOSED**

Phase 1 is closed because the Patient Portal messaging path now uses the existing Communications authority for both reads and writes, existing legacy history is bridged without loss, the legacy table is no longer writable by the application `authenticated` role, and production data verifies that every existing non-deleted legacy message is represented by an authoritative Communications message.

## Verified implementation

### 1. Portal consumers

The repository code search for `patient_portal_messages` shows no active application consumer. Remaining references are limited to schema/migration history and the controlled legacy bridge/deprecation path.

The active Portal UI imports `listPatientMessages` and `sendPatientMessage` from `src/domain/patient-portal/patient-message.actions.ts`.

### 2. Portal authority

`src/domain/patient-portal/patient-message.actions.ts` resolves the authenticated patient identity and active clinic relationship, resolves/creates the patient conversation in `communication_conversations`, reads from `communication_messages`, and inserts patient messages into `communication_messages`.

No Portal-specific message store is used by the active application path.

### 3. Clinic authority

`src/domain/communications/communications.actions.ts` sends clinic patient replies through `communication_messages` with `sender_type='clinic'` and the authenticated `clinic_user` identity. Patient conversations are therefore shared between the Portal surface and the clinic Communications surface.

### 4. Identity and visibility

Production RLS verifies:

- patient reads are limited to `message` records in the patient's active clinic relationship;
- patient inserts require an active `patient_identity` and matching active clinic relationship;
- patient messages cannot use `sender_clinic_user_id`;
- clinic messages require the authenticated clinic user's tenant-scoped identity;
- tenant boundaries are enforced through `get_current_tenant_id()` and tenant-scoped relationship checks;
- `internal_note` records are not exposed through the patient-safe message policies.

### 5. Historical migration

Production contains one legacy `patient_portal_messages` record and one corresponding `communication_messages` record linked by `legacy_portal_message_id`.

Production verification returned:

- legacy messages: **1**;
- bridged Communications messages: **1**;
- unbridged non-deleted legacy messages: **0**.

The authoritative conversation for the migrated message is a `kind='patient'` Communications conversation for the same `clinic_patient_id`.

### 6. Legacy path retirement

The production migration `communications_retire_legacy_portal_message_write_path` was applied after consumer/migration verification.

`authenticated` retains `SELECT` access to `patient_portal_messages` for historical/audit visibility, while `INSERT`, `UPDATE`, and `DELETE` privileges are revoked. This prevents the legacy table from becoming an independent application messaging authority again.

Repository migration:

`supabase/migrations/20260912150000_communications_retire_legacy_portal_message_write_path.sql`

### 7. Advanced entitlement boundary

The active Portal messaging action does not require `patient_experience.advanced`. Basic patient ↔ clinic communication therefore remains a Core Communications capability as required by the binding contract.

## Verification evidence

### Repository

- Active Portal messaging action uses `communication_conversations` + `communication_messages`.
- Active Communications action uses the same `communication_messages` authority.
- No active code consumer of `patient_portal_messages` remains.
- No Portal-specific clinic-user permission/read-state engine was introduced.

### Production database

- Legacy-to-authoritative mapping verified.
- Zero unbridged non-deleted legacy messages.
- Patient conversation records are tenant-scoped and linked to the same `clinic_patient_id`.
- Patient-safe RLS policies are present for both conversations and messages.
- Legacy write privileges are revoked for `authenticated`.
- The deprecation migration is recorded in Supabase migration history as `20260912122846`.

### Existing engineering/runtime baseline

Phase 0 had already been objectively closed against the exact PR #100/main tree with the Unified Test Execution Engine reporting 9/9 PASS and production runtime verification passing on the same tree. Phase 1 did not alter the test engine or introduce a parallel test system.

## Phase 1 exit condition

> A Portal patient conversation and a clinic Communications conversation are the same authoritative conversation/history.

**Verified: PASS.**

The Portal and clinic Communications surfaces resolve the same `communication_conversations` / `communication_messages` authority, and the legacy history is linked to that authority through `legacy_portal_message_id`.

## Scope boundary

This closure does **not** close Phase 2 visibility verification, Phase 3 personal unread verification, or later Chat/attachments/delete-retention/Work Center phases. Those remain governed by the approved execution plan.

**Phase 1 status: PRODUCTION CLOSED.**
