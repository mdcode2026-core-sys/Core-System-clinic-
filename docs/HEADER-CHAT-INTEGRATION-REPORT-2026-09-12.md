# CORE SYSTEM — Header Chat Integration Report

**Original report date:** 2026-09-12  
**Repair closure date:** 2026-09-13  
**Repair PR:** #109 — `fix: complete Global Header, Search and Chat UX repair`  
**Production candidate:** `60be99290e6da7af2c9a8f4dbd44255e00529ef0`  
**Status:** **CLOSED — IMPLEMENTED, UNIFIED VALIDATION PASSED, PRODUCTION RUNTIME VERIFIED**

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

## 2. Repair scope completed

The following agreed Global Surfaces repairs were implemented without introducing a parallel architecture:

- Header logo/sidebar spacing tightened.
- Desktop Global Search footprint reduced.
- Mobile Search changed to icon-only trigger with an expandable lower search row.
- Communications Header icon changed from chat bubble to envelope.
- Communications remains tenant-wide; Header entry is not Admin-only.
- Personal unread state remains authoritative through `communication_message_reads`.
- Header Chat is now a language-independent fixed floating surface.
- Minimize and Close are aligned as one control group inside the Chat header.
- Chat window is draggable.
- Chat window is resizable.
- Minimized Chat becomes a large icon rather than a text pill.
- Minimized Chat icon is movable.
- Dragging the minimized icon outside the viewport closes Chat.
- Existing Communications attachment capability is exposed through the Chat composer.
- `sendInternalMessage()` returns the created message id so attachments remain owned by the authoritative Communications message.

## 3. Personal unread authority

`communication_message_reads` remains the only authoritative clinic-user read state.

The Header Chat unread calculation continues to:

- scope conversations to the authenticated clinic user's tenant;
- scope conversations to the user's participant memberships;
- exclude messages sent by the current user;
- compare incoming message ids against that user's `communication_message_reads` rows.

No Chat-specific read table or unread store was introduced.

## 4. Chat → Communications behavior

Chat continues to use the existing Communications actions and data model. Reading a conversation invokes the shared `markConversationRead()` action, which writes personal receipts to `communication_message_reads` under the existing tenant and participation checks.

Attachments are created through `createCommunicationAttachmentUpload()` and uploaded to the existing `communications` storage bucket using a tenant/conversation/message-scoped path. No Chat attachment store was introduced.

## 5. Responsive and interaction behavior

The repaired Chat surface no longer changes its fundamental positioning between Arabic and English. The floating geometry is independent of RTL/LTR page anchoring.

The implementation supports:

- Desktop Arabic.
- Desktop English.
- Mobile Arabic.
- Mobile English.
- Dragging the Chat window.
- Resizing the Chat window.
- Minimizing to a large icon.
- Moving the minimized icon.
- Closing by dragging the minimized icon outside the viewport.
- File attachment selection and upload through Communications.

## 6. Engineering validation

PR #109 was created from the validated production SHA `104b628e72b50150cab6b5dfcad4551aed6ad113` on branch:

`repair/global-surfaces-header-chat-2026-09-13`

The existing Unified Test Execution Engine ran against the exact PR candidate:

- Run: **#197**
- Workflow run: `34773589631`
- Candidate SHA: `ea3bf7fdbfe89a1691d4754e6b1099fe555883f0`
- Execution: **PASS**
- Final execution decision: **PASS**
- No test-runner modification was made to bypass failures.

The PR was merged only after the Unified Test Execution Engine completed successfully.

## 7. Production verification

PR #109 was squash-merged to `main` as:

`60be99290e6da7af2c9a8f4dbd44255e00529ef0`

The designated Production Runtime Verification workflow then ran against that exact main SHA:

- Workflow: **CORE SYSTEM Production Runtime Verification**
- Run: **#11**
- Workflow run: `34773802192`
- Candidate SHA: `60be99290e6da7af2c9a8f4dbd44255e00529ef0`
- Production exact-candidate identity check: **PASS**
- Authenticated real-world Clinic Admin E2E: **PASS**
- Production runtime evidence publication: **PASS**
- Final job conclusion: **SUCCESS**

The production runtime workflow therefore verified that the exact promoted main SHA was exposed by Production before executing the authenticated scenario.

## 8. Closure decision

**HEADER / SEARCH / COMMUNICATIONS / CHAT REPAIR — CLOSED.**

The repair is considered production-verified at the promoted main SHA above.

No database migration was introduced by this repair. No parallel Chat engine, permission engine, unread store, tenant boundary, or attachment store was introduced.

## 9. Boundary after closure

This closure does not reopen previously completed Communications, Notifications, Quick Actions, or unrelated Global Surfaces workstreams.

Any subsequent work must be driven by the remaining workstreams of `MASTER-EXECUTION-REPAIR-CONTRACT-GLOBAL-SURFACES-2026-09-11.md` or by a newly recorded production QA finding.
