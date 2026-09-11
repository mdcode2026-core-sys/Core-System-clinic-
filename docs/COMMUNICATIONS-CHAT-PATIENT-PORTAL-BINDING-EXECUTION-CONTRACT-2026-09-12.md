# CORE SYSTEM — Communications + Global Chat + Patient Portal
## Binding Architecture / Execution Contract

**Date:** 2026-09-12  
**Status:** BINDING  
**Scope:** Communications, Patient Portal communication integration, Global Header Chat, personal read/unread, group communication, attachments, permissions, tenant isolation, documentation reconciliation and verification.

---

## 1. Authority

`Communications` is the single authoritative clinic communication domain.

It owns:

- conversations
- participants
- messages
- patient communication
- internal notes
- communication history
- personal clinic-user read state
- communication attachments

No parallel Chat messaging authority or Portal messaging authority may be introduced.

**Required model:**

```text
Patient Portal ↔ Communications ↔ Clinic Communications / Global Chat
```

---

## 2. Patient Portal boundary

Patient Portal is a patient-facing **Module / Surface / Channel**.

It is not a clinic operational Domain and it is not a messaging authority.

Patient identity remains distinct from `clinic_users` and is resolved through the existing patient identity + clinic relationship model.

Portal consumes patient-safe capabilities from platform domains; it does not become the owner of Communications, Agenda, Clinical, Financial, Workforce or Patient Journey data.

---

## 3. Patient communication

Basic patient ↔ clinic communication is a **Core Communications capability**.

The operational source of truth must be `communication_conversations` + `communication_messages`.

The existing `patient_portal_messages` path is a legacy/current implementation primitive and must not remain the final independent messaging authority.

Migration must preserve existing Portal message history where data exists; no destructive history loss is permitted.

---

## 4. Patient-visible vs internal communication

A patient conversation may contain:

- patient-visible `message` records
- clinic-only `internal_note` records

Portal reads only patient-visible messages.

Clinic users may read patient-visible messages and, subject to authorization, internal notes.

**Invariant:** an `internal_note` must never be exposed through Patient Portal.

---

## 5. Clinic → Patient and Patient → Clinic

Both directions belong to the same Communications conversation.

```text
Patient Portal → Communications conversation → Clinic
Clinic → Communications conversation → Patient Portal
```

Clinic staff must not need to know whether a patient message originated in Portal; it appears as a normal patient conversation in Communications.

A clinic response made through Communications or Global Chat uses the same conversation/message authority and becomes visible to the patient when it is a patient-visible message.

---

## 6. Global Chat

Global Header Chat is a compact interaction surface over Communications.

It is not a Domain and must not introduce:

- `chat_conversations`
- `chat_messages`
- `chat_message_reads`
- a second permission engine
- a second tenant boundary
- a second attachment store

Chat uses the same conversations, messages, participants, permissions, history and read state as Communications.

Reading a message in Chat makes it read in Communications; reading it in Communications removes the same unread state from Chat.

---

## 7. Internal Chat

Internal one-to-one and group conversations use `communication_conversations` and `communication_conversation_participants`.

Group membership management must extend the existing participant model rather than creating a new group engine.

Only clinic users belonging to the same tenant may participate in internal Chat.

The final contract for group administration must define authorized creation, membership changes and deletion/archival behavior before implementation of those actions.

---

## 8. Read/unread authority

For clinic users, the authoritative personal read state is:

`communication_message_reads`

The legacy `communication_messages.read_at` field is not authoritative.

No Chat-specific or Portal-specific clinic-user unread table may be created.

Unread derivation must be based on accessible communication messages for the authenticated clinic user for which that user's authoritative receipt does not exist.

The implementation must verify:

- User A reading a message does not clear User B's unread state.
- Reading through Communications clears Chat unread state.
- Reading through Chat clears Communications unread state.
- tenant isolation is preserved.
- stale unread indicators disappear after the authoritative receipt is written and the relevant surface is refreshed/revalidated.

Patient read state must not turn the patient into a clinic user. If patient-specific read state is required by the final Portal UX, it must remain part of the Communications read-state model rather than creating a separate Portal messaging engine.

---

## 9. Attachments

Attachments belong to Communications messages.

They must not be stored in a Chat-specific or Portal-specific message store.

Attachment authorization follows the owning message/conversation and tenant boundary, including patient-visible vs internal visibility.

Files/images and other supported message types are implemented only after the authoritative message attachment contract is defined.

---

## 10. Permissions

Communications is tenant-wide and is not Admin-only.

`communications:read` must not be used as the Header/domain-entry gate.

