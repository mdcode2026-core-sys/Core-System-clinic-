# CORE SYSTEM — Deployment Governance / CI-CD

**Status:** AUTHORITATIVE GOVERNANCE
**Effective:** 2026-09-05
**Scope:** CORE SYSTEM repository, GitHub, Codespaces/local validation, GitHub Actions, Vercel Preview/Production

## 1. Non-negotiable rule

**NO COMMIT, PUSH, MERGE, or DEPLOYMENT may be used as a substitute for validation.**

The required order is:

> **Inspect → Implement → Local/Codespaces Validation → GitHub Actions Validation → Candidate SHA → Controlled Push/Merge → Single Production Deployment → Exact-SHA Runtime Verification → Production Closure**

A commit made only to "see what Vercel does" is prohibited.

A deployment made before the candidate has passed its required validation gates is prohibited.

## 2. Separation of environments

### Development / Codespaces / Local

This is where implementation and iterative debugging happen. Builds, lint, typecheck, audits and E2E tests must be completed here whenever technically possible before a candidate is promoted.

### GitHub Actions

GitHub Actions is the CI validation authority. It must validate the exact candidate SHA rather than an unrelated moving branch state.

### Vercel Preview

Preview deployments are not a validation substitute. A Preview deployment must never be used to compensate for missing local/CI verification.

### Vercel Production

Production is a release target, not a development environment. Production deployment is allowed only for a validated candidate SHA.

## 3. Candidate lifecycle

1. Inspect the current repository, existing architecture, migrations, workflows and relevant runtime state.
2. Implement the smallest justified change.
3. Run the applicable local/Codespaces checks.
4. Run the full relevant GitHub Actions validation suite.
5. Freeze the exact candidate SHA after all required checks pass.
6. Do not create additional commits after the candidate is declared validated unless the new commit restarts validation from step 1.
7. Promote exactly that SHA through the controlled release path.
8. Verify that Production exposes the exact candidate SHA through `/api/build-info` or the project's canonical build identity mechanism.
9. Run authenticated Production E2E and real-world clinic journey verification.
10. Only then declare **PRODUCTION CLOSED**.

## 4. Main branch policy

`main` is a release branch, not a scratchpad.

Direct iterative commits to `main` are prohibited for normal development.

Changes must be developed on a working branch and promoted only after the required checks pass. A merge into `main` is itself a release-significant event because the repository is connected to Vercel.

Therefore:

- No "test commit" on `main`.
- No empty commit to trigger Vercel.
- No repeated push/redeploy loop.
- No merge merely to inspect a build.
- No deployment retry by creating another commit.

## 5. Required CI gates

The canonical validation set must cover, as applicable:

- dependency installation from lockfile (`npm ci`)
- TypeScript
- lint
- I18N audit and parity
- UX/IA integrity audits
- AJM audits and migration integrity
- production build
- local production-server startup
- authenticated route E2E
- real-world clinic journey E2E
- any domain-specific tests required by the change

The existing `CORE SYSTEM Reality Audit - Local CI` workflow is the baseline validation suite. It currently performs these classes of checks before its workflow reports success.

## 6. Exact-SHA rule

A successful test result belongs to one exact Git SHA.

A different SHA is an unvalidated candidate, even if its changes appear trivial.

If any commit is added after validation:

> **Previous validation is invalidated. Re-run the required gates for the new SHA.**

## 7. Deployment gate

The release process must not manufacture a new commit in order to deploy.

The deployment target must be the already validated candidate SHA.

The production verification workflow must fail when:

- Production serves a different SHA;
- the deployment is not ready;
- required production E2E fails;
- the real-world clinic journey fails;
- required integrity audits fail.

## 8. Deployment storm prevention

The following behavior is explicitly prohibited:

- pushing many small commits to trigger successive Vercel deployments;
- repeatedly rewriting navigation/UI and pushing each intermediate state;
- using Vercel as an iterative build/test loop;
- merging multiple experimental commits into `main` before validation;
- retrying a rate-limited deployment by generating more commits;
- creating an empty commit solely to force deployment.

**One validated candidate → one controlled production deployment attempt.**

## 9. Rate-limit protection

Vercel deployment limits are an infrastructure constraint and are separate from application usage/billing budgets.

When a deployment rate limit is reached, the release process is frozen. The correct response is **not** to create more commits.

The candidate SHA remains the candidate. Once the infrastructure window permits deployment, that same SHA is deployed and verified.

## 10. Closure vocabulary

Only two final states are permitted:

### PRODUCTION CLOSED

Used only when the exact candidate SHA is confirmed on Production and all required runtime/E2E/closure gates pass.

### NOT CLOSED — BLOCKER

Used whenever any required gate, deployment, exact-SHA verification, runtime verification, or infrastructure prerequisite has not passed.

Do not use "complete", "done", "ready", or equivalent language as a substitute for either closure state in a release report.

## 11. Current repository baseline

At the time this governance document was established:

- Last known successful Production candidate: `5acd5ce9c2b8f12e26e2fb0999df256de62db9a7`
- Current `main` candidate: `36710ff431b0b73d2e654cc388e738dbeac228df`
- The current Production blocker is Vercel deployment rate limiting, not a demonstrated application build failure.

This governance document does not authorize rollback or code changes merely to bypass the infrastructure blocker.

## 12. Mandatory behavior for future CORE SYSTEM work

Before making any repository change that could reach `main` or Vercel, the operator/agent must ask internally:

1. What exact SHA am I changing?
2. Has the relevant work been fully validated locally/Codespaces?
3. Have the required GitHub Actions checks passed for this exact SHA?
4. Am I creating a commit only to trigger deployment?
5. If this reaches `main`, will Vercel attempt a deployment?
6. Is this the single intended release candidate?

If the answer to #2 or #3 is **no**, the work remains in validation and must not be promoted to `main`.

## 13. Authority

This document is an operational governance reference for CORE SYSTEM deployment behavior.

It complements — and does not replace — the authoritative architecture decisions, Patient Journey documents, security/RBAC decisions, database governance, and project roadmap.

When a deployment instruction conflicts with this document, the safer sequence applies: **validate first, promote second, deploy once, verify exact SHA, then close.**
