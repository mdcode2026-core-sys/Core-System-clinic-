# CORE SYSTEM Verification Architecture

The former Unified Test Execution Engine has been superseded by the Workstream Verification architecture documented in docs/testing/WORKSTREAM-VERIFICATION-ARCHITECTURE.md.

.github/workflows/test-execution-contract.yml remains the workflow filename for compatibility, but it no longer runs a unified test process. It now plans independent verification lanes and aggregates their outcomes.

tools/workstream-verification-plan.mjs is the applicability and contract-resolution layer.

tools/workstream-verification-lane.mjs executes exactly one known lane per GitHub Actions job.

The architectural requirement is strict isolation: unrelated runtime suites must never share the same long-lived application process, mutable test state, or disposable database.

A final gate may aggregate results, but it must not hide missing or unsupported checks and must never treat a partially executed plan as a successful verification.

Vercel is not part of this workstream verification path.
