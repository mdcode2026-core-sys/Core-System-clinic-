# CORE SYSTEM — Workforce Payroll Minimum Core

## Decision

Payroll is global by architecture. It is not Jordan-specific. Country-specific statutory behavior is an extension of the same payroll core, not a separate payroll system.

Architecture:

`Payroll Core + Country Rules + Optional External Payroll Integration`

The core standardizes employee/employment, earnings, deductions, benefits, commissions, approved work inputs, payroll periods/runs, gross/net and payslips. Country rules hold local statutory behavior. External payroll/compliance providers can be integrated later without changing the core.

## Payroll flow

Employment → Compensation → Approved Work Inputs → Earnings → Deductions → Payroll Calculation → Payroll Entry → Payslip/Payment → Audit

Payroll consumes financial effects produced by Workforce/HR decisions. Payroll does not invent attendance, leave, disciplinary, benefit, or advance decisions.

## Employment

The active employment record covering the payroll period is the source of base compensation. It carries employment type, position, effective dates, working hours, currency, base salary and status.

Employment types supported by the Workforce foundation include full-time, part-time, contract, temporary and intern.

Compensation is effective-dated. Historical compensation is not overwritten when a salary changes.

## Earnings

Payroll supports a normalized earning concept in `workforce_payroll_earnings`:

- Base salary — derived from Employment.
- Allowance.
- Overtime.
- Bonus.
- Commission — from approved commission entries.
- Other earning.

The payroll entry stores summarized totals for fast reporting, while the earning records preserve the source-level detail.

## Deductions

Every deduction has employee, payroll period, type, amount/calculation result, currency, source type, optional source reference, reason, status, creator/approver and audit timestamps.

Minimum categories: statutory tax, statutory social security, late arrival, early departure, unpaid absence, unpaid leave, benefit contribution, salary advance, loan repayment, disciplinary deduction, administrative adjustment, payroll overpayment recovery, manual adjustment.

No silent deductions: each deduction must be traceable to a source/reference or to an authorized manual adjustment with a reason.

## Employee advances

One advance entity has two behavioral types.

### Short-term advance

A small advance deducted in full from the selected payroll period. Recording it creates a linked payroll deduction of type `salary_advance`.

### Installment advance

An advance approved by management and repaid over installments. Recording it creates a repayment schedule. The current minimum implementation supports monthly installments and reduces the final installment to the remaining balance.

Payroll consumes installments whose due date falls inside the payroll period and allocates them to the generated payroll entry so the same installment cannot be consumed twice.

Advance lifecycle: Draft → Approved → Disbursed/Active → Partially Repaid → Fully Repaid / Cancelled.

## Benefits

Benefits remain a Workforce concept rather than becoming a second payroll engine. When an employee benefit has an employee cost, that cost can enter Payroll as a benefit contribution deduction. Employer cost remains a separate employer-side amount.

## Approved Work Inputs

Attendance, Schedule and Leave do not feed Payroll as raw events. Their approved financial effects become Payroll inputs, such as approved overtime, approved unpaid absence/leave or other approved adjustments.

## Commission

Commission remains a separate Workforce capability:

Commission Rule → Commission Entry → Draft → Approved → Payroll

Payroll consumes only approved commission entries.

## Gross / Net

`Gross Earnings = Base + Allowances + Overtime + Bonuses + Commissions + Other Earnings`

`Net Pay = Gross Earnings − Approved Deductions`

The core does not assume a universal statutory tax or social-security rate.

## Payroll Period / Run

The existing Payroll Period is retained. The practical lifecycle is:

Open → Processing → Locked → Paid / Cancelled

Payroll entries are generated only while the period is open or processing.

## Payslip

Each payroll entry can produce one payslip containing:

- Employee
- Payroll period
- Currency
- Gross earnings
- Deductions
- Net pay
- Payslip status

The payslip is derived from the payroll entry rather than becoming a second calculation engine.

## Country Rules

Country rules are global reference data, not tenant-specific business logic. A rule contains country, effective dates, statutory flags, rates/parameters, exemptions, contribution limits where applicable, notes and source information.

The rule model includes `rule_config` so progressive brackets and other country-specific parameters can be stored without redesigning the global payroll schema.

The current Jordan reference set is stored as metadata/configuration only; automated statutory withholding is intentionally disabled until the complete required inputs and legal calculation model are implemented.

The global core therefore remains country-neutral.

## Multi-Currency

Every payroll period, employment compensation, earning, deduction and payslip carries a currency. The core does not perform currency conversion in this stage.

## External Payroll Integration

External payroll/compliance providers, government systems and accounting integrations are optional future integrations. They are not part of the global core calculation engine.

## Current implementation

- `workforce_employee_advances`
- `workforce_advance_installments`
- `workforce_payroll_earnings`
- `workforce_payroll_deductions`
- `workforce_payroll_country_rules`
- `workforce_payslips`
- `create_workforce_employee_advance`
- `create_workforce_payroll_earning`
- `create_workforce_payroll_deduction`
- `create_workforce_payslip_for_entry`
- payroll generation consumes employment, approved earnings, approved deductions, approved commissions and due advance installments
- dedicated Workforce Payroll UI at `/workforce/payroll`

## Validation principle

Inspect → Verify → Understand existing architecture → Define exact change → Implement → Validate → Document → Commit → Deploy where applicable → Verify again → Close.
