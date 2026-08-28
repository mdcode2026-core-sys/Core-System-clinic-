# CORE SYSTEM — UX / IA Validation & Deployment Governance

**Date:** 2026-08-28  
**Status:** CURRENT — MANDATORY ENGINEERING/UX WORKFLOW RULE  
**Authority relationship:** Supplemental operational rule to `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`, `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28.md`, and the current Workspace architecture.

## 1. Purpose

CORE SYSTEM must not consume Vercel deployments for routine source-code validation when the same validation can be performed before deployment.

This rule exists to protect the available Vercel Hobby deployment capacity while preserving Vercel as the application's deployment/runtime platform and Supabase as the backend/data platform.

**This document does not replace, downgrade, or migrate Vercel or Supabase.**

## 2. Mandatory validation order

For current and future UX/IA stages, use this order unless a stage explicitly requires a deployed/runtime environment:

```text
Inspect
  ↓
Edit / Implement
  ↓
GitHub Actions CI
  ├─ install dependencies
  ├─ TypeScript
  ├─ targeted lint
  ├─ i18n parity/audit where relevant
  ├─ tests where available
  └─ production build
  ↓
PASS?
  ├─ NO → fix source; repeat GitHub validation
  └─ YES
       ↓
Codespaces when interactive/local runtime inspection is useful
       ↓
READY FOR DEPLOYMENT
       ↓
Vercel deployment
       ↓
Runtime / integration verification only
```

## 3. GitHub Actions is the first-line CI gate

GitHub Actions is the default location for automated repository validation.

A stage workflow should run the cheapest authoritative checks first and stop on failure. At minimum, where applicable:

- dependency installation using the repository lockfile;
- TypeScript type checking;
- targeted ESLint for the changed surface;
- i18n parity/audit;
- automated tests;
- production build.

Stage-specific workflows may be narrower than the repository-wide workflow, provided they do not omit a required gate for the changed area.

## 4. Concurrency / stale work protection

CI workflows for iterative UX work should use concurrency cancellation where appropriate so obsolete runs do not continue after a newer commit supersedes them.

The goal is to validate the newest source state, not to spend CI resources on abandoned intermediate revisions.

## 5. Codespaces

GitHub Codespaces may be used when a developer/agent needs an interactive environment to:

- inspect the actual repository;
- install dependencies;
- run the application locally;
- inspect console/runtime behavior;
- exercise a flow before deployment;
- reproduce a bug;
- perform local browser verification.

Codespaces is a development/verification environment, not a replacement for Vercel production hosting.

## 6. Vercel usage rule

A Vercel deployment is justified when one or more of the following is required:

- deployed Next.js runtime behavior must be verified;
- Vercel-specific behavior must be verified;
- production-like environment variables/configuration are required;
- deployed integration with Supabase must be tested;
- preview/runtime/browser verification cannot be faithfully completed before deployment;
- final production/release verification is required.

Do **not** deploy to Vercel merely to discover:

- TypeScript errors;
- straightforward lint errors;
- i18n catalog parity errors;
- deterministic build errors reproducible in GitHub Actions;
- obvious source-level failures that can be reproduced in Codespaces.

## 7. Vercel remains authoritative for deployed runtime

This policy is not a substitute for runtime validation.

A GitHub build passing means the source is build-valid under the CI environment. It does not prove that the deployed application behaves correctly with Vercel configuration, Supabase, authentication, real data, browser interaction, or production routing.

Therefore:

**CI PASS ≠ Runtime PASS.**

The deployment stage remains mandatory when the Definition of Done requires runtime evidence.

## 8. Supabase remains unchanged

No part of this governance changes the Supabase architecture, project, database, Auth, RLS, migrations, functions, storage, or data model.

Backend/database validation remains necessary whenever the change touches or depends on those areas.

## 9. Stage documentation requirement

Every current/future UX/IA stage must record:

- whether GitHub Actions validation was run;
- which checks passed/failed;
- whether Codespaces/local runtime inspection was used;
- whether a Vercel deployment was required;
- why a Vercel deployment was required if one was used;
- runtime evidence when deployment was required;
- unresolved baseline failures that are unrelated to the stage.

## 10. Cost-conscious engineering rule

The objective is not to avoid Vercel. The objective is to use Vercel only where Vercel adds evidence that cannot be obtained more cheaply and safely earlier in the pipeline.

Routine iteration should therefore be:

```text
GitHub branch
→ GitHub Actions
→ optional Codespaces
→ READY
→ Vercel
```

not:

```text
Every source edit
→ Vercel deployment
→ discover compile error
→ repeat
```

## 11. Scope

This rule applies to:

- Global UX / IA stages;
- AJM work where repository validation can precede deployment;
- PJ-connected UX work;
- Workspace and Widget work;
- i18n and responsive UX work;
- future feature implementation whenever the required validation can be performed in GitHub Actions/Codespaces.

It does not prevent an explicit stage from requiring earlier Vercel deployment when the deployed environment itself is part of the test.

## 12. Governance principle

The existing CORE SYSTEM implementation discipline remains:

**READ → INSPECT → MAP → RECONCILE → IMPLEMENT → VALIDATE → DOCUMENT → CLOSE**

with:

**Inspect → Reuse → Extend → Reconcile → Create**.

The validation layer is now explicitly:

**GitHub Actions first → Codespaces when useful → Vercel only when runtime evidence requires it.**

Future agents must follow this rule without relying on conversation history.
