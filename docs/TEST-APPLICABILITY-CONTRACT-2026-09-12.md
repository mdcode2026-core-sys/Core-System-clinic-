# CORE SYSTEM — Unified Test Applicability Contract

**Date:** 2026-09-12  
**Status:** Binding test-selection rule  
**Applies to:** `tools/test-execution-setup.mjs` + `tools/test-execution-runner.mjs`

## 1. Core rule

The Unified Test Execution Engine is the single test authority, but **Unified does not mean every test suite runs for every change**.

The decision engine must determine applicability from the actual changed surface and its verified impact. A suite is required only when the change can materially affect the behavior covered by that suite.

A failing non-applicable suite must not be used as evidence that the target change failed.

## 2. Always required

Every candidate must run the engineering baseline:

- Typecheck
- Lint
- Build

These prove repository-wide compilation/build health but do not imply that every runtime/E2E domain is affected.

## 3. Impact-driven selection

| Impact | Applicable suites |
|---|---|
| Global Header / global surface | targeted Global Surfaces/Header contract + engineering |
| i18n / locale / translation | i18n audit + parity |
| Authorization / RBAC / RLS / workspace authority | authorization + applicable authenticated E2E |
| Database schema / migration / policy | database integrity + authorization |
| Patient Journey operational logic | Patient Journey + cross-domain |
| Procurement / Inventory / Finance | procurement-inventory-finance + cross-domain |
| Unrelated domain | no domain-specific suite merely because the Unified engine contains it |

## 4. Global Header example

A change limited to Quick Actions is a Global Surface change.

Expected applicability is:

- engineering
- targeted Header/Global Surfaces audit
- i18n checks when the implementation touches the canonical language/i18n path
- any additional suite only when the changed implementation actually crosses that suite's authority boundary

It does **not** automatically require Patient Journey, Inventory/Finance, database integrity, retention, or broad runtime E2E suites.

Quick Actions uses the existing logout and language infrastructure; it must not create a new authentication, authorization, or i18n subsystem merely to satisfy testing.

## 5. Regression level

Regression level describes the breadth of justified verification, not a mandate to run every available suite.

- **R0:** isolated engineering/target check
- **R1:** contained global/UI surface change
- **R2:** verified cross-surface impact
- **R3:** security, data, or major operational cross-domain impact

A higher level may require additional targeted verification when evidence shows a real dependency. It must not be raised solely because a filename contains a generic word such as `workspace`.

## 6. Selection quality requirements

The decision engine must:

1. inspect changed paths;
2. inspect changed content where path classification is ambiguous;
3. distinguish a global shell integration from workspace-authority changes;
4. avoid broad regex classifications that turn presentation-only changes into security/data regressions;
5. record the selected impact and suites in `test-execution-plan.json`;
6. make the final report show exactly which suites were selected and why.

## 7. Failure interpretation

A failed test is actionable only after confirming that the test was applicable to the candidate.

Examples:

- Quick Actions + failing `retention_followups` timeout → not evidence against Quick Actions unless the plan established a retention dependency.
- Quick Actions + failing database-integrity suite → not evidence against Quick Actions if no database/data impact exists.
- Quick Actions + failing targeted Header contract → directly relevant and blocking.
- Quick Actions + failing i18n parity after changing the language path → relevant and blocking.

## 8. Mandatory behavior for future work

Before changing implementation because of a Unified failure, the execution report must first be checked for:

**candidate → changed files → impact classification → required suites → failing suite → actual dependency**.

No implementation change may be justified solely by the existence of a failure in a suite that was not materially applicable to the changed surface.
