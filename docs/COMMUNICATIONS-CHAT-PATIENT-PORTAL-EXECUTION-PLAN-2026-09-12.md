# CORE SYSTEM — Communications + Global Chat + Patient Portal
## Final Implementation Plan

**Date:** 2026-09-12  
**Status:** APPROVED EXECUTION PLAN  
**Governing Contract:** `docs/COMMUNICATIONS-CHAT-PATIENT-PORTAL-BINDING-EXECUTION-CONTRACT-2026-09-12.md`  
**Workstream:** PR #100 — `feat: header technical foundation`

---

## 1. Purpose

Implement the approved final architecture without creating parallel communication, Chat, Portal messaging, unread, notification, permission, tenant-isolation or operational-work systems.

The target architecture is:

```text
Patient Portal
      ↕
Communications
      ↕
Global Chat
      ↕
Header surface

Communications ── narrow integration ──> Work Center / Journey Coordination

Notifications = separate notification authority
```

The execution must reuse existing authoritative records and behavior first, extend only where a genuine gap exists, and remove/deprecate legacy paths only after controlled migration and verification.

---

## 2. Governing rules

1. The final binding contract is the authority for this workstream.
2. Communications remains the sole communication authority.
3. Patient Portal is a patient-facing surface/channel, not a messaging domain.
4. Global Chat is a compact surface over Communications, not a domain.
5. `communication_message_reads` is the authoritative personal clinic-user read state.
6. `notification_queue` and `notification_queue_read_receipts` remain separate notification authority.
7. Journey Coordination / Work Center remains authoritative for operational work, assignment, ownership, priority, due state, handoffs and escalation.
8. Work Center integration is narrow and event/action based; no ownership is moved.
9. No new parallel engines or stores may be introduced.
10. Unified Test Execution Engine remains unchanged.
11. Every implementation step must preserve tenant isolation and effective authorization.
12. No closure claim may be made from build/deployment success alone.

---

## 3. Phase 0 — SETUP / exact baseline

**Goal:** establish the exact implementation baseline before modifying behavior.

Tasks:

- Verify PR #100 head after the contract commit.
- Verify branch/base and working scope.
- Read the final binding contract and this execution plan.
- Inventory current Communications routes, actions, components and database objects.
- Inventory Patient Portal messaging consumers and `patient_portal_messages` usage.
- Inventory `communication_conversations`, participants, messages and read-state implementation.
- Inventory Header Chat integration boundary already present in PR #100.
- Inventory Notifications integration and confirm it remains separate.
- Inventory current Work Center/Journey Coordination integration points.
- Produce `test-execution-plan.json` through the existing Unified Test Execution Engine workflow.

**Exit condition:** exact current-head implementation map exists and no implementation begins from assumptions.

---

## 4. Phase 1 — Patient Portal communication unification

**Goal:** make Communications the single source of truth for patient ↔ clinic communication.

Tasks:

1. Trace every consumer of `patient_portal_messages`.
2. Define the mapping from existing Portal messages to `communication_conversations` and `communication_messages`.
3. Preserve sender identity correctly: patient identity remains distinct from clinic-user identity.
4. Preserve patient-visible/internal visibility semantics.
5. Backfill/migrate existing history without destructive loss.
6. Switch Portal reads/writes to Communications authority.
7. Ensure basic patient messaging is not incorrectly blocked by `patient_experience.advanced`.
8. Deprecate the legacy independent path only after all consumers are migrated and verified.
9. Reconcile documentation that still describes Portal messaging as an independent authority.

**Exit condition:** a Portal patient conversation and a clinic Communications conversation are the same authoritative conversation/history.

---

## 5. Phase 2 — Visibility and patient safety

**Goal:** guarantee correct patient-visible vs clinic-only communication.

Verification targets:

- Patient sees only patient-visible messages.
- Patient never sees `internal_note`.
- Clinic users can see patient-visible communication according to tenant/access rules.
- Authorized clinic users can access internal notes where permitted.
- Patient identity never becomes a `clinic_user`.
- Cross-tenant patient communication is impossible.

**Exit condition:** visibility rules are proven at server/data-access level, not only by UI hiding.

---

## 6. Phase 3 — Authoritative personal unread

**Goal:** make read/unread deterministic and personal.

Tasks:

1. Ensure `communication_message_reads` exists and is correctly tenant/user scoped in the target runtime.
2. Reuse/repair the existing `markConversationRead()` behavior where appropriate.
3. Implement authoritative unread derivation from accessible messages minus the authenticated user's receipts.
4. Remove reliance on `communication_messages.read_at` for clinic-user unread decisions.
5. Ensure Header, Communications and Chat consume the same unread authority.
6. Verify A/B isolation.
7. Verify indicator disappearance immediately after authoritative receipt and revalidation.
8. Verify no Chat-specific or Portal-specific clinic-user unread store is introduced.

**Exit condition:** one user reading a message cannot clear another user's unread state, and the same receipt controls Communications and Chat.

---

## 7. Phase 4 — Communications end-to-end

**Goal:** stabilize the authoritative Communications surface before expanding Chat.

Verify:

- ordinary tenant user can enter Communications;
- domain entry is not gated by `communications:read`;
- action-level permissions remain enforced;
- internal conversations work;
- patient conversations work;
- internal notes remain protected;
- participants remain tenant-scoped;
- history is unified;
- read state is personal and authoritative;
- tenant isolation is preserved.

**Exit condition:** Communications is independently correct before Global Chat becomes a user-facing extension of it.

---

## 8. Phase 5 — Global Header Chat

**Goal:** implement Chat strictly as a compact interaction surface over Communications.

