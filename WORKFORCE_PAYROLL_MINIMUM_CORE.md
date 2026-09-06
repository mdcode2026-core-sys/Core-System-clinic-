# CORE SYSTEM — Workforce Payroll Minimum Core

## Decision

Payroll is global by architecture. It is not Jordan-specific. Country-specific statutory behavior is an extension of the same payroll core, not a separate payroll system.

## Payroll flow

Employment → Compensation → Earnings → Approved Work Inputs → Deductions → Payroll Calculation → Payroll Entry → Payslip/Payment → Audit

Payroll consumes financial effects produced by Workforce/HR decisions. Payroll does not invent attendance, leave, disciplinary, benefit, or advance decisions.

## Earnings

- Base salary from the active employment record covering the payroll period.
- Allowances.
- Overtime.
- Bonuses.
- Approved commissions.

## Deductions

Every deduction has employee, payroll period, type, amount/calculation result, currency, source type, optional source reference, reason, status, creator/approver and audit timestamps.

Minimum categories: statutory tax, statutory social security, late arrival, early departure, unpaid absence, unpaid leave, benefit contribution, salary advance, loan repayment, disciplinary deduction, administrative adjustment, payroll overpayment recovery, manual adjustment.

No silent deductions: each deduction must be traceable to a source/reference or an authorized manual adjustment with a reason.

## Employee advances

One advance entity has two behavioral types.

### Short-term advance

A small advance deducted in full from the selected payroll period. Recording it creates a linked payroll deduction of type `salary_advance`.

### Installment advance

An advance approved by management and repaid over installments. Recording it creates a repayment schedule. The current minimum implementation supports monthly installments and reduces the final installment to the remaining balance.

Payroll consumes installments whose due date falls inside the payroll period.

Advance lifecycle: Draft → Approved → Disbursed/Active → Partially Repaid → Fully Repaid / Cancelled.

## Source separation

Type and source are separate concepts.

- Late Arrival ← Attendance
- Unpaid Absence ← Attendance/Leave
- Disciplinary ← Administrative Action
- Salary Advance ← Employee Advance
- Benefit Contribution ← Benefits
- Statutory Deduction ← Country Rule
- Manual Adjustment ← Authorized Manual Payroll Action

## Global/country model

The global core remains stable across countries. Country rules provide local statutory calculations, thresholds, ceilings, exemptions, contribution rules and effective dates. Country localization must not duplicate the payroll engine.

The current minimum implementation establishes the generic deduction and advance model. Statutory country-rule calculation remains a separate extension and is not silently hard-coded into the global payroll core.

## Current implementation

- `workforce_employee_advances`
- `workforce_advance_installments`
- `workforce_payroll_deductions`
- `create_workforce_employee_advance`
- `create_workforce_payroll_deduction`
- payroll generation consumes approved deductions and due advance installments
- dedicated Workforce Payroll UI at `/workforce/payroll`

## Validation principle

Inspect → Verify → Understand existing architecture → Define exact change → Implement → Validate → Document → Commit → Deploy where applicable → Verify again → Close.
