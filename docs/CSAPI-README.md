# CSAPI — CORE SYSTEM Architecture & Product Integration

## Canonical entry point

**Start here for every future CSAPI conversation:**

`docs/CSAPI/CSAPI-MASTER-STATE.md`

Then read the current Gate file identified there.

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

## Documentation rule

The conversation is not the source of truth for CSAPI state. The repository documentation is.

Every substantive CSAPI discovery, proposal, approval, implementation, verification result, deferral, rejection, or closure must be recorded in the CSAPI documentation and ledger on the canonical branch.

## Separation rule

Visual/UX presentation work may continue independently. It must not be merged into CSAPI unless a future decision explicitly requires a product/architecture dependency.

CSAPI must not modify or depend on PR #129/#136 implementation history as an execution path.

## Current first Gate

**Gate 01 — Patient Flow**

The product term is **Patient Flow**. `Canonical Clinic Flow` is not a product/domain name and must not be introduced as a competing terminology.

## Continuity rule

A new conversation beginning with `CSAPI` must locate and read `docs/CSAPI/CSAPI-MASTER-STATE.md` before deciding what has been completed or what should happen next.
