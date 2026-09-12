# CORE SYSTEM — Communications + Global Chat + Patient Portal
## Wave B Closure Record

**Date:** 2026-09-12
**Scope:** Phase 5 Global Header Chat + Phase 6 Internal Groups + Phase 7 Communications Attachments
**Baseline:** `002fa628f89ff6fb771f5167ebe122c6617f2de7`
**Status:** VALIDATION REQUIRED — NOT CLOSED

## 1. Governing authority

This Wave B record is governed by:

- `docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-BINDING-EXECUTION-CONTRACT-2026-09-12.md`
- `docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-EXECUTION-PLAN-2026-09-12.md`

Communications remains the sole communication authority. Global Chat is a compact surface over Communications. Internal groups use the existing participant model. Attachments belong to Communications messages.

## 2. Verified implementation baseline

The current mainline implementation already contains the required authority paths:

- Header Chat uses Communications conversations/messages/participants and `communication_message_reads`.
- Chat has no independent messaging/read/permission/tenant store.
- Internal participant add/remove actions use `communication_conversation_participants` and Communications management authorization.
- Participant targets are resolved within the current tenant and active clinic-user boundary.
- Attachment upload/delete uses `communication_message_attachments` and the Communications storage bucket/path.
- Attachment metadata distinguishes clinic-user and patient upload identity.
- Existing attachment database migrations provide the database-level visibility boundary.

Wave B therefore extends and verifies the existing implementation rather than creating parallel systems.

## 3. New verification contract

`docs/testing/workstream-contracts/communications-wave-b.execution.json` registers Wave B with the existing Unified Test Execution Engine.

`tools/communications-wave-b-audit.mjs` verifies the architecture and safety invariants statically. `npm run test:header-chat` remains required for the existing Chat-specific audit.

The Unified Test Execution Engine itself is unchanged.

## 4. Required objective closure evidence

Wave B may be closed only when the current candidate passes:

### Global Chat
- Chat uses the Communications authority.
- Chat uses the same personal unread authority.
- Chat ↔ Communications read consistency is preserved.
- User A and User B unread states remain independent.
- Tenant isolation is preserved.
- No parallel Chat store exists.

### Internal groups
- Authorized conversation creation remains within Communications.
- Membership add/remove uses `communication_conversation_participants`.
- Only active same-tenant clinic users can be added.
- Unauthorized membership changes are rejected.
- Participant removal does not violate conversation creator/history invariants.
- Cross-tenant membership is impossible.

### Attachments
- Attachments are owned by Communications messages.
- Upload authorization follows the owning conversation/message boundary.
- Patient uploads cannot target internal-note messages.
- Size and MIME constraints are enforced.
- Storage paths remain tenant/conversation/message scoped.
- Database and storage access cannot expose unauthorized attachments.
- No Portal-specific or Chat-specific attachment store exists.

### Platform regression
- Unified Test Execution Engine SETUP selects this workstream contract.
- Wave B static audit passes.
- Header Chat audit passes.
- typecheck passes.
- lint passes.
- build passes.
- authorization passes.
- database-integrity passes.
- relevant runtime/E2E suites pass.
- Arabic/English and RTL/LTR remain intact.
- responsive Header behavior and accessibility remain intact.

## 5. Verification policy

No Vercel verification is used for this Wave B execution.

GitHub Actions / Unified Test Execution Engine and Supabase database verification are authoritative for this workstream.

No test may be weakened, bypassed, or changed merely to make a failing implementation pass.

## 6. Closure decision

Current status is intentionally **NOT CLOSED** until all objective evidence above is available on the exact candidate head.

Final allowed closure values:

- **PRODUCTION CLOSED**
- **NOT CLOSED — BLOCKER**
