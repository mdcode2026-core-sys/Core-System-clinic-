# CSAPI Gate 01 — D1 Canonical Contracts Verification

**Date:** 2026-09-17  
**Stage:** D1 — Canonical Contracts  
**Status:** VERIFIED / CLOSED  
**Implementation branch:** `implementation/csapi-gate-01-d1-canonical-contracts-2026-09-17`  
**Verified candidate SHA:** `b9470061da5c188adff40b0956ce03a540beccf8`  
**Verification PR:** #144 — CI verification — CSAPI Gate 01 D1  
**Verification branch:** `verification/csapi-gate-01-d1-ci-main`

## Verification evidence

GitHub Actions workflow: **CORE SYSTEM Unified Test Execution Engine**  
Workflow run: **#342** / ID `35242133608`  
Job: **UNIFIED — Test Execution Engine** / ID `105272966673`  
Result: **completed / success**

Execution contract:

- Baseline: `d85a5de23051919fb347e1482bc28f5fe70c0e14`
- Candidate: `b9470061da5c188adff40b0956ce03a540beccf8`
- Contract version: `2.0`
- Regression level: `R3`

## Checks

- TypeScript: **PASS**
- ESLint: **PASS**
- Production build: **PASS**
- Authenticated E2E: **PASS — 2/2**
- Authorization runtime: **PASS**
- Cross-domain reconciliation: **PASS**
- Database-integrity suite: **PASS**
- Patient Journey runtime: **PASS**
- Procurement/Inventory/Finance runtime: **PASS**
- Final unified execution decision: **PASS — 9/9, failed 0**

The D1 contract artifact `src/domain/patient-flow/patient-flow.contracts.ts` was inspected on the implementation branch and is additive. It introduces the canonical Patient Flow contract vocabulary and legacy compatibility representation without mutating the existing six-state lifecycle model.

## Non-blocking observations

- The build emitted webpack circular-dependency and no-build-cache warnings; the build nevertheless passed.
- Dependency installation reported npm audit findings; D1 introduced no dependency changes.
- The runtime logs contained repeated `The destination stream closed early` messages, but all selected suites completed successfully.
- One authenticated flow emitted a transient `JWT issued at future` lookup warning while still completing successfully.
- Because the verification PR targeted `main`, GitHub Actions checked out its PR merge context (`5aa3be17cef293b5ceb97c8138e7148e26da16f2`); the execution contract explicitly recorded the D1 implementation candidate as `b9470061da5c188adff40b0956ce03a540beccf8`.

## Evidence artifact

Artifact ID: `10506665175`  
Artifact: `core-system-unified-test-evidence-5aa3be17cef293b5ceb97c8138e7148e26da16f2`  
Digest: `sha256:60089349736733a0dc6bda319a2ee5ff012501eafbddff0a3c1ed7f5862114c5`  
Expiry: 2026-12-16

## Closure decision

The verified implementation candidate passed the required D1 engineering and regression checks. D1 is **VERIFIED / CLOSED** for candidate `b9470061da5c188adff40b0956ce03a540beccf8`.

No database schema, permission model, production data, or Vercel state was changed as part of D1.

**Next implementation stage:** D2 — Database Foundations. D2 must start from the verified implementation candidate SHA above, not from the verification PR merge SHA.
