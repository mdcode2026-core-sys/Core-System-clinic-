# ADR-013 — Operational Capability Model (Role / Permission / Capability / Skill / Qualification / Specialty Separation)

**Status:** Accepted — 2026-09-04

## Context

The current implementation of `providerEligibility()` in the Agenda Availability Engine depends on two tables (`clinic_procedure_skill_requirements`, `clinic_procedure_qualification_requirements`) that were removed from Production on 2026-09-01 and are not to be recreated. Investigation into the correct replacement model concluded that the removed tables represented an incorrect premise: an automatic two-hop matching engine ("Procedure requires Skill/Qualification X → check if employee has X") rather than an explicit, clinic-controlled authorization record. This ADR replaces that premise.

## Decisions

1. Six concepts are distinct and none is reducible to another:
   - **Role** — who the user is within the system (system identity/access tier).
   - **Permission** — which system operations the user may perform.
   - **Capability** — which specific clinical procedures/services the clinic has explicitly configured a given workforce member to perform. Operational, clinic-controlled, tenant-scoped.
   - **Skill** — a recorded proficiency/competency signal about the person. Background, supporting only.
   - **Qualification** — a recorded credential/certification signal about the person. Background, supporting only. Not a legal or professional verification.
   - **Specialty** — how clinical/medical knowledge is classified in the future Medical Master Library (ADR-005). Classification, not an authorization mechanism by itself.

2. CORE does not verify legal/professional licensure. Qualification records are informational, never an enforcement mechanism on their own.

3. Role never implies procedure eligibility. Specialty never restricts procedure eligibility by itself. Skill/Qualification never automatically grant Role, Permission, or booking eligibility.

4. Procedure eligibility for Agenda booking and for Treatment Plan items must be derived from Capability — an explicit clinic-configured record — optionally informed by Skill/Qualification as supporting/background signal, never computed automatically from Skill/Qualification alone.

5. Hierarchy:
```text
Clinic Configuration
        ↓
Operational Capability (workforce member × procedure/service, per tenant)
        ↓
Agenda / Treatment Plan Eligibility
        ↑  (optional supporting signal, never authoritative)
Skill / Qualification (background records)
```

6. Absence of any configured Capability record for a given tenant+procedure pair means Capability enforcement is **not yet active** for that procedure (fail-open / unrestricted), consistent with Capability being explicit clinic opt-in rather than a default-deny gate. Once at least one Capability record exists for a tenant+procedure pair, eligibility must be strictly enforced for that pair (only workforce members with a configured Capability record are eligible).

7. Resource Requirement (physical room/equipment availability) is a separate concept, remains fully out of scope of this ADR, and is not to be resurrected or merged with Capability.

8. Medical Master Library / Service Catalog / Procedure↔Specialty M:N mapping (ADR-005) remains Unbuilt Backlog Scope. This ADR does not require ADR-005 to be implemented first. Capability is built against the current transitional `clinic_procedures` catalog and may be migrated later when ADR-005 is implemented.

## Guardrails (explicit prohibitions)

- No `Role → Procedure` derivation.
- No `Specialty → Procedure` restriction by itself.
- No `Skill/Qualification → Permission or Role` automatic grant.
- No `Workspace` used as an authorization boundary (restated from prior ADRs for this domain).
- No blind recreation of `clinic_procedure_skill_requirements` / `clinic_procedure_qualification_requirements`.
- No resurrecting Resource Requirement as part of this model.

## Implementation boundary

This ADR establishes the conceptual model and its fail-open/fail-closed transition rule (Decision 6). The concrete Capability schema must reuse existing Workforce/Procedure foundations (`workforce_employees`, `clinic_procedures`) rather than introducing a new employee/provider identity concept, and is implementation work for the following remediation phase.
