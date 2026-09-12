# CORE SYSTEM — Header Notifications Integration Report

**Date:** 2026-09-12  
**PR:** #100 — `feat: header technical foundation`  
**Scope:** Global Header Notifications integration using the existing Notifications architecture

## Final authority contract

The Header is only a global access/presentation surface. It does not own notification persistence, unread state, permissions, or delivery.

The existing `notification_queue` remains the authoritative notification/feed source. The implementation adds only the missing per-user read-receipt persistence required for personal in-app unread state: `notification_queue_read_receipts`.

## Personal read/unread semantics

Unread state is derived per `(tenant, clinic user, notification)`:

```text
notification_queue
      ↓
clinic_user recipient
      ↓
notification_queue_read_receipts
      ↓
personal unread state
      ↓
Global Header badge/feed
```

Reading a notification creates a receipt for the authenticated clinic user only. Another user can therefore continue to see the same notification as unread.

## Header integration

`NotificationsHeaderControl` is injected into the existing `GlobalHeader` controls alongside Communications.

It provides:

- personal unread count;
- recent personal in-app notifications;
- per-notification mark-as-read;
- mark-all-as-read;
- Arabic/English labels and date formatting;
- keyboard/focus-visible interaction;
- responsive bounded popover behavior.

No `notifications:read` gate is introduced for viewing a user's own notification feed. Management of tenant channel preferences remains under the existing `notifications:manage` action boundary.

## Security / tenant isolation

The read-receipt table is tenant-scoped and user-scoped with RLS. Receipt writes are limited to the authenticated active clinic user and to matching in-app notifications addressed to that user.

The feed RPC resolves the active tenant and clinic user from the authenticated session and filters the existing notification queue by tenant, recipient and channel.

## No parallel notification system

No second notification store, Header cache, personal unread cache, delivery queue, or permission model was introduced. `notification_queue` remains the source of notification records; the new table is only the missing personal read-state primitive.

## Validation contract

Required before production closure:

1. Typecheck/build/lint.
2. Migration application verification.
3. Authenticated tenant user can see the Notifications control without a management permission gate.
4. Notification feed is tenant- and user-scoped.
5. User A reading a notification does not mark it read for User B.
6. Mark-all-read clears the authenticated user's unread count.
7. No stale unread badge remains after successful read mutation and query refresh.
8. Arabic/English and RTL/LTR behavior remain valid.
9. Desktop/mobile Header remains functional.
10. Existing Communications behavior remains intact.

**Notifications status:** IMPLEMENTED — VALIDATION REQUIRED BEFORE PRODUCTION CLOSURE.
