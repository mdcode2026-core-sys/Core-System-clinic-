# AJM-1 — Visibility & Acceptance Validation Follow-up

**Workstream:** AJM — Administrative & Journey Management  
**Stage:** AJM-1 — Team & Access Foundation  
**Status:** IMPLEMENTATION COMPLETE — MANUAL ACCEPTANCE PENDING  
**Date:** 2026-08-27

## Trigger

The project owner reported that the production UI did not show an obvious change after AJM-1 and therefore could not perform the requested manual verification.

## Finding

AJM-1 implementation existed in the repository and database, but the Settings surface presented the capabilities as ordinary Settings tabs and opened on the generic Settings Overview. This made the Team & Access foundation insufficiently discoverable for manual acceptance, even though the underlying components existed.

The Team & Access blueprint requires an understandable administrative surface for users, roles, permissions, overrides, effective access, workspaces and user settings. Visibility must remain presentation; authorization remains permission-driven.

## Remediation

The Settings surface was extended without creating a second domain or authorization engine:

- Added an explicit **Team & Access / إدارة الفريق والصلاحيات** entry as the first Settings surface.
- Made it the default landing surface for Settings.
- Added clear entry cards for Users, Roles & Permissions, User Access & Overrides, Role Templates and My Settings.
- Cards navigate to the existing authoritative managers; no duplicate business logic was introduced.
- Preserved permission filtering for each underlying capability.
- Preserved the distinction between Role, Permission, Workspace and Tenant Entitlement.
- Preserved Arabic/English behavior.

## Why this is a valid AJM-1 correction

This is a visibility/discoverability correction to an existing Team & Access implementation. It follows:

> Inspect → Reuse → Extend → Create

No new authorization model, duplicate role system, duplicate user system, or workspace security boundary was introduced.

## Production evidence

The remediation was committed to `main` as:

`eb704b7fba9d57364dc10cf579b0daad890ed420`

Vercel automatically created production deployment:

`dpl_Ek6kqdozgsJ4GKCNUjf6dPFRMPVn`

At documentation time the deployment was still BUILDING; manual acceptance must only be performed after it reaches READY.

## Manual acceptance gate

After production is READY, the owner should open **Settings** and verify that **Team & Access / إدارة الفريق والصلاحيات** is immediately visible and that its cards open:

1. Users
2. Roles & Permissions
3. User Access & Overrides
4. Role Templates
5. My Settings

Then perform the previously defined authorization scenarios: custom Role, Role permission assignment, Direct Permission, Explicit Revoke, unauthorized access denial and tenant isolation.

## Closure rule

AJM-1 remains **not accepted for final manual closure** until the owner can see the Team & Access surface in production and the core scenarios are manually confirmed.

No AJM-2 implementation should begin until this acceptance gate is satisfied.
