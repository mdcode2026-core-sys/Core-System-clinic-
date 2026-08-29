# CORE SYSTEM — Historical Terminology Reconciliation

**Date:** 2026-08-29  
**Status:** EXECUTED BASELINE RECONCILIATION  
**Companion authority:** `docs/CORE-SYSTEM-TERMINOLOGY-GOVERNANCE.md`

## 1. Purpose

This report reconciles the historical use of **Domain, Module, Feature, Capability, Skill and Qualification** across the current repository documentation and the AJM/UX workstream, with particular attention to older architectural decisions and newer AJM/UX authorities.

The goal is not to erase history. The goal is to prevent historical wording from continuing to create contradictory implementation decisions when AJM and UX work resumes.

## 2. Sources inspected

The reconciliation was grounded in the current `main` repository and the active AJM/UX branch family, including:

- `ARCHITECTURE_DECISIONS.md`
- `CORE_SYSTEM_INDEX.md`
- `ENGINEERING_CONSTITUTION.md`
- `docs/AJM-IMPLEMENTATION-PLAN.md`
- `docs/AJM-STAGE-INDEX.md`
- `docs/AJM-0-BASELINE-READINESS.md`
- `docs/AJM-1-VISIBILITY-VALIDATION-FOLLOWUP.md`
- `docs/AJM-2-FINANCIAL-RESOURCES.md`
- `docs/AJM-2-IMPLEMENTATION-LOG.md`
- `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`
- `docs/AJM-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`
- `docs/AJM-UX-UNIFIED-EXECUTION-PLAN-2026-08-29.md`
- `docs/AJM-UX-UNIFIED-RECONCILIATION-EXECUTIVE-REPORT-2026-08-29.md`
- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
- `GLOBAL_UX_IA_IMPLEMENTATION_PLAN_2026-08-28.md`
- `GLOBAL_UX_IA_AUDIT_FINAL_REPORT_2026-08-28.md`
- `CORE-SYSTEM-GLOBAL-UX-IA-MASTER-EXECUTION.md`
- relevant AJM/UX branches and their repository state.

The branch inventory confirmed the active AJM/UX line includes `ajm/ajm-0-baseline-readiness`, `ajm/ajm-1-team-access-foundation`, the AJM-2 implementation branches, `ajm-ux-reconciliation-2026-08-29`, and the UX audit/stage branches including `ux-global-ia-audit`, `ux-ia-stage-0-baseline-2026-08-28`, `ux-stage-6-patient-flow`, `ux-stage-7-patient-context`, `ux-stage-10-sidebar-finalization`, `docs/global-ux-ia-final-reconciliation-2026-08-28`, and the workspace foundation/personalization branches.

## 3. Executive finding

The historical problem is **not** simply that old documents said `Module` and new documents say `Domain`.

The evidence shows that these terms were often used at different conceptual levels:

- Older architecture used **Module** as the principal product/functional unit.
- Newer AJM architecture uses **Domain** as a business ownership boundary for rules and authoritative records.
- UX uses **Workspace**, **Widget**, Sidebar and contextual navigation as presentation/working surfaces.
- Subscription architecture uses **Module** and **Capability** for product packaging and enablement.
- Team/Workforce documentation sometimes used **Capability** alongside **Skill** for human eligibility, creating the most important terminology collision.

Therefore the correct remediation is **reconciliation and clarification**, not a global rename.

## 4. Historical decision: ADR-006

`ADR-006 — Everything Is a Module Principle` was explicitly approved on 2026-07-31 and is recorded as frozen in the architecture decision log. It defined the platform as module-driven and named Patients, Appointments, Queue, Billing, Inventory, Analytics and Follow-up as examples of independent modules. It also required module-level feature flags, license control, permission control, configuration and activation.

**Disposition: RECONCILE, not delete.**

Reason: the later AJM architecture introduced Domains as business ownership boundaries. That does not prove that the earlier Module concept was invalid. It proves that the repository later introduced a second architectural level that was never formally related to Module with enough precision.

