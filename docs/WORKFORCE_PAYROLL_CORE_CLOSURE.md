# Workforce & Operations — Payroll Core Closure Evidence

## Scope
Minimum Global Payroll Core: employment, normalized earnings/deductions, advances, benefits, commissions, payroll periods/runs, payslips, country rules, multi-currency fields, audit/source linkage, tenant isolation and permissions.

## Implementation
Payroll generation consumes the effective employment record, approved normalized earnings/deductions, approved commissions, active benefit employee contributions and due advance installments. Short-term advances create a salary-advance deduction for the selected period. Installment advances create a repayment schedule and payroll allocation prevents duplicate consumption. Payment marks allocated installments paid and updates repayment status.

Payroll entry lifecycle: draft → approved → paid. Payroll period lifecycle: open → processing → locked → paid, with controlled cancellation. Payslips are derived from payroll entries, are idempotent, and require approved/paid entries. Country rules remain a separate global reference layer; no universal statutory tax rate is hard-coded.

## Validation
- Database functions exercised under an authenticated tenant JWT context using transactional rollback fixtures.
- Payroll generation exercised with normalized earning, deduction, benefit contribution, short-term advance and installment advance inputs; test transaction rolled back.
- Payroll period lifecycle transition exercised transactionally and rolled back.
- Payroll RPC execution hardened: anonymous/public execution revoked; authenticated execution retained.
- No production test transactions retained.
- Repository CI remains the required pre-production code validation gate.

## Production gate
This document intentionally stops before Vercel. Production deployment is allowed only after repository CI is green and the production-gated deployment workflow is explicitly reached.
