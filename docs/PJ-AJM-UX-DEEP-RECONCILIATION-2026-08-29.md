# CORE SYSTEM — Deep PJ ↔ AJM ↔ UX/IA Reconciliation
## 2026-08-29

**Purpose:** Re-check the relationship between Patient Journey (PJ), AJM and Global UX/IA using repository implementation, database state and executable behavior evidence — not documentation alone.

**Current execution posture:** AJM stages are treated as unexecuted for the new execution cycle. Existing stage records are historical evidence and must pass the new gates again.

## 1. Method

The reconciliation used four evidence layers:

1. Current `main` documentation and authoritative UX/AJM/PJ records.
2. Current application implementation: navigation registry, Workspace shell, Patient Flow routes, patient context surfaces and supporting audit tools.
3. Live Supabase state for Patient Flow permissions, entitlement mappings and related authorization evidence.
4. Historical implementation/closure records to identify claims that are stronger than the evidence now required by the new execution policy.

The governing UX authority states that Patient Flow is a first-class Sidebar system, Queue remains part of Patient Flow, Workspace is not a security boundary, and Patient Context may expose authorized related information without moving domain ownership. The PJ reconciliation addendum repeats these rules. The AJM master states that administrative domains support PJ without replacing it, and Journey Coordination must not become a second Patient Journey, Queue, Agenda, Clinical or Follow-up engine.

## 2. Confirmed alignment

### 2.1 Patient Flow ownership

The current UX authority, PJ addendum and implementation all agree that Patient Flow is one system with three views:

- Operations
- Clinical
- Administrative

The current Patient Flow page derives available views from effective permissions. The database contains the three explicit Patient Flow permissions and currently has zero automatic role grants for them. This matches the architectural decision that role names or workspace membership do not automatically grant Patient Flow.

### 2.2 Queue ownership

The Stage 6 record states that `clinic_visit_sessions` is the canonical movement state and the existing Queue transition engine remains authoritative. No second Queue engine is introduced. This is consistent with PJ and with the AJM rule that later coordination work must reuse existing movement/clinical handoff behavior rather than duplicate it.

### 2.3 Patient Context

The Stage 7 implementation record states that Patient Detail remains the canonical patient context surface and that Agenda, Treatment Plans, Invoices, Follow-up and Patient Portal are reused rather than duplicated. This matches the UX authority and the PJ addendum: contextual navigation reduces navigation cost without transferring domain ownership.

### 2.4 Financial surface

AJM-2 defines Financial & Resources as one coherent tenant-facing product surface while explicitly preserving independent backend ownership. The current navigation registry implements that hierarchy. This is aligned with the UX authority's rule that parent/child presentation does not imply backend ownership collapse.

### 2.5 Authorization boundary

AJM-1, the UX authority and Patient Flow implementation consistently state:

`Role ≠ Permission`

`Workspace ≠ Security Boundary`

`Visibility ≠ Authorization`

The current Patient Flow routes perform server-side effective-permission checks, while the Sidebar performs permission/entitlement-aware filtering. These are complementary layers rather than a second authorization engine.

## 3. Confirmed implementation/documentation conflicts

### Finding F1 — Patient Flow surface classification was stale in the UX implementation catalog

**Evidence:** `src/core/workspace/domainSurfaceCatalog.ts` previously classified `Patient Flow` as `contextual`, while the authoritative UX document and PJ addendum require Patient Flow to be a first-class Sidebar system.

**Action taken:** The catalog entry was corrected to `surface: "sidebar"` and its comment was clarified so the catalog does not imply that its subject labels are AJM Domain ownership definitions.

**Disposition:** FIXED in this reconciliation branch.

### Finding F2 — UX surface catalog used `domain` terminology too broadly

The catalog contains entries such as Patients, Agenda, Treatment Plans, Follow-up and Patient Flow under a variable named `domain`. Under the new terminology governance, Domain means business ownership/boundary and must not be confused with product/functional surface.

**Action:** The code comment now explicitly states that the catalog records presentation placement and does not define AJM Domain ownership. A future cleanup may rename the type/file if repository usage permits, but no broad rename is performed merely for cosmetics.

**Disposition:** Semantically corrected; structural rename remains a controlled cleanup item.

### Finding F3 — Journey Coordination blueprint still contains pre-governance Skill/Capability wording

The blueprint currently says `Skill / Capability` and defines `Skill = capability/qualification`. This conflicts with the now-authoritative terminology governance:

- Capability = platform/business capability.
- Skill = human learned competence.
- Qualification = formal credential/qualification.

