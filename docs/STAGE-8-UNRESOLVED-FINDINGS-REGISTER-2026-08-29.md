# Stage 8 — Unresolved Findings Register

**Stage:** 8 — Global Search  
**Date:** 2026-08-29

## S8-F-001 — Procedure and staff results currently route to existing settings surface

- **Class:** D — Future / cross-workstream refinement
- **Status:** DEFERRED — NON-BLOCKING
- **Description:** Global Search returns staff and procedure records, but the current repository does not expose a dedicated canonical detail route for each result type in the primary navigation model.
- **Evidence:** The navigation authority exposes the existing administrative surface; no dedicated staff/procedure detail route is part of the approved current navigation registry.
- **Impact:** Search remains discoverable and functional, but these result types open the closest existing canonical administrative surface rather than a new route.
- **Owner:** AJM / Tenant Administration and Medical Master Library workstreams.
- **Recommendation:** When those domains receive canonical detail routes, update the result targets without changing the search architecture.
- **Why deferred:** Creating new routes solely for Search would violate the Stage 8 reuse/reconcile rule and create navigation/domain churn.

## S8-F-002 — Production Vercel rate-limit condition

- **Class:** C — External deployment condition
- **Status:** RESOLVED
- **Description:** An earlier preview deployment encountered provider build-rate-limit behavior while GitHub engineering validation was passing.
- **Resolution:** The existing Vercel Git integration production path was used after engineering validation; the final production candidate reached READY for SHA `88559c4db32f32e2a074ad735ea97538e62171bf`.
- **Impact on Stage 8:** None remaining.
- **No workaround:** No token-based workaround or repository secret was introduced.

## Stage 8 blocker register

**No unresolved Stage 8 blocker remains.**
