# CORE SYSTEM — Mandatory Repository Execution Rules

These rules are permanent project instructions for all coding agents working on CORE SYSTEM.

## Repository / Branching
- Never work directly on `main`.
- Create or continue one purpose-specific branch for each coherent work package when a branch is needed.
- Do not create micro-branches for trivial fixes.
- Do not create parallel branches for overlapping ownership; one coherent package should have one implementation path unless the AI Engineering Leader explicitly separates independent work.
- Separate unrelated work into logical work packages (UI/API/DB/domain) rather than forcing unrelated work into one branch.
- Before changing anything, inspect the current branch, HEAD, working state, and open branches/PRs.

## Database
- Every production schema change must be introduced through a Supabase migration.
- Test migrations in an isolated Supabase branch/environment when available before code depends on them.
- Never mutate production schema merely to make tests pass.
- Never delete data, audit evidence, E2E/synthetic records, or migration history to hide anomalies.
- Prefer Inspect → Reuse → Extend → Integrate → Validate. Never Invent → Replace → Duplicate → Assume.

## Validation
- Vercel is NOT a routine validation tool.
- Run lint, type-check, build, unit/integration tests, and relevant E2E through local/Codespaces/GitHub Actions environments.
- A repair is not considered fixed without executable evidence.
- Validate relevant DB integrity, tenant isolation, authorization, and regression behavior after each repair.

## Vercel / Deployment
- Do NOT create Vercel preview or production deployments as routine checks.
- Deployment is allowed only when explicitly requested at that moment, or as the final automatic deployment caused by an approved merge to `main`.
- Production deployment must occur only after all merge gates pass.

## Merge Gate
A branch may be merged to `main` only after:
- build succeeds locally/through Actions;
- all relevant tests pass;
- migrations succeed without errors;
- security/tenant validation passes;
- relevant E2E/regression validation passes;
- conflicts with other open branches are reviewed.

## Merge / Cleanup
- Merge only after the complete gate passes.
- After a successful merge and production verification, delete the merged branch locally and remotely.
- Do not leave obsolete branches or accumulate unmerged commits without an explicit reason.

## Commits
- Keep commits small, logical, and descriptive.
- Do not combine unrelated fixes.
- Examples: `fix(inventory): enforce canonical atomic stock mutations`, `fix(permissions): enforce subscription capability boundary`.

## CORE SYSTEM Architecture Rules
- Preserve the existing canonical domain engines; do not create parallel Inventory, Permission, Agenda, Follow-up, Notification, or Communication engines.
- Subscription defines the Tenant capability boundary; RBAC/direct permissions/overrides define what a user may do within that boundary.
- Full Subscription permits the Tenant's Clinic Admin to administer all capabilities available to that Tenant. This must never be implemented as an email/account exception.
- Super Admin is platform owner/lessor; Clinic Admin is the tenant administrator.
- Preserve tenant isolation, RLS, authentication, and audit controls regardless of subscription level.

## Task Completion Summary
At the end of every task report:
1. branch used;
2. checks and evidence performed;
3. merge status;
4. branch deletion status.

These rules apply to all future work unless a newer explicit project decision supersedes a specific rule.

## AI Engineering Organization

The AI Engineering Organization is governed by:
- docs/AI-ENGINEERING/AI-ENGINEERING-LEADERSHIP-CHARTER.md
- docs/AI-ENGINEERING/AI-ENGINEERING-ROLES-AND-BOUNDARIES.md
- docs/AI-ENGINEERING/AI-ENGINEERING-CONTROL-AND-CONTINUITY.md
- docs/AI-ENGINEERING/AI-ENGINEERING-CURRENT-STATE.md
- docs/AI-ENGINEERING/AI-ENGINEERING-MASTER-PROMPT.md

The AI Engineering Leader is the permanent technical leader. Functions such as Architecture, Backend, Database, Frontend, QA, Security, Platform and Documentation are activated under that leadership and do not become competing project authorities.

Every active change must belong to a coherent work package with one primary owner function, explicit scope, acceptance conditions and required evidence.

When a conversation changes, the next session must use the applicable handoff/current-state records and verify repository/runtime reality before continuing. Chat memory alone is never the continuity source.

A work package is not closed until its required implementation, tests, verification, reconciliation and documentation are complete.
