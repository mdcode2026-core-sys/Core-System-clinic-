# Stage 6 — Unresolved Findings Register

## S6-DEPLOY-001 — Production deployment credentials are not available to GitHub Actions

- **Description:** The gated production deployment workflow was added so Vercel deployment occurs only after the GitHub UX 0–6 validation gate succeeds. The workflow reached `vercel pull`, but `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` were empty in the GitHub Actions environment.
- **Evidence:** Production Gated Deploy run #2 completed with `vercel pull --yes --environment=production --token=""` and `Error: No existing credentials found. Please run vercel login or pass "--token"`.
- **Root cause:** The repository/Actions environment does not currently expose the required Vercel deployment secrets. This is an integration/credential configuration gap, not a Vercel Hobby build-rate-limit failure and not a Stage 6 source-code failure.
- **Impact:** The validated Stage 6 artifact cannot be promoted/deployed to the production target through the new gated workflow. Production runtime verification of the Stage 6 UI therefore cannot be completed from the current automation context.
- **Regression:** No. The failure is in the newly introduced deployment gate configuration.
- **Owning workstream:** Vercel / CI deployment configuration.
- **Stage:** Deployment/Production Readiness gate, not Patient Flow domain implementation.
- **Recommendation:** Configure the repository Actions secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` using the existing Vercel project/team credentials, then rerun the gated production deployment. Do not commit credentials to the repository.
- **Why not fixed now:** The available GitHub integration explicitly does not expose repository secret-management APIs, and generating or storing a Vercel credential cannot be safely performed from the current tool context. A project owner/admin action is required.
- **Closure condition:** The gated deploy must complete successfully, a production deployment must exist for the Stage 6 commit, and runtime verification must be completed before Stage 6 can be marked `CLOSED / Production Ready`.

## S6-SEC-001 — Existing production dependency vulnerabilities

- **Description:** The Stage 6 GitHub dependency diagnostic reports high-severity production dependency vulnerabilities.
- **Evidence:** `npm audit --omit=dev --audit-level=high` is intentionally retained as a diagnostic gate and its result is surfaced in the CI summary rather than hidden.
- **Impact:** This is a production security concern, but it is not introduced by the Stage 6 Patient Flow implementation.
- **Owning workstream:** Dependency/security maintenance.
- **Why not fixed now:** No safe package upgrade was performed without a dedicated compatibility review; changing the dependency graph during Stage 6 could introduce unrelated regressions.
- **Closure condition:** Resolve through the owning dependency/security workstream and re-run the production dependency audit.
