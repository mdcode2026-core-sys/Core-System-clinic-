# CORE SYSTEM Unified Test Execution Engine

## Authority

`tools/test-execution-setup.mjs` is the decision engine. It compares the exact candidate against the exact baseline and produces `test-execution-plan.json`.

`tools/test-execution-runner.mjs` is the execution engine. It executes only the suites selected by the contract, records each suite/test/command/exit code/duration, writes `test-execution-report.json`, and fails the workflow when any required test fails.

`.github/workflows/test-execution-contract.yml` is the single automated test workflow for pull requests to `main` and manual execution.

## Failure localization

Every executed test is reported as `SUITE`, `TEST`, `STATUS`, and `exit` in the Actions log and in `test-execution-report.json`. A failed suite does not hide later failures; the runner continues through the selected plan and emits a final deterministic decision.

## Runtime

Engineering checks run first. If an authenticated browser suite is required, the runner starts the local production server from the validated build, waits for `/api/build-info`, executes the browser suites, and stops the server.

Vercel is not a routine validation environment. Production release eligibility consumes a successful unified test-engine run.

## Retired automated test workflows

The former duplicate i18n, UX, stage validation, Reality Audit, runtime E2E, legacy cleanup, and documentation validation workflows were removed from `.github/workflows` so they cannot execute as parallel test authorities.

Release/deployment governance workflows remain separate because they govern release/deployment rather than provide an independent test authority.