Tasks:

- Reuse Communications conversations/messages/participants.
- Reuse Communications authorization and tenant boundary.
- Reuse `communication_message_reads`.
- Reuse message history.
- Do not create Chat-specific database tables.
- Implement compact Header interaction only within the approved Header boundary.
- Ensure Chat → Communications navigation/context is consistent.
- Ensure Chat read actions write the same authoritative receipt.
- Ensure Communications reads clear the same Chat unread state.

**Exit condition:** Chat is demonstrably a second surface over the same authority, not a second system.

---

## 9. Phase 6 — Internal groups

**Goal:** support internal 1:1/group communication through the existing participant model.

Tasks:

- Define authorized conversation creation.
- Define authorized membership add/remove.
- Verify same-tenant membership only.
- Preserve participant history/audit requirements.
- Define deletion/archive behavior under Communications authority.
- Verify group isolation.

No group-specific messaging engine may be introduced.

**Exit condition:** group behavior is implemented through `communication_conversation_participants` and existing Communications authority.

---

## 10. Phase 7 — Attachments

**Goal:** implement attachments only through Communications message ownership.

Tasks:

- Inspect existing storage infrastructure first.
- Define message attachment ownership and metadata.
- Define patient-visible vs internal attachment visibility.
- Define authorization and tenant isolation.
- Implement only the minimum required storage path.
- Verify unauthorized access cannot retrieve an attachment.

**Exit condition:** attachments are owned by Communications messages and cannot become a Portal/Chat-specific store.

---

## 11. Phase 8 — Delete / retention

**Goal:** establish explicit, auditable behavior without inventing a Chat-specific policy.

Tasks:

- Verify current deletion capabilities and historical retention.
- Define authorization for deletion/archive.
- Preserve audit history where required.
- Implement only the approved Communications-level behavior.
- Verify patient-visible history is not accidentally destroyed.

**Exit condition:** deletion/retention is explicit, authorized, auditable and shared across all surfaces.

---

## 12. Phase 9 — Narrow Work Center integration

**Goal:** integrate communication-triggered operational work without merging domains.

Allowed pattern:

```text
Communication
    ↓ explicit operational action required
Journey Coordination / Work Center
    ↓
Task / Request / Handoff / Next Action / Escalation
```

Tasks:

- Identify only real communication events that already require operational work.
- Reuse existing `operational_work_items` and Work Center actions.
- Reuse existing Work Center permissions and ownership rules.
- Do not create assignment, task, priority, due-date or queue state in Communications.
- Do not make Communications responsible for operational work completion.
- Verify completion can optionally generate a Communications notification/message without transferring ownership.

**Exit condition:** cross-domain integration exists only where operational action is genuinely required, with each domain retaining its authority.

---

## 13. Phase 10 — Documentation reconciliation

Review and classify historical documents as:

- current;
- clarified;
- superseded;
- historical record.

Priority reconciliation targets:

- Communications engineering blueprint;
- Journey Coordination engineering blueprint;
- Patient Portal documentation;
- Header/global surfaces documentation;
- AJM historical execution records;
- any document describing Portal or Chat as an independent messaging authority;
- any document implying Communications owns Work Center operational assignment.

**Exit condition:** future implementation work can rely on one coherent architecture without requiring repeated verbal correction.

---

## 14. Phase 11 — Unified verification

Execute the workstream through the existing Unified Test Execution Engine.

Required verification matrix:

### Architecture
- single Communications authority;
- no parallel Chat store;
- no Portal messaging authority;
- no duplicate unread authority;
- Notifications remains separate;
- Work Center boundary preserved.

### Functional
- Patient → Clinic;
- Clinic → Patient;
- internal 1:1;
- internal group;
- internal note;
- unified history;
- personal unread;
- Chat ↔ Communications read consistency;
- attachments where implemented;
- deletion/retention where implemented;
- narrow Work Center integration where implemented.

### Security
- tenant isolation;
- patient identity separation;
- permission enforcement;
- attachment authorization;
- group membership isolation;
- patient-visible/internal separation.

### UX/platform
- Header regression;
- responsive;
- Arabic/English;
- RTL/LTR;
- accessibility;
- Portal behavior;
- Communications behavior;
- Chat behavior.

### Engineering
- current-head build;
- typecheck;
- lint;
- tests;
- runtime verification;
- no unintended schema drift;
- no undocumented DB writes;
- no unauthorized parallel architecture.

---

## 15. Phase 12 — Review and production closure

Required order:

```text
VERIFY
 → PLAN CONFIRMED
 → IMPLEMENT
 → BUILD / TEST
 → VERIFY
 → REVIEW
 → DOCUMENT
 → PRODUCTION VERIFY
 → CLOSE
```

Closure status must be one of:

- **PRODUCTION CLOSED** — only after all required objective checks pass.
- **NOT CLOSED — BLOCKER** — if any required verification remains unresolved.

Vercel deployment success alone is never a closure criterion.

---

## 16. Explicit non-goals

This workstream does not:

- redesign Work Center;
- replace Journey Coordination;
- create a ticketing/ITSM system;
- create a second Chat system;
- create a second Portal messaging system;
- replace Notifications;
- modify the Unified Test Execution Engine;
- expand Header Quick Actions beyond approved scope;
- create a new permission model;
- create a new tenant-isolation model.

---

## 17. Immediate next action

Begin with **Phase 0 — SETUP / exact baseline** only.

No implementation, migration or schema change is authorized until the exact PR #100 head and current runtime/repository state have been re-verified and the Unified Test Execution Engine plan has been generated from that baseline.

**End of approved implementation plan.**
