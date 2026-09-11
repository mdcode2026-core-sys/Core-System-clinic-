# CORE SYSTEM — Header Communications Integration Report

**Date:** 2026-09-11
**PR:** #100 — `feat: header technical foundation`
**Status:** Communications integration implemented; validation remains pending.

## 1. Objective

Connect the authenticated Global Header to the existing authoritative Communications domain without creating a second messaging system, notification store, permission model, or communication engine.

## 2. Existing Communications capability verified

The repository already contains a tenant-scoped Communications domain with:

- `communications:read`, `communications:send`, `communications:manage`, and `communications:request` permissions.
- Conversation creation and participant management.
- Internal messages and internal notes.
- Patient-context communications.
- Operational communication requests.
- Domain-owned work-item creation for assigned operational requests.
- Tenant-scoped server-side authorization and RLS boundaries.
- Authoritative route: `/communications`.

The Header therefore integrates with existing capability rather than recreating it.

## 3. Implemented Header integration

Added:

- `src/features/workspace/CommunicationsHeaderControl.tsx`
- Global Header Communications gateway through the existing `GlobalHeader` control slot.

Behavior:

1. The control checks the existing effective permission `communications:read`.
2. Users without that permission do not receive the Header control.
3. Authorized users receive a direct, keyboard-accessible link to `/communications`.
4. Arabic and English labels are provided.
5. The control is responsive: icon-only at narrower desktop widths and icon + label at larger widths.
6. The adapter owns no Communications data, authorization rules, unread state, or messaging behavior.
7. The Communications domain remains the sole owner of communication records and workflow.

## 4. Explicitly not implemented in this phase

No new:

- conversation engine
- messaging database
- notification database
- unread-state store
- permission model
- Chat engine
- business workflow
- Communications data mutation from the Header

The current Communications implementation does not expose a verified personal unread/read-state contract. Therefore the Header does **not** fabricate an unread badge or infer one from unrelated data.

## 5. Architectural result

```text
Global Header
    ↓
Communications Header Adapter
    ↓
existing effective permission check
    ↓
/communications
    ↓
existing Communications domain
```

This preserves the canonical boundary: Header provides global access/context; Communications owns communication state and business rules.

## 6. Remaining PR #100 execution phases

The PR remains intentionally open until the complete Header work passes validation.

### Phase A — Communications validation

- Build/typecheck/lint.
- Permission visibility verification.
- Authorized navigation verification.
- Arabic/English verification.
- Desktop/mobile verification.
- Tenant isolation and existing Communications route verification.

### Phase B — Chat integration boundary

- Reuse Communications authority/infrastructure.
- No parallel messaging engine.
- Distinguish compact Chat interaction from authoritative Communications.

### Phase C — Notifications integration

- Verify existing personal notification/feed authority.
- Header access only; no duplicate notification store.
- Verified unread/attention behavior only when supported by authoritative data.

### Phase D — Quick Actions

- Keep initial approved scope limited to Language and Logout/global account actions.
- Do not turn Quick Actions into a universal business-action launcher.

### Phase E — Header visual/UX implementation

- Apply the researched global-header design direction.
- Establish clear hierarchy, spacing, identity, search, communication, notification, and account controls.
- Preserve responsive/mobile and RTL behavior.
- Avoid duplicating Home or Workspace.

### Phase F — Accessibility and interaction validation

- Keyboard navigation.
- Focus visibility/order.
- Screen-reader names and states.
- Responsive behavior.
- RTL/Arabic and LTR/English.
- Touch target and mobile interaction checks.

### Phase G — Contract regression validation

Validate the Header against the Global Surfaces contract, including:

- Home remains distinct from Role Workspace.
- Home remains distinct from My Workspace.
- My Workspace remains independent of `global` identity.
- Existing Home/global consumers remain functional.
- Global Search remains permission-constrained.
- Communications/Chat/Notifications remain domain-owned.
- Quick Actions remain within approved global scope.

### Phase H — Final promotion

Only after all objective checks pass:

`VERIFY → REVIEW → DOCUMENT → update PR #100 → merge → production verification → CLOSE`

No phase is considered closed merely because its code exists.
