# Global UX / IA — Stage 6 Patient Flow & Queue

## Status

Stage 6 implementation record for the Patient Flow / Queue surface.

## Governed contexts

Patient Flow is exposed through three explicit contexts:

- `operations` — operational patient-flow work.
- `clinical` — clinical/doctor patient-flow work.
- `administrative` — administrative/reception patient-flow work.

These contexts are authorization and navigation contexts; they do not create a second permission engine.

## Authorization invariant

Stage 6 uses the canonical effective-permission resolution and server-side tenant authorization. There are **zero automatic role grants** for the Stage 6 Patient Flow context permissions. Patient Flow permissions are explicit catalog permissions and are not injected through `role_permissions` by this Stage 6 migration.

## Queue ownership

The canonical Queue engine remains the source for queue ordering, priority, transition validation, and ETA calculation. Patient Flow reuses the Queue domain rather than creating a parallel queue implementation.

## Canonical transitions

- `waiting` → `in_consultation`, `no_show`, `cancelled`
- `in_consultation` → `pending_close`, `cancelled`
- `pending_close` → `completed`, `cancelled`
- `completed` → terminal
- `cancelled` → terminal
- `no_show` → terminal

`pending_close` is a Visit-only state and is intentionally not an Agenda state.

## Tenant boundary

All Patient Flow mutations are tenant-scoped and require the applicable effective permission before the state transition is persisted.

## Implementation note

Stage 6 is an integrated surface over the canonical Queue/Visit model. No parallel Patient Flow state machine, permission engine, or automatic role-grant mechanism is introduced by this record.
