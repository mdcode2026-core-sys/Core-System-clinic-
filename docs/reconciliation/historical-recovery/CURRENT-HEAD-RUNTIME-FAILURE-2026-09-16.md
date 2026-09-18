# CORE SYSTEM — Current-Head Runtime Failure Record

**Date:** 2026-09-16  
**Canonical line:** PR #129 / `repair/global-experience-presentation-rebuild-2026-09-16`  
**Observed candidate:** `39bea59ea3bf78982e2a7ef887a60bf41d61ea73`  
**Validation run:** GitHub Actions #326 / `35087695623`  
**Status:** REPAIR APPLIED — REVERIFICATION REQUIRED

## Finding

Engineering validation passed for the candidate: TypeScript, lint, build, and i18n parity all passed. Runtime authentication reached Supabase successfully and authentication cookies were established.

The authenticated Home request then returned HTTP 500 because `HomePage` is a Server Component and directly rendered `Link` elements carrying `onClick={markHomeWelcomeSeen}`. The React runtime rejected the event handler at the Server/Client Component boundary.

The failure therefore was not an authentication, authorization, RLS, tenant-isolation, or database-integrity failure.

## Evidence

The failing runtime error was:

`Error: Event handlers cannot be passed to Client Component props.`

The failing request rendered `/` with error digest `1183425027`; the mobile authenticated Home path also returned HTTP 500. The same run recorded authorization, cross-domain, database-integrity, and procurement/inventory/finance suites as PASS.

## Repair

A dedicated client-side `HomeNavigationLink` wrapper now owns the welcome-dismissal click behavior. `HomePage` no longer passes an event handler from the Server Component directly to `Link`.

This preserves the existing Home behavior and only moves the event handling to the correct client boundary.

## Closure rule

This record is evidence of a real current-head runtime defect and its targeted repair. It is not closure evidence. The exact repaired head must pass the Unified Test Execution Engine before the runtime gate is considered green.
