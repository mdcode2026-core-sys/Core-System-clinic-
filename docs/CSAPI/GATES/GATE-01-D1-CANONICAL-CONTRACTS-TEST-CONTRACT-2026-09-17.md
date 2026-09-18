# CSAPI Gate 01 — D1 Canonical Contracts Test Execution Contract

**Date:** 2026-09-17  
**Stage:** D1 — Canonical Contracts  
**Status:** ACTIVE TEST GATE

## Required checks

### Static

- TypeScript compilation/typecheck.
- ESLint.
- Repository import/reference audit for the new Patient Flow contract module.
- No changes to existing Queue/Visit lifecycle behavior.

### Contract invariants

The implementation must preserve these distinctions:

- Visit finality is not Clinical Work Session status.
- Queue/Waiting presence is not clinical start.
- Finish is not Visit completion.
- Hold is unresolved.
- Transfer preserves Visit identity.
- Operational disposition is not Administrative finality.
- Command/event vocabulary is centralized and additive.

### Regression

Existing Patient Flow, Queue and Visit paths must remain behaviorally unchanged because D1 does not replace the legacy state machine.

## Pass rule

D1 may be marked VERIFIED only after repository CI reports all blocking checks PASS for the exact D1 head SHA.

## Failure rule

Any TypeScript, lint, contract or regression failure keeps D1 OPEN and requires correction before the next stage.
