# CORE SYSTEM — Header Chat Integration Report

**Date:** 2026-09-12  
**PR:** #100 — `feat: header technical foundation`  
**Status:** Chat implementation corrected; validation required before closure.

## 1. Final architectural decision

Global Header Chat is a **compact interaction surface over Communications**. It is not a domain, messaging engine, permission engine, unread store, tenant boundary, or attachment store.

The authoritative relationship remains:

```text
Global Header Chat
        ↓
Communications
        ↓
communication_conversations / communication_messages
        ↓
communication_message_reads
```

## 2. Chat implementation corrected

The Header Chat control now derives its unread indicator only from:

- `communication_conversation_participants` for the current clinic user;
- `communication_messages` for those conversations;
- `communication_message_reads` for that same clinic user.

Messages sent by the current user are excluded from the unread count.

This removes the previous risk of counting unread messages from arbitrary tenant conversations in which the user was not a participant.

## 3. Personal unread authority

`communication_message_reads` remains the only authoritative clinic-user read state.

No Chat-specific read table was introduced.

The required semantics are:

- User A's receipt affects User A only.
- User B's unread state remains independent.
- Chat and Communications read the same receipt authority.
- Tenant isolation remains enforced by the existing Communications model and RLS.

## 4. Chat → Communications read behavior

The Header Chat control routes to the authoritative `/communications` surface.

When the Communications surface renders internal conversations, it invokes the existing `markConversationRead()` action for the rendered non-archived internal conversations. That action verifies the authenticated clinic user, Communications read capability, tenant scope and conversation participation before writing personal receipts.

Therefore the same message cannot remain visibly unread in Chat after the user has entered and viewed the corresponding Communications history.

## 5. No parallel Chat system

No new:

- `chat_conversations`
- `chat_messages`
- `chat_message_reads`
- Chat permission engine
- Chat tenant boundary
- Chat attachment store

was introduced.

The Header Chat control contains no independent permission check; domain/action authorization remains in Communications.

## 6. Validation contract

A dedicated `header-chat` workstream descriptor is now registered with SETUP. It consumes the existing Unified Test Execution Engine and does not modify the runner or create a parallel execution engine.

A focused static audit verifies:

1. Chat uses the Communications conversation participant model.
2. Chat uses `communication_message_reads`.
3. Chat excludes the current user's own messages from unread state.
4. Chat unread is scoped to the user's participation.
5. No parallel Chat storage exists.
6. Communications uses the shared `markConversationRead()` authority.
7. The read action remains participant-scoped.

## 7. Required closure verification

Chat remains **NOT CLOSED** until the current PR head passes:

- focused Header Chat audit;
- Unified Test Execution Engine selection and execution at the current head;
- typecheck/lint/build;
- authorization and database-integrity validation;
- personal unread isolation between two clinic users;
- Chat ↔ Communications read-state consistency;
- tenant isolation;
- Arabic/English and RTL/LTR;
- responsive Header behavior;
- accessibility and Header regression verification.

No change to the Unified Test Execution Engine is permitted merely to make these checks pass.

## 8. Boundary after Chat

Communications, Notifications and Quick Actions are not reopened as new phases by this report. They were previously completed within the broader Global Surfaces execution.

After Chat closure, the next action must be determined from the remaining workstreams of `MASTER-EXECUTION-REPAIR-CONTRACT-GLOBAL-SURFACES-2026-09-11.md`, rather than automatically reopening a completed Header surface.

**Chat status:** IMPLEMENTED — VALIDATION REQUIRED BEFORE CLOSURE.
