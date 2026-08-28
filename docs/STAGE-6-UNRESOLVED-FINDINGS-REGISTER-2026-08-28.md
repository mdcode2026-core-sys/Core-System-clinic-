# Stage 6 — Unresolved Findings Register

**Final Stage 6 disposition:** No Stage 6-owned unresolved blockers remain.

## S6-SEC-001 — Existing production dependency security debt

- **Description:** The production dependency audit reports 14 vulnerabilities (1 moderate, 13 high) in the existing dependency graph.
- **Evidence:** GitHub UX Stages 0–6 CI run #58 recorded the audit output. High findings include transitive `adm-zip`, `js-yaml`, `nanoid`, `next`, `postcss`, and `sharp`; `uuid` has no available fix in the reported graph.
- **Impact:** Platform dependency/security maintenance concern. It is not introduced by Stage 6 Patient Flow implementation.
- **Regression:** No Stage 6 regression established.
- **Owning workstream:** Dependency/security maintenance.
- **Disposition:** **Deferred / non-Stage-6 finding.** It remains visible in CI and is not suppressed.
- **Why not fixed in Stage 6:** The available remediation for the Next/Cornerstone chain includes breaking dependency upgrades. A broad dependency migration inside Patient Flow work without a compatibility review would violate stage boundaries and create avoidable regression risk.
- **Recommendation:** Resolve in a dedicated dependency/security workstream with compatibility testing and a fresh production audit.
- **Stage 6 closure impact:** None; this finding is outside Stage 6 ownership and identifies no Patient Flow defect.

## Closed finding — S6-DEPLOY-001

The former Vercel Actions credential blocker is **closed**. The production handoff workflow was reconciled to the repository's existing Vercel Git Integration and no longer requires GitHub Actions Vercel secrets. The validated `main` commit was deployed by Vercel as a READY Production deployment. Production protected-route runtime checks for `/patient-flow`, `/patient-flow/operations`, `/patient-flow/clinical`, and `/patient-flow/administrative` succeeded and correctly resolved unauthenticated requests to `/login`.
