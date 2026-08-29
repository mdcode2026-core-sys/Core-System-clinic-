# Stage 11 — Unresolved Findings Register

## S11-F-001 — Repository-wide ESLint diagnostic debt

- **Classification:** D / Cross-workstream engineering debt
- **Description:** Repository-wide ESLint diagnostic reports 10 errors in pre-existing feature files covering Follow-up, Patient Portal, Reports, Roles, Role Templates, User Settings, Treatment Plans and Operation Workspace.
- **Evidence:** GitHub UX 0–8 CI repository-wide ESLint Diagnostic on final Stage 11 merge candidate.
- **Root cause:** Existing React hook purity / set-state-in-effect / rules-of-hooks findings predating Stage 11.
- **Impact:** Code-quality debt in unrelated feature surfaces; no Stage 11 build, type, security or changed-surface validation failure.
- **Severity:** Medium.
- **Owner:** Owning feature/domain teams for the affected modules.
- **Owning stage:** Cross-workstream future engineering hardening.
- **Recommendation:** Repair each affected component using the existing React architecture; do not suppress with eslint-disable or ts-ignore.
- **Reason for deferral:** Stage 11 changed-surface ESLint passed and unrelated feature rewrites would expand risk beyond the approved Stage 11 scope.
- **Production-readiness impact:** None for Stage 11. The blocking Stage 11 validation workflow passed.

## Closure status

No unresolved Stage 11 blocker remains. This finding does not reopen Stage 11.
