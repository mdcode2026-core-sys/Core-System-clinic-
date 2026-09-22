# CORE SYSTEM — CSAPI Gate 03 — Patient & Identity
## Architectural Decision / Requirements Contract

Date: 2026-09-22
Gate: CSAPI Gate 03 — Patient & Identity
Status: DECISION CONTRACT — PRECHECK / OWNER APPROVAL REQUIRED
Previous Gate: Gate 02 — Patient Journey — CLOSED / VERIFIED / PRODUCTION VERIFIED
Execution mode: Decision-first; no implementation authorized by this document alone

---

## 1. Purpose

Gate 03 establishes the authoritative architectural definition and requirements for Patient & Identity before any implementation change is approved.

The gate starts from a deliberate assumption:

> For design purposes, assume the required Patient & Identity capability does not yet exist, then derive the correct target from healthcare standards, active systems, research, CORE SYSTEM historical architecture, current implementation, database reality, and runtime evidence.

Existing CORE SYSTEM structures are evidence to inspect and reuse only after they are reconciled against this contract.

This contract is not permission to rebuild Patient, Patient History, Portal, Insurance, or any other domain.

---

## 2. Owner-level objective

CORE SYSTEM must be able to answer, reliably and securely:

> Who is this patient, which clinic relationship is being used, how do we know this is the correct person, and how do we ensure every related record belongs to that person without cross-tenant leakage or duplicate identity?

The target is not a better Patients screen.

The target is trustworthy identity and relationship architecture supporting all downstream patient-related domains.

---

## 3. Governing principles

### 3.1 Patient Identity is foundational

Patient identity is a cross-domain foundation. A wrong identity can attach clinical, operational, financial, insurance, communication, or follow-up data to the wrong person.

### 3.2 Identity is not one field

A patient must not be identified solely by:

- name;
- phone;
- email;
- clinic file number;
- portal account;
- any other single mutable attribute.

Identity must be represented by a canonical patient identity plus controlled identifiers and matching evidence.

### 3.3 Person, Patient, Clinic Relationship and Portal Account are distinct concepts

The architecture must not collapse:

- real person;
- patient identity;
- clinic-specific patient relationship;
- staff identity;
- portal authentication identity.

A portal account is not a staff account and is not itself the canonical patient record.

### 3.4 Tenant isolation is mandatory

A patient relationship with one clinic must not grant visibility into another clinic's data.

If a future architecture supports a person having relationships with multiple clinics, each clinic relationship remains independently authorized and tenant-scoped.

### 3.5 Domain ownership remains bounded

Patient & Identity identifies the patient and governs identity relationships.

It must not become the owner of:

- Appointment lifecycle;
- Visit lifecycle;
- Treatment Plan lifecycle;
- Financial truth;
- Insurance claim lifecycle;
- Workforce/resource truth;
- Communications lifecycle;
- Follow-up lifecycle.

Patient & Identity provides canonical references; owning domains retain their source of truth.

### 3.6 Search is part of identity safety

Patient search is not only a UX feature. Search-before-create and matching are part of preventing duplicate identity and incorrect record creation.

### 3.7 No silent merge

A potential duplicate must not be silently merged based on weak evidence.

Any merge capability must have explicit authority, traceability, validation, and recovery/governance rules.

### 3.8 No second engine

Gate 03 must not introduce:

- a second Patient engine;
- a second Patient History engine;
- a second Portal identity system;
- a second Insurance engine;
- a second workflow/state engine.

Inspect → Reuse → Extend → Create.

---

## 4. Target conceptual model

The target architecture is:

    Real Person
        |
        v
    Patient Identity
        |
        +---- Identifiers
        |
        +---- Clinic Relationship
        |         |
        |         +---- Clinic-scoped Patient Record
        |                   |
        |                   +---- Visits / Sessions
        |                   +---- Treatment Plans
        |                   +---- Medical Records
        |                   +---- Financial Records
        |                   +---- Insurance / Coverage
        |                   +---- Follow-up / Communications references
        |
        +---- Optional Portal Identity
                  |
                  +---- Authentication / Portal Authorization

This is a conceptual boundary model, not an instruction to create every node as a new database table.

---

# 5. Canonical definitions

## 5.1 Person

A real human being.

The architecture must decide whether CORE SYSTEM needs an explicit global Person entity now or whether this remains a future extension boundary.

This decision must not be made implicitly by implementation.

## 5.2 Patient Identity

The canonical identity representation used to recognize the patient within CORE SYSTEM.

It must have a stable internal identity and must not depend on a mutable attribute such as phone number or name.

## 5.3 Identifier

A value used to identify or search for a patient within a defined scope.

Examples may include:

- internal patient ID;
- clinic file number;
- external identifier;
- future national/organizational identifier where legally and operationally appropriate.