Required interpretation from this date forward:

> ADR-006 remains historical evidence of the Module/product-unit decision. Domain is a distinct architectural concept. The relationship between Domain and Module must not be inferred as one-to-one unless a future architecture decision explicitly says so.

## 5. Domain — historical and current meaning

### Historical pattern

Domain was not consistently established as the primary product-structure term in the older architecture. Older documents generally organized the product around modules/capabilities.

### Current pattern

AJM explicitly defines six reconciled domains and requires clear ownership of business logic and authoritative records. A consuming domain integrates with the authoritative owner rather than duplicating it.

### Disposition

**KEEP + FORMALIZE.**

Current meaning:

> Domain = bounded business responsibility and ownership boundary.

Do not use Domain as a synonym for Module, page, Workspace or Feature.

## 6. Module — historical and current meaning

### Historical pattern

Module was the principal product unit in ADR-006 and subscription architecture. A Module could be independently licensed, permission-controlled, configured and activated.

### Current pattern

UX and Team & Access still use Module as a meaningful product/functional unit while AJM uses Domain for ownership. Reports also use Module as a selectable product unit.

### Disposition

**KEEP + CLARIFY.**

Current meaning:

> Module = coherent product/functional unit that may be independently exposed, configured, licensed, permission-controlled or activated.

A Module is not automatically a Domain, Workspace or Feature.

## 7. Feature — historical and current meaning

### Historical pattern

Feature was used for individual functionality and in the specific technical concept `Feature Flag`.

### Current pattern

UX/IA and product documents continue to need Feature for functionality that does not warrant independent module treatment.

### Disposition

**KEEP + CLARIFY.**

Current meaning:

> Feature = a specific user/system functionality; it may exist inside a Module or broader capability and does not automatically become an independently licensed Module.

`Feature Flag` is a separate technical activation mechanism.

## 8. Capability — historical and current meaning

### Historical pattern A: product/system capability

Capability was used for capabilities available to a tenant, subscription add-ons and system functionality.

### Historical pattern B: human ability

AJM/Workforce-related text also used `Skill / Capability` in contexts describing what a person can do or what is relevant to workforce routing.

### Current UX/AJM pattern

Tenant capabilities/permissions are used to determine available user-facing surfaces, while Skill belongs to the human/workforce side.

### Disposition

**KEEP for system/product meaning; REMOVE synonym use with Skill.**

Current meaning:

> Capability = a capability provided by the platform/product or made available in a tenant/user context.

It must not be used as a synonym for a person's Skill.

## 9. Skill — historical and current meaning

Skill consistently appears closest to the human/workforce meaning: an ability/competence relevant to employee eligibility and future routing.

The problem is not the concept; the problem is occasional combined wording such as `Skill / Capability`.

### Disposition

**KEEP + SEPARATE.**

> Skill = human ability or learned competence.

## 10. Qualification — historical and current meaning

Qualification has comparatively little historical architectural usage in the repository. Where it appears, it is naturally associated with formal professional qualification/credential information.

### Disposition

**KEEP + FORMALIZE.**

> Qualification = formal credential, certification, license, degree or recognized professional qualification.

A Qualification may support evidence of a Skill, but the two concepts are not identical.

## 11. Required separations

The following distinctions are now locked for current documentation:

| Pair | Rule | Disposition |
|---|---|---|
| Domain / Module | Different architectural levels | KEEP BOTH |
| Module / Feature | Product unit vs specific functionality | KEEP BOTH |
| Capability / Skill | System/product ability vs human ability | SEPARATE |
| Skill / Qualification | Competence vs formal credential | SEPARATE |
| Capability / Entitlement | What can be provided vs whether it is licensed/eligible | SEPARATE |
| Capability / Permission | What is available vs what action the user is authorized to perform | SEPARATE |
| Module / Workspace | Product unit vs working interface | SEPARATE |
| Feature / Feature Flag | Functionality vs activation/rollout control | SEPARATE |

## 12. Historical-to-current disposition matrix

