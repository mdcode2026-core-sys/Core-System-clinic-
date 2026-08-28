# CORE SYSTEM — Global UX / IA Validation Protocol
## Current and Future Stage Execution

**Date:** 2026-08-28  
**Status:** CURRENT — MANDATORY FOR UX/IA STAGES  
**Related authority:** `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`  
**Related plan:** `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`  
**Operational governance:** `docs/UX-IA-VALIDATION-GOVERNANCE.md`

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

## 8. Non-negotiable rule

> **Never use Vercel as the first compiler, linter, build checker, or deterministic source-error detector when GitHub Actions can perform that check.**

This rule applies to all current and future UX/IA stages and should be followed by AJM/PJ-connected implementation work whenever the validation type permits it.