Each identifier must have explicit rules for:

- scope;
- uniqueness;
- mutability;
- searchability;
- authority;
- lifecycle.

## 5.4 Clinic Relationship

The explicit relationship between a patient identity and a tenant/clinic.

The relationship determines:

- clinic-scoped access;
- clinic-specific identifiers;
- clinic-specific operational context;
- authorization boundary.

## 5.5 Portal Identity

An authentication/digital-access identity used by a patient to access a future or enabled Patient Portal.

Portal Identity must remain distinct from:

- clinic staff identity;
- clinic user role;
- patient canonical identity.

## 5.6 Patient History

The longitudinal presentation of patient-related clinical/operational continuity.

It must not automatically be treated as a single authoritative table.

The gate must establish which underlying domain records are canonical and which records are summaries/projections/read models.

## 5.7 Insurance / Coverage

A financial/coverage relationship associated with the patient and/or applicable encounter according to the final insurance model.

Patient identity must not be overloaded with a single static insurance field.

---

# 6. Seven mandatory requirements

## R1 — Canonical Patient Identity

The system must have one authoritative patient identity for the patient within the defined identity scope.

Requirements:

- stable internal identity;
- no identity creation based only on one mutable field;
- explicit identifier model;
- deterministic references from downstream domains;
- no competing patient identity sources.

Acceptance question:

> Can we identify the canonical patient record and prove that downstream records reference it?

---

## R2 — Patient ↔ Clinic Relationship

The system must explicitly represent the relationship between a patient and a clinic/tenant.

Requirements:

- tenant-scoped authorization;
- no cross-tenant leakage;
- clinic-specific relationship state where required;
- clinic-specific identifiers where required;
- future multi-clinic identity must not require sharing clinical data between tenants.

Acceptance question:

> Can the same real person be represented safely across multiple clinics without exposing one clinic's data to another?

---

## R3 — Duplicate Detection and Matching

Patient creation must be preceded by an appropriate search/matching process.

The target lifecycle is:

    Search
      ↓
    Candidate Matches
      ↓
    Match Assessment
      ↓
    ┌───────────────┬───────────────┐
    ↓               ↓               ↓
  Existing       Possible         No match
   patient        duplicate
    ↓               ↓               ↓
  Reuse       Review / decision    Create

Requirements:

- multi-attribute matching;
- no single-field duplicate rule as the universal authority;
- clear match confidence/result classes;
- human review for ambiguous cases where required;
- explicit merge governance;
- auditability.

Acceptance question:

> Can the system reduce duplicate creation without incorrectly merging two different people?

---

## R4 — Patient Search

Patient search must support reliable identification before operational action.

Search must be:

- tenant-safe;
- permission-aware;
- performant;
- based on appropriate identifiers and demographic attributes;
- explicit about ambiguous results;
- consistent across important patient-entry surfaces.

Global Search may be a presentation surface but must not automatically become the domain authority for identity matching.

Acceptance question:

> Can staff reliably find the correct patient before creating or acting on patient data?

---

## R5 — Longitudinal Patient History

The system must preserve truthful longitudinal continuity.

Requirements:

- canonical source-of-truth remains in owning domains;
- patient history may aggregate/derive information;
- summaries must not silently replace canonical records;
- visits/sessions/plans/medical/financial/follow-up references must resolve to the correct patient;
- history must distinguish actual historical records from analytics summaries.

Acceptance question:

> Can we reconstruct the patient's real longitudinal record from canonical domain sources without depending on a possibly stale summary table?

---

## R6 — Insurance / Coverage

Insurance must be modeled separately from basic patient identity.

Requirements:

- distinguish patient from coverage;
- distinguish coverage from payer/plan where applicable;
- support identifiers and validity periods where required;
- preserve patient responsibility versus insurer responsibility;
- preserve claim/financial ownership in the Financial domain;
- maintain tenant integrity.

Acceptance question:

> Can a patient have the correct coverage relationship without turning insurance into a static Patient attribute?

---

## R7 — Portal Relationship

Portal access must be optional and separately authorized.

Requirements:

- Patient Identity remains authoritative;
- Portal authentication remains separate;
- staff authentication remains separate;
- Portal is not a prerequisite for internal patient care;
- Portal entitlement/access is governed independently;
- linking a portal identity does not grant staff permissions.

Acceptance question:

> Can a patient exist and receive clinic care without a portal account, while a portal account can securely represent access to that patient's permitted information?

---

# 7. Additional mandatory requirements

## R8 — Identifier Governance

Every identifier type must define:

- owner;
- scope;
- uniqueness;
- lifecycle;
- mutability;
- verification status;
- search behavior.

## R9 — Demographic Change

Changing a patient attribute must update the patient identity rather than create a new patient.

