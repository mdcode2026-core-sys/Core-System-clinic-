# Stage 14 — Legacy Cleanup

## Scope
Identify and safely remove obsolete implementations only where the canonical replacement is proven, tested, referenced correctly, and free of hidden production dependencies.

## Safety Rule
No architectural rewrite. AJM, PJ, Agenda, Patient Flow, authorization, entitlements, domain ownership, and canonical data sources remain unchanged.

## Initial Audit
The Stage 14 audit checks active source surfaces for known superseded identifiers and legacy routes. A finding is blocking and requires evidence before deletion; absence of a finding means no speculative cleanup is performed.

## Decision Register
- Legacy identifiers with proven active usage: none.
- `src/features/workspace/WorkspaceSurfaceNav.tsx`: proven unused by the active shell and inconsistent with the superseded fixed-workspace presentation model; safely removed in reconciliation commit `1799c35ea43285f17776f94b4c72fd58a45b1c10`.
- Unsafe/uncertain removals: deferred rather than deleted.
- Duplicate canonical domains: none introduced by Stage 14.

## Status
Stage 14 validation remains governed by its existing closure record. The WorkspaceSurfaceNav finding is now resolved and must not remain listed as an active legacy item.
