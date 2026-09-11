# CORE SYSTEM — UX / IA Validation & Deployment Governance

**Date:** 2026-08-28  
**Status:** CURRENT — MANDATORY ENGINEERING/UX WORKFLOW RULE  
**Authority relationship:** Supplemental operational rule to the current Global UX/IA authority and the current Workspace architecture.  
**Current surface interpretation:** `docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

> **2026-09-11 reconciliation:** Validation of UX/IA must distinguish Role Workspace, My Workspace, Home, Sidebar and Header. In particular, a Clinical-primary user who receives additional permissions must retain the same primary Role Workspace; additional access may appear in Sidebar, Widgets and My Workspace. Home remains independent and Header remains global.

## 1. Purpose

CORE SYSTEM must reach **Production Readiness before Vercel deployment** whenever the required evidence can be obtained from the repository, GitHub Actions, or an interactive local/Codespaces environment.

This rule exists to prevent Vercel Hobby deployment capacity from being consumed by routine compile, lint, test, build, structural, or deterministic source validation. Vercel remains the application's deployment/runtime platform and Supabase remains the backend/data platform.

**This document does not replace, downgrade, migrate, or reconfigure Vercel or Supabase.**

## 2. Mandatory engineering sequence

For every current and future UX/IA stage, the engineering sequence is:

```text
READ
  ↓
INSPECT
  ↓
MAP / RECONCILE
  ↓
IMPLEMENT / FIX
  ↓
GITHUB PRE-DEPLOYMENT VALIDATION
  ├─ dependencies / lockfile
  ├─ TypeScript
  ├─ lint
  ├─ i18n audit/parity where applicable
  ├─ automated tests where available
  ├─ stage-specific structural/integration checks
  └─ production build
  ↓
CODESPACES / LOCAL RUNTIME VALIDATION when interactive evidence is needed
  ↓
ALL PRE-DEPLOYMENT GATES PASS
  ↓
PRODUCTION READY FOR DEPLOYMENT
  ↓
VERCEL DEPLOYMENT
  ↓
DEPLOYED RUNTIME / INTEGRATION VERIFICATION
  ↓
FINAL RELEASE READINESS
  ↓
DOCUMENT + CLOSE
```

The important rule is **not** merely “use GitHub Actions”. The stage must be taken through the complete pre-deployment validation gate before Vercel is consumed.

## 3. GitHub Actions is the first-line automated gate

GitHub Actions is the default automated validation environment. A passing workflow is evidence for the checks it actually ran; a workflow definition by itself is never evidence of success.

The shared UX 0–5 gate should perform, where applicable:

- `npm ci` using the repository lockfile;
- TypeScript type checking;
- i18n audit;
- i18n catalog parity;
- ESLint;
- automated tests when the repository provides them;
- stage-specific structural/integration validation;
- production build.

A stage is **CI validated only when an actual GitHub Actions run has passed**.

## 4. Codespaces / interactive validation

Codespaces or an equivalent local repository environment is used when source-level CI is insufficient to establish correctness. It may be used to:

- run the application locally;
- exercise routes and interactions;
- inspect browser console/runtime errors;
- verify responsive behavior;
- verify Arabic/English and RTL/LTR behavior;
- reproduce integration failures;
- inspect actual data-dependent behavior when safe local configuration permits it.

Interactive validation is part of engineering completion when the Definition of Done contains behavioral or visual claims that static CI cannot prove.

## 5. Vercel usage rule

Vercel is deliberately reserved for evidence that requires the deployed environment.

A Vercel deployment is justified only when one or more of the following remains after pre-deployment validation:

- deployed Next.js runtime behavior must be verified;
- Vercel-specific runtime/build/configuration behavior must be verified;
- production-like environment variables/configuration are required;
- deployed Supabase/Auth integration must be tested;
- deployed routing, middleware, Server Components, cookies, headers, caching, or similar behavior cannot be faithfully established before deployment;
- final release verification is required.

Do **not** deploy to Vercel merely to discover TypeScript, lint, i18n parity, deterministic build, or other source-level failures that can be found before deployment.

## 6. Production Readiness gate

Before Vercel is used for a Global UX/IA release candidate, the following must be true:

1. Governing UX/AJM/PJ documentation has been inspected and reconciled.
2. The intended stage scope has been implemented or corrected.
3. The changed source passes GitHub CI gates.
4. Required stage-specific checks pass.
5. Required interactive/local checks pass when applicable.
6. No known blocking source/build defect remains.
7. Any unresolved baseline failure is explicitly classified as unrelated or blocking.
8. The candidate is explicitly recorded as **READY FOR DEPLOYMENT**.

Only then may Vercel be consumed for deployed-runtime evidence.

## 7. CI PASS is not Runtime PASS

GitHub CI proves only the checks executed in CI. It does not prove Vercel runtime behavior, production configuration, real deployed Supabase integration, authentication, browser behavior, or production routing.

Therefore:

**CI PASS ≠ Runtime PASS.**

## 8. Supabase remains unchanged

This governance does not modify the Supabase project, database, Auth, RLS, migrations, functions, storage, data model, or backend ownership.

## 9. Global-surface validation invariants

Where a stage touches any of these surfaces, validation must explicitly preserve:

```text
Primary Role
    ↓
Primary Work Context
    ↓
Role Workspace

Effective Permissions
    ↓
Sidebar / Widgets / My Workspace

Home = independent global starting/awareness
Header = persistent global access
```

Required mixed-permission test:

> Clinical primary user + additional Financial/Operational/Administrative/Reporting permission → Clinical Role Workspace remains unchanged; authorized non-primary Domains may appear normally in Sidebar and permitted tools/widgets may appear in My Workspace.

Required surface-separation tests:

- Home ≠ Role Workspace.
- Home ≠ My Workspace.
- My Workspace ≠ Role Workspace.
- Sidebar ≠ Role Workspace.
- Header ≠ Home/Workspace.
- Widget ≠ authorization.
- Workspace ≠ authorization.

Required global Header tests, where implemented:

- Global Search is available consistently.
- Communications and Chat remain distinct intents over the same Communications authority.
- Notifications remains distinct from Communications and Follow-up.
- Quick Actions remain global interface/account actions; initial scope is Language + Logout.
- Logout remains quickly accessible for shared workstations.

## 10. Stage closure evidence

A stage may close only when its applicable gates are satisfied:

- source/CI gate;
- interactive/local gate when applicable;
- deployed runtime gate when applicable;
- permission/security regression gate when applicable;
- mobile/i18n gate when applicable;
- database/backend gate when applicable;
- documentation gate.

The stage record must explicitly mark gates that are not applicable.

## 11. Deployment efficiency rule

Intermediate commits are development states. They should normally be validated by GitHub Actions/Codespaces.

A Vercel deployment should represent a meaningful candidate for runtime validation, not every intermediate edit.

## 12. Relationship to Vercel and Supabase

- **GitHub:** source control, CI, automated validation and Codespaces development environment.
- **Vercel:** deployed Next.js runtime and production/preview verification.
- **Supabase:** database, authentication and backend services.

The platforms remain complementary.

## 13. Required stage log format

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

## 14. Non-negotiable rule

> **Never use Vercel as the first compiler, linter, build checker, or deterministic source-error detector when GitHub Actions can perform that check.**

This rule applies to all current and future UX/IA stages and should be followed by AJM/PJ-connected implementation work whenever the validation type permits it.

**End of UX / IA Validation & Deployment Governance.**