Identity continuity must survive legitimate demographic changes.

## R10 — Merge Governance

If duplicate patient records are supported for historical reasons, merge must define:

- who may initiate;
- who may approve;
- evidence required;
- records moved/relinked;
- identifiers preserved;
- audit trail;
- downstream domain effects;
- portal effects;
- financial/insurance effects;
- rollback or recovery policy.

No implementation of merge is authorized until this is decided.

## R11 — Match Confidence

Matching must distinguish at least:

- confirmed/exact;
- probable/possible;
- no match;

or an equivalent documented classification.

The exact classification vocabulary is a design decision to be finalized before implementation.

## R12 — Authorization and Tenant Safety

Every patient read/write/search/match operation must preserve:

- authentication;
- tenant context;
- authorization;
- row-level/data-level isolation where applicable;
- auditability for sensitive identity operations.

## R13 — Referential Integrity

Downstream records must not silently point to:

- a non-existent patient;
- a patient in another tenant;
- a superseded identity without a defined continuity rule.

## R14 — Identity Auditability

Sensitive identity events must be traceable, including as applicable:

- patient creation;
- identifier addition/change;
- relationship creation/change;
- duplicate review;
- merge;
- portal binding;
- identity correction.

---

# 8. Canonical ownership requirements

| Capability | Canonical owner |
|---|---|
| Patient identity | Patient / Identity domain |
| Patient ↔ Clinic relationship | Patient / Identity domain |
| Patient identifiers | Patient / Identity domain |
| Patient matching | Patient / Identity domain |
| Appointment lifecycle | Agenda |
| In-clinic Visit lifecycle | Patient Flow |
| Treatment Plan | Clinical / Patient Journey |
| Medical record | Clinical / Medical domain |
| Financial truth | Financial |
| Coverage / claim financial lifecycle | Financial / Insurance boundary as defined |
| Follow-up lifecycle | Follow-up |
| Communications | Communications |
| Portal authentication/access | Portal / Access boundary |
| Staff authorization | Team & Access / existing permission architecture |
| Operational work | Coordination |

No domain may become the hidden owner of another domain's truth merely to simplify implementation.

---

# 9. History model requirement

Gate 03 must explicitly classify each patient-history representation as one of:

1. Canonical source of truth;
2. Derived projection/read model;
3. Analytics summary;
4. Legacy/historical artifact;
5. Future capability.

The existence of a table or type named `patient_history` is not sufficient evidence that it is the canonical history.

The final decision must be based on actual repository, database and runtime evidence.

---

# 10. Duplicate / matching target behavior

The intended product behavior is:

### New patient

1. Staff starts patient registration.
2. System searches existing patient candidates.
3. System presents relevant candidates.
4. Staff selects existing patient when appropriate.
5. If no appropriate patient exists, registration continues.
6. If ambiguity remains, the system requires the appropriate review path.
7. New patient is created only after the matching step is satisfied.

### Existing duplicate discovered later

1. Duplicate candidates are identified.
2. Records are reviewed.
3. Authorized merge decision is made.
4. Downstream relationships are reconciled according to domain-specific rules.
5. Audit record is preserved.
6. Patient identity continuity remains traceable.

No silent destructive merge is acceptable.

---

# 11. Non-goals / explicit boundaries

Gate 03 does not authorize:

- rebuilding Patient Flow;
- rebuilding Patient Journey;
- rebuilding Agenda;
- rebuilding Follow-up;
- rebuilding Communications;
- rebuilding Portal;
- rebuilding Financial/Insurance;
- introducing a universal workflow engine;
- creating a second history engine;
- migrating production data without an approved implementation decision;
- changing production Supabase during precheck;
- Vercel deployment during precheck;
- unrelated UX cleanup;
- unrelated permission changes;
- speculative future multi-clinic functionality;
- national-ID integration without a separate legal/product decision.

---

# 12. Required precheck and evidence

Before approval of implementation, the following must be proven against current CORE SYSTEM reality.

## Repository

Inspect:

- patient domain;
- identity domain;
- patient search;
- patient creation;
- patient update;
- duplicate logic;
- merge logic, if any;
- patient history;
- visit/session references;
- treatment plan references;
- medical files;
- financial references;
- insurance;
- portal binding;
- RLS/authorization;
- tests;
- migrations;
- functions/triggers;
- historical architecture records.

## Database

Verify:

- actual tables;
- actual columns;
- primary/foreign keys;
- unique constraints;
- indexes;
- RLS;
- functions;
- triggers;
- live row relationships;
- tenant isolation;
- orphan records;
- duplicate candidates;
- history/source-of-truth behavior.

## Runtime

Verify:

