# CSAPI Gate 01 — D2 Database Verification Infrastructure Record

**Date:** 2026-09-17
**Purpose:** Free local PostgreSQL/pgTAP verification infrastructure
**Status:** HARDENED

## Decision

D2 verification uses disposable local PostgreSQL in GitHub Actions. It does not use Supabase hosted Branching, a paid test environment, production mutation, or Vercel.

## Failure addressed

Run `35248539554` reached the disposable PostgreSQL container and failed with exit code 137 while creating the pgTAP extension. The failure occurred before the canonical schema baseline, D2 migration, or D2 tests were executed.

## Hardening

The disposable PostgreSQL container now uses conservative shared memory, connection, work-memory, and maintenance-memory settings. This is intended to keep the free local verification path within the GitHub runner memory budget.

## Safety

- No production database connection is used.
- No hosted Supabase branch is created.
- No Vercel activity is included.
- D2 remains unverified until the complete database job passes.
