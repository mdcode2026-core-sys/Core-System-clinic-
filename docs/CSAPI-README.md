# CSAPI — CORE SYSTEM Architecture & Product Integration

## Purpose

CSAPI is the independent architecture/product-integration decision path for CORE SYSTEM.

It is intentionally isolated from the Global Experience / UX presentation execution branches, including PR #129 and its descendant work.

## Canonical branch

`architecture/csapi-decision-gates-2026-09-16`

## Baseline

This branch starts independently from `main` and must not be treated as a child, continuation, merge target, or migration path for PR #129 or any branch beneath it.

## Operating rule

CSAPI uses sequential Decision Gates:

1. Study the domain in simple product language.
2. Verify the current repository/live reality behind it.
3. Identify documented decisions, undocumented decisions, missing implementation, unintended implementation, deferred work, and documentation drift.
4. Present only the product decisions that require approval.
5. Record approved decisions.
6. Implement only after the decision is approved.
7. Verify implementation.
8. Close the Gate.
9. Move to the next Gate.

No Gate may silently inherit an unresolved decision from another Gate.

## Separation rule

Visual/UX presentation work may continue independently. It must not be merged into CSAPI unless a future decision explicitly requires a product/architecture dependency.

CSAPI must not modify or depend on PR #129/#136 implementation history as an execution path.

## Current first Gate

**Gate 01 — Patient Flow**

The product term is **Patient Flow**. `Canonical Clinic Flow` is not a product/domain name and must not be introduced as a competing terminology.
