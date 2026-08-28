# CORE SYSTEM — UX Stages 0–4 Validation Baseline
## GitHub-first validation protocol — 2026-08-28

**Status:** ACTIVE VALIDATION BASELINE

## Purpose

This record applies the GitHub-first validation rule retroactively to UX Stages 0, 1, 2, 3 and 4 and establishes the same rule for all future UX stages.

## Validation order

For each UX stage:

1. Inspect repository state and governing UX/AJM/PJ documentation.
2. Run repository-level static validation in GitHub Actions.
3. Use Codespaces/local runtime when interactive investigation is required and available.
4. Use Vercel only when a real deployed-runtime check is required.
5. Do not consume a Vercel deployment for checks that can be established by TypeScript, lint, i18n validation, tests or production build in GitHub Actions.
6. Recheck after fixes.
7. Document the evidence and only then assign the stage closure status.

## Stage coverage

| Stage | GitHub-first scope | Vercel required? | Closure rule |
|---|---|---|---|
| UX Stage 0 | TypeScript, i18n audit/parity, lint, production build, repository/document reconciliation | Only for runtime evidence | Do not claim runtime closure from CI alone |
| UX Stage 1 | Same static gates plus stage-specific structural checks | Only if runtime behavior is affected | Static PASS is not runtime PASS |
| UX Stage 2 | Same static gates plus affected AJM/PJ integration checks | Only if runtime behavior is affected | Preserve domain ownership and existing valid work |
| UX Stage 3 | Same static gates plus Medical Master/Service Catalog structural checks | Only if runtime behavior is affected | Validate integration surfaces separately |
| UX Stage 4 | Same static gates plus Workspace/Widget/IA checks | Only for actual runtime UX verification | Runtime verification remains required for interaction claims |

## Current CI gate

`.github/workflows/ux-stages-0-4-ci.yml` is the shared pre-Vercel gate for these stages. It runs:

- `npm ci`
- `npx tsc --noEmit`
- `npm run i18n:audit`
- `npm run i18n:parity`
- `npm run lint`
- `npm run build`

The production build already invokes i18n parity, but the explicit parity step is retained so failures are surfaced as a distinct CI gate.

## Important limitation

A GitHub Actions configuration being present does not itself prove that a run has passed. A stage may be marked **CI validated** only when an actual GitHub Actions run provides evidence. Runtime claims still require an actual runtime environment.

## Non-goals

This protocol does not replace or modify:

- Vercel production hosting;
- Supabase;
- tenant isolation;
- application architecture;
- AJM ownership;
- PJ ownership;
- Workspace or Sidebar decisions.

It changes only the order and location of engineering validation so Vercel deployment quota is reserved for checks that genuinely require deployment/runtime behavior.
