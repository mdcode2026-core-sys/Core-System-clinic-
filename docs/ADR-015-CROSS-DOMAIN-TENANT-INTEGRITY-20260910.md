# ADR-015 — Cross-Domain Tenant Integrity Boundary

Date: 2026-09-10
Status: Implemented for operational cross-domain relationships; tenant isolation remains mandatory at the database boundary.

## Decision

Operational records that belong to a clinic must not reference tenant-scoped records belonging to another clinic. Cross-domain relationships use the existing database pattern:

`(tenant_id, referenced_id) REFERENCES (tenant_id, id)`

No second permission engine or parallel tenant-isolation mechanism is introduced. Existing Follow-up tenant-integrity enforcement remains canonical for its richer patient/session/actor consistency rules.

Patient Identity is intentionally different: a single patient identity may have separate clinic-specific relationships. Identity sharing does not grant a clinic access to another clinic's tenant-scoped clinical, financial, operational, workforce, inventory, procurement, or communication data.

## Branch boundary

The project contains branch-related schema support, but a complete branch governance model is not an authorization exception and is not a tenant-sharing mechanism. Until a dedicated branch governance decision is formally approved, Branch remains subordinate to Tenant for isolation purposes.

## Scope exclusions

This ADR does not define or modify the full patient-facing portal experience, and it does not govern platform-owner provisioning/subscription/billing operations.

## Implementation evidence

Migration: `20260910102722_cross_domain_tenant_integrity_hardening.sql`

The migration adds same-tenant composite foreign keys for the audited operational relationships, including Agenda→Patient/Procedure/Room/Inquiry/Resource/Doctor, Visit→Patient/Agenda/Room/Doctor, Treatment Plan→Patient/Visit/Package, Treatment Plan Visit→Plan/Visit/Item, Medical File→Patient/Visit, Financial Plan→Patient/Treatment Plan, Insurance→Patient/Profile/Invoice, Inventory Ledger→Procedure/Visit, Patient Packages/Consumption→Financial/Clinical references, Workforce Commission→Payment, Workforce Procedure Capability→Procedure, and commercial offer/package relationships.

## Migration reconciliation note

Live Supabase previously contained a migration ledger row whose version and stored name did not match a repository filename (`20260909175027` vs a filename/name containing `20260909204800`). That pre-existing discrepancy was retained as a reconciliation finding rather than silently rewritten. This ADR records the new cross-domain migration using the version actually assigned by the live migration ledger (`20260910102722`).
