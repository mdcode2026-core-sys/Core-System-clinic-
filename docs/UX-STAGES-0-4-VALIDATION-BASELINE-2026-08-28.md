# CORE SYSTEM — UX Stages 0–4 Validation Baseline
## Pre-deployment Production Readiness protocol — 2026-08-28

**Status:** ACTIVE — VALIDATION METHOD ONLY; DOES NOT MARK STAGES CLOSED

## Purpose

This document applies the GitHub-first validation method to UX Stages 0–4 so that the stages can be brought to genuine Production Readiness without consuming Vercel deployments for failures that are deterministically detectable before deployment.

This is a validation protocol, not evidence that Stages 0–4 have passed.

## Required delivery sequence

For the Stage 0–4 delivery package:

```text
Inspect governing UX/AJM/PJ documents
→ inspect repository and existing implementation
→ reconcile current state
→ implement/fix
→ GitHub pre-deployment validation
→ Codespaces/local interactive validation where required
→ repeat until all applicable pre-deployment gates pass
→ READY FOR DEPLOYMENT
→ Vercel deployment only when deployed-runtime evidence is required
→ final runtime/integration verification
→ document evidence
→ close
```

## Shared pre-deployment gate

`.github/workflows/ux-stages-0-4-ci.yml` is the shared automated gate. Its current checks are:

- `npm ci`
- `npx tsc --noEmit`
- `npm run i18n:audit`
- `npm run i18n:parity`
- `npm run lint`
- `npm run build`

The build invokes i18n parity as well; the explicit parity step remains because it provides a distinct diagnostic gate.

Where stage-specific automated checks are required, they must be added to the validation path rather than assuming the generic build is sufficient.

## Stage matrix

| Stage | Pre-deployment acceptance | Runtime acceptance | Current closure status |
|---|---|---|---|
| UX 0 — Baseline Lock | Baseline documentation/repository reconciliation + shared CI + baseline structural checks | Only checks that require deployed runtime | Must be established from evidence; not inferred |
| UX 1 — Navigation & IA | Shared CI + navigation/route/permission structural checks + required interactive checks | Deployed navigation/runtime only where required | Must be established from evidence; not inferred |
| UX 2 — User Surface Model | Shared CI + authorization/surface checks + AJM/PJ integration checks + required interactive checks | Deployed authorization/integration only where required | Must be established from evidence; not inferred |
| UX 3 — Workspace Foundation | Shared CI + Workspace/Sidebar/Widget architecture checks + responsive/i18n checks + required interactive checks | Deployed Workspace runtime only where required | Must be established from evidence; not inferred |
| UX 4 — Workspace Personalization | Shared CI + Widget add/remove/order/persistence structural checks + required interactive checks | Deployed interaction/persistence only where required | Must be established from evidence; not inferred |

## Evidence rules

A workflow file is **not** a validation result.

A stage may be marked **CI validated** only when an actual GitHub Actions run for the relevant commit has passed.

A stage may be marked **Production Ready** only when:

1. implementation is complete against the governing stage Definition of Done;
2. all applicable pre-deployment gates pass;
3. required interactive/local checks pass;
4. no known blocking defect remains;
5. unresolved issues are explicitly classified and accepted as non-blocking where appropriate;
6. the candidate commit is recorded as Ready for Deployment.

A stage requiring deployed behavior cannot be closed as fully runtime-validated without actual runtime evidence.

## Vercel rule

Vercel remains the production/deployment platform. This protocol does not change Vercel, Supabase, authentication, database architecture, or application ownership.

Vercel is reserved for:

- deployed Next.js runtime behavior;
- Vercel-specific behavior;
- production-like configuration/environment behavior;
- deployed Supabase/Auth integration where deployment is required for faithful evidence;
- production routing/middleware/cookie/cache/Server Component behavior that cannot be established before deployment;
- final release verification.

Do not use Vercel simply to discover TypeScript, lint, deterministic build, i18n parity, or source-level failures reproducible in GitHub Actions/Codespaces.

## Stage 0–4 delivery objective

The objective is not to create a CI workflow and stop. The objective is to use the new validation path to finish the actual implementation of Stages 0–4.

The delivery owner must:

1. inspect the actual implementation for every stage;
2. identify incomplete, broken, duplicated, or contradictory work;
3. implement/fix it;
4. run pre-deployment validation;
5. iterate on failures;
6. perform interactive checks where static validation cannot prove behavior;
7. use Vercel only after the candidate is genuinely ready for deployed verification;
8. perform final runtime checks;
9. document the evidence and close only then.

## Current state statement

This baseline intentionally makes **no claim that UX Stages 0–4 are complete**. Their completion must be determined by the actual implementation and validation evidence produced during the delivery package.

The GitHub-first method is therefore a change to the execution/validation process, not a shortcut around the Definition of Done.