Action permissions remain authoritative for actions such as sending, managing, requests, group administration and deletion/archival where applicable.

Patient Portal authorization uses patient identity + active clinic relationship + patient-safe visibility rules. A patient is never granted a clinic-user permission merely to communicate.

---

## 11. Tenant isolation

Every communication artifact must remain tenant-scoped.

Cross-tenant access is prohibited for:

- conversations
- participants
- messages
- read receipts
- attachments
- patient Portal communication

Existing composite tenant foreign keys and RLS protections must be preserved or strengthened.

---

## 12. Notifications boundary

Notifications remains separate.

`notification_queue` is the notification/feed authority and `notification_queue_read_receipts` is its personal notification read state.

A notification may point to or alert about a Communication, but a notification is not a Communication message and must not become Chat storage.

---

## 13. Entitlements

Basic patient ↔ clinic communication through Patient Portal is Core Communications capability.

The existing association of basic Portal messaging with `patient_experience.advanced` is superseded by this contract.

`patient_experience.advanced` may govern future richer patient-experience capabilities such as advanced forms, consent, uploads, richer channels or advanced routing; it must not be required merely for basic patient messaging.

---

## 14. Legacy `patient_portal_messages`

`patient_portal_messages` is recognized as an existing implementation primitive, not the final authority.

It must not be silently deleted or bypassed without a controlled migration strategy.

The implementation phase must:

1. inventory all consumers;
2. define and execute data migration/backfill where applicable;
3. switch Portal reads/writes to Communications authority;
4. verify clinic ↔ patient history continuity;
5. remove or explicitly deprecate the legacy path after consumers are migrated;
6. reconcile documentation describing it as an active independent messaging authority.

---

## 15. Delete / history

Deletion behavior must be explicitly authorized and audited.

No Chat-specific deletion policy may be invented independently of Communications.

Until the final deletion policy is implemented and verified, retained history remains the default behavior.

---

## 16. Testing integration

The Unified Test Execution Engine is unchanged.

No workstream-specific requirement may modify `tools/test-execution-runner.mjs` or create a parallel applicability engine.

The required path is:

```text
Workstream Contract
        ↓
Job SETUP
        ↓
test-execution-plan.json
        ↓
Existing Unified Test Execution Engine / Runner
```

Communications/Chat/Portal verification must be represented through the appropriate workstream contract and resolved by SETUP.

---

## 17. Required verification before closure

The work is **NOT CLOSED** until objective verification covers:

- Communications access for ordinary tenant users
- patient conversation creation/visibility
- Patient → Clinic message flow
- Clinic → Patient response flow
- internal-note non-disclosure to Portal
- unified conversation history
- personal clinic-user unread behavior
- Communications ↔ Chat read-state consistency
- same-tenant isolation
- group membership isolation
- attachment visibility/security where implemented
- deletion/retention behavior where implemented
- Portal entitlement behavior
- responsive behavior
- Arabic/English
- RTL/LTR
- accessibility
- Header regression
- current-head build/typecheck/lint/test/runtime verification

Vercel success alone is never sufficient for production closure.

---

## 18. Documentation reconciliation

This contract supersedes conflicting historical wording that describes Patient Portal as an operational Domain or an independent messaging authority.

Historical documents must be corrected, neutralized or explicitly marked superseded. In particular, documentation referring to:

- “Patient Portal remains the patient-facing domain”
- independent Portal messaging authority
- Chat as a separate messaging system

must be reconciled against this contract and the current Communications Blueprint.

---

## 19. Explicit prohibitions

Do not create:

- a second Communications engine
- a Chat database
- a Chat unread store
- a Portal messaging engine
- a Notification-based Chat store
- a patient-as-clinic-user workaround
- a second permission engine
- a second tenant-isolation model
- a modification to the Unified Test Execution Engine merely to support this work
- Work Center expansion outside a directly required narrow integration boundary

---

## 20. Execution order

```text
VERIFY
  ↓
Migrate/unify Patient Portal communication authority
  ↓
Verify patient-visible/internal separation
  ↓
Complete authoritative unread derivation
  ↓
Verify Communications end-to-end
  ↓
Implement Global Chat over Communications
  ↓
Implement group management / attachments / deletion according to approved boundaries
  ↓
Reconcile historical documentation
  ↓
BUILD + VERIFY + REVIEW
  ↓
Production verification
  ↓
CLOSE
```

**Binding conclusion:** Communications remains the single communication authority; Patient Portal and Global Chat are surfaces/channels over that authority. No parallel messaging or read-state system is permitted.