The AJM master also contains the older shorthand `Skill = capability or qualification`.

**Disposition:** CONFIRMED documentation conflict. It must be corrected before the affected AJM stage is accepted. The historical text is retained as evidence; it must not be treated as current terminology.

### Finding F4 — Existing closure records are not sufficient under the new execution contract

Several UX/PJ/AJM records use `CLOSED` or `PRODUCTION READY`. For example, the Stage 7 record reports successful build/deployment and explicitly notes that an authenticated browser click-through was not available. Under the new execution policy, these records are historical evidence, not automatic current closure. Each affected AJM stage must pass the new authenticated/runtime/evidence gate again.

**Disposition:** No historical record is deleted or falsified. The new AJM execution cycle treats all stages as unexecuted and revalidates them.

## 4. Important non-conflicts

### N1 — Patient Flow vs Journey Coordination

There is no requirement to move Patient Flow into Journey Coordination. Patient Flow owns patient movement/queue state; Journey Coordination owns general work items, tasks, requests, general handoffs and next actions. Coordination may consume Patient Flow events and create work without duplicating patient-flow states.

### N2 — Follow-up vs Coordination

Follow-up remains the patient-continuity capability. Coordination may create operational work from follow-up events but must not recreate follow-up clinical/business logic.

### N3 — Agenda vs Coordination

Agenda remains appointment authority. Coordination may create preparation or post-appointment work; it must not become another scheduling engine.

### N4 — Patient Context vs PJ ownership

Contextual links to appointments, treatment, financial information, follow-up, files, communication and portal context do not move ownership. They are navigation/information integration surfaces.

### N5 — Financial & Resources hierarchy vs backend domain ownership

The UX hierarchy is intentionally a product surface. It does not require invoices, inventory, insurance or purchasing to share backend ownership.

## 5. Live Supabase evidence checked

The production Supabase project was queried for the Patient Flow authorization vocabulary.

Confirmed:

- `patient_flow:operations` exists.
- `patient_flow:clinical` exists.
- `patient_flow:administrative` exists.
- All three currently have zero `role_permissions` grants.
- All three currently have zero `clinic_user_permission_overrides` rows.
- No `patient_flow.*` capability mapping exists in `entitlement_capabilities`.

This means the current implementation is correctly centered on explicit permission assignment rather than automatic entitlement mapping for Patient Flow. The parent navigation item's capability metadata must therefore not be interpreted as a currently active entitlement gate for Patient Flow.

## 6. Workflow conclusion

The actual target relationship is:

```text
PJ = patient-centered journey authority

AJM Domains
   ↓ provide administrative/operational capabilities

Existing clinical / Agenda / Treatment / Follow-up / Portal systems
   ↓ remain authoritative for their own records

UX/IA
   ↓ presents authorized capabilities and contextual relationships

Patient Flow
   ↓ exposes real persisted patient movement through one system

Journey Coordination
   ↓ coordinates general work generated by domain events

Insights
   ↓ interprets structured outcomes
```

UX must never become the owner of business state merely because it exposes the state.
AJM must never become the owner of PJ merely because AJM work is triggered by PJ events.
Coordination must never duplicate a source-domain lifecycle merely because it needs to track operational work around it.

## 7. Required reconciliation gate for every AJM stage

Before implementation:

`AJM contract → PJ impact → UX surface → current code → Supabase → historical branches → ownership → authorization → workflow`

After implementation:

`static validation → database validation → authorization validation → runtime workflow → UX/i18n/mobile → production build → deployment → production verification → documentation closure`

No stage is accepted from documentation alone.

## 8. Current blocking items before full AJM execution

1. Correct the confirmed Skill/Capability wording in authoritative AJM/Journey Coordination documents.
2. Add PJ impact mapping to every AJM stage execution record.
3. Treat prior `CLOSED` stage records as historical evidence under the new execution cycle.
4. Re-run Patient Flow/Patient Context/Sidebar audits as regression gates whenever an AJM stage changes their shared surfaces.
5. Ensure every AJM capability maps to one canonical UX surface, one authorization source, one data owner and one workflow role.

## 9. Decision status

No new business architecture decision was invented by this reconciliation.

The findings are implementation/documentation corrections and execution-gate requirements derived from existing authoritative decisions plus current repository/Supabase evidence.

**Conclusion:** PJ, AJM and UX are broadly reconcilable, but they are not yet safe to treat as a fully verified integrated execution system. The main remaining risk is not the high-level architecture; it is inconsistent implementation/documentation semantics and insufficient re-validation of previously closed stages under a single runtime-first closure protocol.