| Historical usage | Intended meaning found from context | Current term | Action |
|---|---|---|---|
| `Module` as independent business/product unit | Product/functional unit | Module | KEEP + CLARIFY |
| `Module` as navigation grouping | Sometimes product unit, sometimes presentation grouping | Module or Workspace depending context | RECONCILE case-by-case |
| `Feature` as functionality | Specific function | Feature | KEEP |
| `Feature Flag` | Technical activation control | Feature Flag | KEEP; never synonym for Feature |
| `Capability` as tenant/product ability | System/product capability | Capability | KEEP |
| `Capability` as human ability | Human competence | Skill | RENAME where current meaning is human |
| `Skill / Capability` | Mixed human/system concept | Skill + Capability | SPLIT |
| `Qualification` as skill-like term | Formal credential | Qualification | CLARIFY |
| `Domain` used loosely for a UI/product area | Ambiguous | Domain / Module / Workspace based on intended meaning | RECONCILE |

## 13. Documents requiring terminology attention

The following are not declared wrong wholesale. They require targeted review under the glossary when next touched:

1. `ARCHITECTURE_DECISIONS.md` — ADR-006 and any module/capability statements that predate AJM Domains.
2. `docs/AJM-IMPLEMENTATION-PLAN.md` — especially the `Skill / Capability` wording in AJM-1.
3. `docs/AJM-STAGE-INDEX.md` — stage/domain/module terminology must follow the new glossary.
4. `docs/AJM-1-VISIBILITY-VALIDATION-FOLLOWUP.md` — validate capability/visibility language.
5. `docs/AJM-2-IMPLEMENTATION-LOG.md` and AJM-2 financial/resource documentation — validate Module/Domain/Capability usage.
6. `docs/AJM-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md` — validate surface vs product terminology.
7. `docs/AJM-UX-UNIFIED-EXECUTION-PLAN-2026-08-29.md` — validate Domain/Module/Feature/Capability wording.
8. `docs/AJM-UX-UNIFIED-RECONCILIATION-EXECUTIVE-REPORT-2026-08-29.md` — validate final terminology references.
9. `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md` — retain its Workspace/Widget/Capability distinctions; only correct terminology where it conflicts with the glossary.
10. `GLOBAL_UX_IA_IMPLEMENTATION_PLAN_2026-08-28.md` and the Global UX master execution document — validate all structural terminology before further implementation.

## 14. What must NOT be changed

Do not:

- delete ADR-006 merely because Domain is now explicit;
- rename every historical Module occurrence to Domain;
- rename Capability to Skill globally;
- rename Visit to Encounter for standards compliance;
- create a second user-facing CarePlan concept solely because FHIR has that term;
- treat Workspace or Widget as security boundaries;
- treat a database table, route or page as automatically defining a Module or Domain.

## 15. Required implementation consequence

Before resuming AJM execution stages that depend on visibility, access, workforce eligibility or UX presentation, the implementation must use the glossary as the terminology gate.

Specifically:

1. AJM must distinguish **business ownership (Domain)** from **product packaging/functional unit (Module)**.
2. AJM must distinguish **system/product Capability** from **human Skill** and **formal Qualification**.
3. UX must distinguish **Module/Feature/Capability** from **Workspace/Widget**.
4. Subscription/License work must distinguish **Capability/Entitlement/Permission**.
5. PJ remains the patient-centered authority; terminology changes must not alter PJ ownership or clinical behavior.
6. Any future architecture change that needs a different relationship between Domain and Module must be recorded as an explicit architectural decision.

## 16. Closure status

**Terminology investigation:** CLOSED for the six requested primary terms.  
**Terminology baseline:** ESTABLISHED.  
**Historical decisions:** PRESERVED.  
**Current ambiguous usages:** REGISTERED for targeted reconciliation.  
**Global blind rename:** PROHIBITED.  
**Ready to resume AJM/UX work:** YES, subject to using the glossary as the terminology gate and completing targeted wording corrections when the affected documents are next modified.