- patient search;
- new patient creation;
- existing patient reuse;
- duplicate candidate behavior;
- patient update;
- patient history;
- insurance context;
- portal relationship where enabled;
- authorization;
- tenant isolation.

No runtime observation is accepted solely from a static UI screenshot.

---

# 13. Required Gate 03 comparison matrix

The final pre-implementation report must contain:

| Requirement | External best practice | CORE historical architecture | CORE current code | Live DB | Runtime | Classification | Decision |
|---|---|---|---|---|---|---|---|
| Canonical identity | TBD/evidence | TBD | TBD | TBD | TBD | TBD | TBD |
| Clinic relationship | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Duplicate matching | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Search | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| History | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Insurance | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Portal | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

The classification vocabulary must be:

- Working;
- Partial;
- Missing;
- Contradictory;
- Duplicated;
- Historical;
- Intentionally different;
- Future;
- Out of scope.

---

# 14. Architectural decisions required from the Product Owner

The following decisions require explicit approval before implementation if the precheck confirms they are genuine choices:

### D1 — Identity scope
Is Patient Identity clinic-scoped only, or is a reusable cross-clinic person identity required now?

### D2 — Explicit Person entity
Should CORE SYSTEM introduce an explicit Person abstraction now, or preserve the current patient identity model with a future extension boundary?

### D3 — Matching authority
What exact domain/service owns patient matching and duplicate detection?

### D4 — Matching confidence
What confidence/result model is accepted for exact, probable, possible and no-match cases?

### D5 — Merge governance
Who can merge, what evidence is required, and what is the audit/recovery policy?

### D6 — History authority
Which records are canonical and what is the role of any patient-history projection/summary?

### D7 — Insurance boundary
What is the exact distinction between patient insurance profile, coverage, payer, responsibility and claim?

### D8 — Portal binding
What evidence/verification is required before a Portal Identity is bound to a Patient Identity?

### D9 — Identifier policy
Which identifiers are authoritative, searchable, unique, mutable, and tenant-scoped?

### D10 — Cross-clinic identity
If the same real person appears in multiple clinics, what identity sharing is permitted without sharing clinical data?

These decisions are not assumed approved by this contract.

---

# 15. Definition of Ready for Implementation

Gate 03 may move from DECISION READY to APPROVED only when:

1. External research has been reconciled with CORE architecture.
2. The seven mandatory questions have explicit answers.
3. Additional requirements R8–R14 have been evaluated.
4. Canonical ownership is explicit.
5. Patient history source-of-truth is explicit.
6. Duplicate/matching behavior is explicit.
7. Merge governance is explicit or explicitly deferred.
8. Identifier strategy is explicit.
9. Portal relationship is explicit.
10. Insurance boundary is explicit.
11. Tenant isolation requirements are verified.
12. Current code/database/runtime gaps are mapped.
13. Scope and non-scope are approved.
14. No implementation begins merely because a gap exists.

---

# 16. Definition of Done for Gate 03

Gate 03 is CLOSED only when the approved decisions have been implemented where required and verified through the appropriate evidence.

Closure requires:

- repository/build verification;
- automated tests;
- database integrity verification;
- RLS/authorization verification;
- tenant-isolation verification;
- duplicate/matching verification;
- patient-search verification;
- longitudinal-history verification;
- insurance relationship verification;
- portal-boundary verification where applicable;
- runtime verification;
- regression verification;
- production verification where the approved scope changes production;
- documentation reconciliation;
- clean branch/PR state;
- updated CSAPI handoff/master state;
- explicit closure record.

Documentation alone is never closure evidence.

---

# 17. Change-control rule

Any finding discovered during Gate 03 that belongs primarily to another domain must be classified and handed to its owning gate rather than absorbed into Gate 03.

A finding may enter Gate 03 implementation only when:

1. it is required to satisfy the approved Patient & Identity contract; and
2. its ownership is explicitly accepted as part of Gate 03.

No scope expansion by convenience.

---

# 18. Current status

Gate 03 is currently:

**UNDER REVIEW / ARCHITECTURAL CONTRACT DRAFT**

This document establishes the target requirements and decision questions.

It does not claim that CORE SYSTEM currently satisfies them.

The next step is a full CORE SYSTEM reconciliation against this contract:

**Historical Architecture → Current Code → Live Database → Runtime → Gap Classification → Product Decision Report**

Only after that reconciliation may the gate become:

**DECISION READY**

and only after Product Owner approval may implementation begin.

---

## Final owner statement

The goal of Gate 03 is simple:

> **CORE SYSTEM must know who the patient is, know which clinic relationship is being used, prevent unsafe duplicate identities, find the correct patient reliably, preserve the patient's real longitudinal record, keep insurance relationships correct, and keep Portal identity separate from staff identity — all without crossing tenant boundaries or creating competing sources of truth.**
