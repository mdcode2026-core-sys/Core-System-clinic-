# CSAPI Gate 06 — Treatment Planning — Implementation Plan
## 2026-09-30

**Status:** Planning only

## Sequence
1. Reconcile final Gate 06 design against current Gate 04 and Gate 05 closure evidence.
2. After the two-gate barrier is satisfied, create one controlled Gate 06 implementation branch from verified main.
3. WP-1 mutation authority.
4. WP-2 plan transition authority.
5. WP-3 stage transition authority.
6. WP-4 explicit next-action contract and idempotent coordination handoff.
7. WP-5 visit-link semantics.
8. WP-6 deterministic plan completion.
9. WP-7 cross-domain references/contracts.
10. WP-8 workspace/UI convergence.
11. Structural/security/database verification.
12. Local production runtime verification.
13. Authenticated E2E and Gate 02 regression.
14. Main merge only after evidence passes.
15. Exact-main production verification where required.
16. Final reconciliation, documentation synchronization and Gate 06 closure.

## Branch discipline
- one coherent Gate 06 implementation branch;
- no PR per small fix;
- no direct main implementation;
- no historical branch revival;
- no unrelated domain repair;
- no production mutation before authorized release stage.

## Exit condition
Implementation-Ready only when architecture, ownership, lifecycle rules, implementation design, execution contract, verification plan and unresolved product decisions are explicitly resolved.
