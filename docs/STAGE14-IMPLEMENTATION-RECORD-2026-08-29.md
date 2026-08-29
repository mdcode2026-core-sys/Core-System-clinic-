# Stage 14 — Legacy Cleanup

## Scope
Identify and safely remove obsolete implementations only where the canonical replacement is proven, tested, referenced correctly, and free of hidden production dependencies.

## Safety Rule
No architectural rewrite. AJM, PJ, Agenda, Patient Flow, authorization, entitlements, domain ownership, and canonical data sources remain unchanged.

## Initial Audit
The Stage 14 audit checks active source surfaces for known superseded identifiers and legacy routes. A finding is blocking and requires evidence before deletion; absence of a finding means no speculative cleanup is performed.

## Decision Register
- Legacy identifiers with proven active usage: none at the initial audit baseline.
- Unsafe/uncertain removals: deferred rather than deleted.
- Duplicate canonical domains: none introduced by Stage 14.

## Status
Open until the Stage 14 blocking CI gate and full regression validation pass.
