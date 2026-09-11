# CORE SYSTEM Unified Test Execution Engine

## Authority

`tools/test-execution-setup.mjs` is the decision engine. It compares the exact candidate against the exact baseline and produces `test-execution-plan.json`.

`tools/test-execution-runner.mjs` is the execution engine. It executes only the suites selected by the contract, records each suite/test/command/exit code/duration, writes `test-execution-report.json`, and fails the workflow when any required test fails.

`.github/workflows/test-execution-contract.yml` is the single automated test workflow for pull requests to `main` and manual execution.

## Applicability is part of the authority

Unified means **one test authority**, not **all tests for every change**.

The decision engine must select suites according to actual impact. Engineering checks are always required; domain/runtime suites are required only when the changed implementation materially affects the behavior covered by those suites.

A global UI/shell change must not be promoted into a database, patient-journey, inventory/finance, retention, or broad authorization regression merely because a generic filename matches a broad pattern.

The binding selection rules are recorded in:

`docs/TEST-APPLICABILITY-CONTRACT-2026-09-12.md`

The generated `test-execution-plan.json` is the evidence for which suites were applicable to the exact candidate.

## Failure localization

Every executed test is reported as `SUITE`, `TEST`, `STATUS`, and `exit` in the Actions log and in `test-execution-report.json`. A failed suite does not hide later failures; the runner continues through the selected plan and emits a final deterministic decision.

Before treating a failure as a defect in the changed feature, verify that the failed suite was selected as applicable and that the changed surface actually crosses its authority boundary.

## Targeted Global Surfaces validation

Header/global-surface changes use the targeted `global-surfaces` suite, backed by `test:header-technical-foundation`, instead of inheriting unrelated domain suites.

For example, Quick Actions requires the engineering baseline and the targeted Header contract, with i18n validation when the canonical i18n path is touched. It does not automatically require unrelated Patient Journey, Inventory/Finance, database-integrity, or retention tests.

## Runtime

Engineering checks run first. If an authenticated browser suite is required, the runner starts the local production server from the validated build, waits for `/api/build-info`, executes the browser suites, and stops the server.

Vercel is not a routine validation environment. Production release eligibility consumes a successful unified test-engine run.

## Retired automated test workflows

The former duplicate i18n, UX, stage validation, Reality Audit, runtime E2E, legacy cleanup, and documentation validation workflows were removed from `.github/workflows` so they cannot execute as parallel test authorities.

Release/deployment governance workflows remain separate because they govern release/deployment rather than provide an independent test authority.
