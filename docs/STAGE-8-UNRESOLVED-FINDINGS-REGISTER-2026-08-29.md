# Stage 8 — Unresolved Findings Register

**Stage:** 8 — Global Search
**Date:** 2026-08-29

## S8-F-001 — Procedure and staff results currently route to existing settings surface

- **Class:** D — Future / cross-workstream refinement
- **Description:** Global Search returns staff and procedure records, but the current repository does not expose a dedicated canonical detail route for each result type in the primary navigation model.
- **Evidence:** Navigation registry exposes Settings as the existing administrative surface; no dedicated staff/procedure detail route is part of the approved current navigation registry.
- **Impact:** Search remains discoverable and functional, but these result types open the closest existing canonical administrative surface rather than a new route.
- **Owner:** AJM / Tenant Administration and Medical Master Library workstreams.
- **Stage:** Future cross-workstream refinement.
- **Recommendation:** When those domains receive canonical detail routes, update the result targets without changing the search architecture.
- **Why deferred:** Creating new routes solely for Search would violate Stage 8's reuse/reconcile rule and would create navigation/domain churn.

## S8-F-002 — Production Vercel status may be rate-limited by the provider

- **Class:** C — External deployment condition
- **Description:** Vercel may report provider build-rate-limit status for PR preview deployments even when GitHub engineering validation passes.
- **Owner:** Vercel deployment integration.
- **Stage impact:** Non-blocking until a validated production deployment is required for final closure.
- **Recommendation:** Use the existing Git Integration production deployment path after GitHub gates pass; do not introduce a token-based workaround merely for preview builds.
