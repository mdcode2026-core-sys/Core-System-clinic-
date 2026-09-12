# CORE SYSTEM — Header Communications Integration Report

**Date:** 2026-09-11
**PR:** #100 — `feat: header technical foundation`
**Status:** Communications authority and personal read-state correction implemented; validation remains pending.

## 1. Final architectural decision

Communications is a **tenant-wide clinic domain surface**. It is not a privileged Admin-only module and the Header must not hide it behind `communications:read`.

All authenticated clinic users with a valid active tenant membership may enter `/communications`. Action-level capabilities remain independently protected by the existing authorization model, including sending, managing and creating operational requests.

This is a domain-access rule, not a permission escalation. Tenant isolation and record-level scope remain enforced server-side.

## 2. Existing Communications capability verified

The repository already contains:

- Internal clinic conversations.
- Patient-context communications.
- Conversation participants.
- Internal notes.
- Operational communication requests.
- Domain-owned work-item creation for assigned requests.
- Tenant-scoped server-side authorization and RLS.
- Existing action permissions: `communications:send`, `communications:manage`, `communications:request`.
- Existing `communications:read` catalog entry, retained for compatibility/audit history but no longer used as the Header/domain-entry gate.
- Authoritative route: `/communications`.

The Communications engineering blueprint establishes Communications as the clinic communication and coordination layer and explicitly keeps Agenda, Clinical, Financial, Inventory, Workforce and Follow-up as owners of their own business rules. fileciteturn57file0L1-L2

## 3. Header correction

`CommunicationsHeaderControl` no longer imports or checks `communications:read`.

The Header now provides a stable tenant-wide Communications entry point. The Communications domain remains responsible for protecting every sensitive action and record.

This corrects the previous architecture where the Header could disappear for a clinic user merely because an Admin had not granted a read permission.

## 4. Personal read/unread contract correction

The original Communications schema contained `communication_messages.read_at`. That is not sufficient for clinic internal communication because a single message can be read by one participant while remaining unread for another.

A new authoritative table has therefore been added:

`communication_message_reads`

Key contract:

```text
Tenant
  ↓
Message
  ↓
Clinic User
  ↓
Personal Read Receipt
  ↓
Unread = accessible messages without that user's receipt
```

The receipt is:

- tenant-scoped;
- user-specific;
- message-specific;
- unique per `(tenant_id, message_id, clinic_user_id)`;
- protected by RLS;
- writable only for the authenticated active clinic user represented by the receipt;
- restricted to messages belonging to conversations in which that user participates.

The legacy `communication_messages.read_at` column is retained for backward compatibility but is **not authoritative** for internal Communications read state.

## 5. Read behavior implemented

A server action `markConversationRead()` now records personal read receipts for all messages in a conversation after verifying that the current clinic user is a participant.

The Communications page can derive a user's unread state from the authoritative receipt table rather than from a shared message-level timestamp.

This guarantees the required semantic behavior:

- User A reads a message → it becomes read for User A.
- User B has not read it → it remains unread for User B.
- Reading by one user does not clear another user's unread state.
- Cross-tenant data cannot be used to create a receipt.

## 6. No duplicate communication engine

No new:

- conversation engine;
- messaging engine;
- parallel Communications database;
- parallel permission model;
- Chat engine;
- notification store;
- business workflow engine

was introduced.

The new read-receipt table is a missing persistence primitive inside the existing Communications domain, not a second communication system.

## 7. Authorization boundary

The corrected boundary is now:

```text
Authenticated tenant user
        ↓
Global Header → Communications
        ↓
Communications domain
        ├── tenant / record scope
        ├── conversation participation
        ├── communications:send
        ├── communications:request
        └── communications:manage
```

Therefore:

- **Domain entry:** not Admin-granted through `communications:read`.
- **Record visibility:** remains tenant- and conversation-scoped.
- **Write/action capabilities:** remain permission-controlled.
- **Management:** remains restricted to the existing management authority.

## 8. Remaining validation before Notifications

The implementation is not being declared production-closed until objective verification is completed.

Required checks:

1. Typecheck/build/lint.
2. Migration syntax and Supabase application verification.
3. Communications route reachable by tenant users without `communications:read` being required.
4. Existing action permissions still block unauthorized writes/management.
5. Personal unread state is isolated between two users.
6. Read state disappears for the user after marking the conversation read.
7. Unread state remains for another participant who has not read it.
8. Tenant isolation for messages and receipts.
9. Arabic/English behavior.
10. Desktop/mobile Header access.
11. No regression to existing Communications workflows.

Only after these checks pass is Communications considered ready for the Notifications phase.

## 9. Next phase boundary

After Communications validation closes, proceed to **Notifications**.

Notifications must remain a separate cross-system notification/feed surface. It may consume authoritative Communications-related events where appropriate, but it must not recreate Communications messages or its personal read-receipt contract.

**Communications status:** IMPLEMENTED — VALIDATION REQUIRED BEFORE CLOSURE.
