# CORE SYSTEM — UX / IA Validation & Deployment Governance

**Date:** 2026-08-28  
**Status:** CURRENT — MANDATORY ENGINEERING/UX WORKFLOW RULE  
**Authority relationship:** Supplemental operational rule to `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`, `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28.md`, and the current Workspace architecture.

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

The shared UX 0–4 gate should perform, where applicable:

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

Before Vercel is used for a Stage 0–4 release candidate, the following must be true:

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

The purpose of this governance is to move all provable failures before deployment and reserve Vercel for the smaller set of checks that genuinely require deployment.

## 8. Supabase remains unchanged

This governance does not modify the Supabase project, database, Auth, RLS, migrations, functions, storage, data model, or backend ownership.

If a stage depends on Supabase behavior, backend/database validation remains mandatory. Vercel is used only if deployed integration is the evidence that cannot otherwise be obtained.

## 9. Stage 0–4 application

The rule applies retroactively as the **validation method** for UX Stages 0–4. It does **not** retroactively mark those stages complete.

The current status of each stage must be established from actual repository evidence and actual validation runs. No stage may be marked Production Ready merely because a workflow exists or because source files appear implemented.

| Stage | Required pre-deployment validation | Deployment purpose |
|---|---|---|
| UX 0 — Baseline Lock | repository/document reconciliation + CI + baseline structural checks | only runtime evidence not reproducible before deployment |
| UX 1 — Navigation & IA | CI + navigation/route/permission structural checks + interactive checks where needed | deployed navigation/runtime verification only when necessary |
| UX 2 — User Surface Model | CI + authorization/surface structural checks + AJM/PJ integration checks + interactive checks where needed | deployed auth/runtime verification when required |
| UX 3 — Workspace Foundation | CI + Workspace/Sidebar/Widget architecture checks + responsive/i18n checks + interactive checks where needed | deployed Workspace runtime verification |
| UX 4 — Workspace Personalization | CI + Widget add/remove/order/persistence structural checks + interactive behavior checks | deployed interaction/persistence verification when required |

## 10. Evidence required for closure

Every stage closure record must state:

- commit SHA validated;
- GitHub Actions run ID/result and checks passed;
- stage-specific checks performed;
- Codespaces/local runtime evidence, when used;
- Vercel deployment ID/URL, when used;
- reason Vercel was required;
- deployed runtime checks passed/failed;
- unresolved issues and whether they block closure.

If evidence is missing, the stage remains **not closed**.

## 11. Cost-conscious engineering rule

The objective is not to avoid Vercel. The objective is to avoid wasting Vercel deployments on failures that should have been caught earlier.

Correct pattern:

```text
GitHub source
→ pre-deployment CI
→ fix failures
→ repeat until PASS
→ optional Codespaces/runtime inspection
→ READY FOR DEPLOYMENT
→ Vercel
→ final runtime verification
```

Incorrect pattern:

```text
source edit
→ Vercel deployment
→ compile/build failure
→ source edit
→ another Vercel deployment
```

## 12. Scope and future stages

This governance applies to Global UX/IA, AJM-connected UX, PJ-connected UX, Workspace, Widgets, i18n, responsive work, and future feature implementation whenever equivalent validation can be performed before deployment.

It does not prevent a stage from using Vercel earlier when the deployed environment itself is an explicit part of the test. That exception must be recorded with its reason.

## 13. Engineering authority

The project execution discipline remains:

**READ → INSPECT → MAP → RECONCILE → IMPLEMENT → VALIDATE → DOCUMENT → CLOSE**

with:

**Inspect → Reuse → Extend → Reconcile → Create**.

For validation, the operational rule is:

**GitHub Actions first → Codespaces/local runtime when useful → Vercel only for evidence that genuinely requires deployment.**

Future agents must follow this rule without relying on conversation history.
