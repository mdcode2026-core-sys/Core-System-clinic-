# CORE SYSTEM Workstream Verification

## Decision

The former Unified Test Execution Engine is retired as the canonical execution model.

CORE SYSTEM now uses Workstream Verification Lanes:

1. A lightweight planner determines which verified lanes apply to the exact candidate.
2. Each lane runs in an independent GitHub Actions job with its own checkout, process state, runtime server, and disposable database where required.
3. A final gate aggregates lane results only. It does not execute tests.

## Why this replaces the Unified Runner

The previous runner combined unrelated suites into one long-lived execution process. That created four correctness problems:

- Runtime suites shared one application-server process and could inherit state, cache, connection, or transaction effects from earlier suites.
- Several logical suites pointed to the same underlying command, causing duplication without additional coverage.
- Workstream contracts could declare checks that were not actually represented in the runner command registry.
- The runner silently filtered unknown suites instead of failing closed, so a green setup plan did not guarantee that every declared check executed.

These are execution-model defects, not product-quality reasons to weaken testing.

## Isolation rules

Engineering owns typecheck, lint, and build.
Static workstream lanes run one explicit contract/audit command and terminate.
Runtime workstream lanes build the exact candidate, start one fresh local production server, execute only their own scenario, then terminate the server.
Database lanes use a disposable local PostgreSQL/Supabase-compatible container and never mutate hosted Supabase or production.
No runtime lane shares a server with another runtime lane.

## Contract rules

A workstream contract may declare required_suites for standardized lanes and workstream_checks for explicit workstream-owned checks.
Every required item must resolve to a known verification lane. Unknown suite/check identifiers are a planning error and fail the workflow before execution.
No contract is considered verified merely because it was parsed.

## Failure semantics

Failure of one lane does not suppress other lanes because the matrix is configured with fail-fast disabled.
The final gate passes only when planning succeeds and every applicable lane succeeds.

## PR workflow usage

For large consolidation PRs such as the Global Experience work, several independent lanes may run in parallel. Parallel isolation is preferred over serial reuse of a shared runtime process.
For focused stages such as CSAPI D2, only the engineering lane and the D2 database lane need to activate unless the D2 contract explicitly requires additional lanes.

## Release boundary

This verification architecture is CI validation only. Vercel is not used during this workstream verification phase.
