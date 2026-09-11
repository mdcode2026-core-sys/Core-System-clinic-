# CORE SYSTEM — Global UX / IA Validation Protocol
## Current and Future Stage Execution

**Date:** 2026-08-28  
**Status:** CURRENT — MANDATORY FOR UX/IA STAGES  
**Related authority:** `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`  
**Related plan:** `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`  
**Operational governance:** `docs/UX-IA-VALIDATION-GOVERNANCE.md`  
**Current surface interpretation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

## 0. Canonical surface validation interpretation

Every UX/IA validation run involving these surfaces must explicitly preserve the following relationships:

```text
Primary Role / Job Function
        ↓
Primary Work Context / Classification
        ↓
Role Workspace

Effective Permissions
        ↓
Authorized Domains / Capabilities
        ├── Sidebar
        ├── Widgets
        └── My Workspace

Home = independent global starting / awareness surface
Header = persistent global access layer
```

Validation must include a mixed-permission user scenario. Granting additional operational, financial, administrative or reporting permissions to a Clinical-primary user must not change the user's Primary Role, Primary Work Context or Role Workspace.

My Workspace personalization may expose permitted cross-context tools/widgets, while Sidebar remains complete authorized navigation.

Technical identifiers such as `global` must not be used as evidence that Home and My Workspace are the same product surface.

## 1. Validation ladder

Every UX/IA stage must use the following validation ladder before consuming a Vercel deployment:

### Level 1 — Static/source validation

Use GitHub Actions for deterministic checks:

- TypeScript;
- targeted lint;
- i18n parity/audit where relevant;
- automated tests where available;
- production build.

### Level 2 — Interactive repository validation

Use GitHub Codespaces when the change requires local application execution, browser inspection, debugging, or interaction that is not adequately covered by static CI.

### Level 3 — Deployed runtime validation

Use Vercel only when the stage requires verification of the deployed Next.js application, Vercel-specific behavior, production-like configuration, Supabase integration, authentication, real persistence, routing, or end-to-end browser behavior that cannot be established reliably earlier.

## 2. Failure handling

If Level 1 fails:

```text
FAIL → inspect source → fix → rerun CI
```

Do not consume Vercel deployment capacity to diagnose deterministic source/build failures.

If Level 1 passes but Level 2 is required:

```text
CI PASS → Codespaces/local verification → fix if needed → rerun CI
```

Only after the source state is ready should a Vercel deployment be considered.

## 3. Runtime gate

When Vercel is required, the stage record must identify the exact runtime behaviors that need deployment evidence.

A deployment must not be requested simply because a visual confirmation would be convenient when the same behavior can be reliably verified in Codespaces.

## 4. Stage closure evidence

A stage may close only when its applicable gates are satisfied:

- source/CI gate;
- interactive/local gate when applicable;
- deployed runtime gate when applicable;
- permission/security regression gate when applicable;
- mobile/i18n gate when applicable;
- database/backend gate when applicable;
- documentation gate.

The stage record must explicitly mark gates that are not applicable.

## 5. Deployment efficiency rule

Intermediate commits are development states. They should normally be validated by GitHub Actions/Codespaces.

A Vercel deployment should represent a meaningful candidate for runtime validation, not every intermediate edit.

When multiple commits are made during an active stage, wait for the current source state to pass CI before requesting runtime deployment whenever practical.

## 6. Relationship to Vercel and Supabase

This protocol does not replace either platform.

- **GitHub:** source control, CI, automated validation and Codespaces development environment.
- **Vercel:** deployed Next.js runtime and production/preview verification.
- **Supabase:** database, authentication and backend services.

The platforms remain complementary.

## 7. Required stage log format

Future stage documents should include:

```text
Validation
- GitHub Actions: PASS / FAIL / N/A
- Codespaces: PASS / FAIL / N/A
- Vercel runtime: PASS / FAIL / N/A
- Supabase/backend validation: PASS / FAIL / N/A
- Mobile: PASS / FAIL / N/A
- Arabic/English: PASS / FAIL / N/A

Vercel deployment justification:
- Required? YES / NO
- Reason: <specific runtime evidence required>
```

## 8. Required global-surface acceptance scenarios

Where an applicable UX/IA stage touches these surfaces, validation must include:

### Role Workspace stability

Clinical-primary user + additional Financial/Operational/Administrative/Reporting permission → primary Role Workspace remains Clinical.

### My Workspace separation

Changing My Workspace widget arrangement does not alter Role Workspace, Role, Sidebar authorization or Patient Flow ownership.

### Sidebar independence

An authorized Domain outside Primary Work Context remains visible under its normal Domain identity.

### Home independence

Home remains a global starting/awareness surface and does not become the Role Workspace or My Workspace merely because they share implementation infrastructure.

### Header persistence

Global Search and other approved global Header controls remain consistently accessible from major authenticated surfaces.

### Shared workstation

User A → Logout → User B login → subsequent actions are attributable to User B.

### Communications / Chat / Notifications

Where implemented, Communications access, compact Chat and Notifications must remain distinct interaction surfaces backed by their authoritative domains. Chat must not introduce a parallel communication store.

## 9. Non-negotiable rule

> **Never use Vercel as the first compiler, linter, build checker, or deterministic source-error detector when GitHub Actions can perform that check.**

This rule applies to all current and future UX/IA stages and should be followed by AJM/PJ-connected implementation work whenever the validation type permits it.
