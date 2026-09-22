# CORE SYSTEM — CSAPI Gate 03 — Patient & Identity
## Revised Implementation Design / Design Review Resolution
Date: 2026-09-22
Gate: CSAPI Gate 03 — Patient & Identity
Status: IMPLEMENTATION DESIGN COMPLETE — AWAITING EXPLICIT EXECUTION APPROVAL
Authority: Approved Gate 03 Architectural Decision / Requirements Contract + Design Review Resolution
Scope: Physical implementation design only. No application code, migration, production mutation, or deployment is authorized by this document.

---

## 1. Design completion statement

The Gate 03 Implementation Design Review has been completed.

The first design draft was found directionally correct but not execution-ready. DR-01 through DR-12 have now been resolved in this revised design.

This document is the execution-design authority for Gate 03. The earlier draft remains historical evidence of the review process and is superseded for implementation planning by this document.

Execution remains a separate Product Owner approval step.

---

## 2. Canonical target architecture

The implementation uses the following conceptual model:

Real Person
→ System Patient Identity
→ Clinic Relationship
→ Clinic Patient Record
→ domain-owned records

Separately:

System Patient Identity
→ non-auth Portal Identity / Binding
→ authentication
→ entitlement / capability
→ authorized Portal access

The clinic owns its clinic patient record. The system maintains identity/linkage needed for continuity and recognition; it does not become the owner of another clinic's clinical data.

No explicit `persons` table is required in Gate 03. The existing `patient_identities.id` will be transformed into the stable system identity key because current live row count is zero and existing downstream references can continue to point to the same stable UUID. A future Person entity remains an extension boundary, not a parallel identity engine.

---

## 3. Physical reuse decision

### 3.1 Reuse `patient_identities`

The existing table name and primary key are reused and transformed from Portal-auth identity into canonical System Patient Identity.

Reason:
- live `patient_identities` row count is currently 0;
- existing relationships and Communications references already use `patient_identities.id`;
- replacing the table would create unnecessary identity-reference migration and a second physical identity boundary;
- the current Portal coupling is removable by migration.

### 3.2 Remove Portal-auth semantics

The canonical table must no longer use `auth_user_id` as its identity relationship.

Portal authentication moves to a separate `patient_portal_identities` table.

Existing Portal/Communications references that mean canonical patient identity continue to reference `patient_identities.id`. References that mean authentication are moved to `patient_portal_identities`.

### 3.3 No second identity table

Do not create a competing canonical table such as `system_patients`, `persons`, or `patient_master` during Gate 03.

---

## 4. Clinic-owned demographic truth

`clinic_patients` remains the authoritative clinic-scoped patient record.

Required registration representation:

- `first_name` — mandatory;
- explicit `father_name` — mandatory;
- explicit `family_name` — mandatory;
- `mother_name` — optional but important;
- `national_id` / card identifier — optional but important;
- `phone_primary` — mandatory and country-format validated;
- `email` — optional but important;
- `gender` — mandatory;
- `date_of_birth` OR age-at-registration evidence — mandatory.

Current `last_name` must not silently change meaning. Before migration, every consumer of `last_name`, `first_name_ar`, and `last_name_ar` is inventoried. If explicit family-name storage is added, compatibility with existing `last_name` consumers is preserved until those consumers are intentionally migrated.

System identity stores only the minimum normalized evidence needed for cross-clinic recognition and matching. It is not a second editable clinic profile.

Every copied identity attribute has provenance/verification metadata.

---

## 5. Age and DOB model

DOB is canonical when known.

If DOB is unavailable but age is supplied:
- store `age_at_registration`;
- store `age_reference_date`;
- mark the evidence as provisional;
- never store or compare a continuously changing current age as a stable identity attribute.

When DOB becomes available, the provisional age evidence is retained as audit/provenance and matching thereafter prefers exact DOB.

Matching distinguishes:
- exact DOB;
- provisional age evidence;
- missing DOB.

Age-only evidence can contribute to a match but cannot by itself produce `EXACT_MATCH`.

---

## 6. Identifier registry

Create `patient_identity_identifiers` only for governed identifiers that do not have an authoritative existing representation.

Fields:

- `id`;
- `patient_identity_id`;
- `identifier_type`;
- `normalized_value`;
- `display_value`;
- `scope_type` (system / clinic / external);
- `tenant_id` where applicable;
- `verification_status`;
- `is_current`;
- `valid_from`;
- `valid_to`;
- `source`;
- timestamps.

The immutable System Patient ID remains the primary identity key.

Clinic file number remains clinic-scoped.

National ID/card is optional and important; absence never blocks registration.

Identifier equality is evidence according to identifier semantics, not a universal duplicate rule.

---

## 7. Clinic relationship integrity

Reuse `patient_clinic_relationships`.

Canonical relationship:

`patient_identity_id ↔ clinic_patient_id ↔ tenant_id`

Required database invariant:

`(tenant_id, clinic_patient_id) → clinic_patients(tenant_id, id)`

The current `clinic_patients(tenant_id,id)` unique constraint already exists, so it can support the composite foreign key.

The relationship must enforce:
- same-tenant linkage;
- one active relationship for a System Identity + Clinic Patient;
- no cross-tenant access through the relationship;
- independent relationship lifecycle;
- Portal access is not implied by relationship existence.

The existing `UNIQUE(patient_identity_id, tenant_id)` is retained unless implementation evidence demonstrates that a legitimate product case requires multiple clinic records for one identity within the same tenant. The approved baseline does not require duplicate clinic records for the same identity in one tenant.

---

## 8. Portal identity separation and automatic background binding

Create `patient_portal_identities` as the authentication boundary.

Target fields:
- `id`;
- `patient_identity_id`;
- `auth_user_id` unique and nullable until claimed;
- activation/verification status;
- verified timestamp;
- last authenticated timestamp;
- timestamps.

Critical behavior:

When a patient identity is first created or first linked to a clinic patient, the system creates the non-auth Portal Identity/binding automatically in the same transaction or an idempotent transactional outbox-equivalent flow.

This binding exists even when the clinic has no Portal subscription.

Binding existence:
- does not create an Auth user;
- does not grant Portal access;
- does not expose history;
- does not bypass subscription/entitlement.

Portal subscription controls access, not identity creation.

---

## 9. Registration pipeline

Every Patient creation entry point uses one authority:

Patient UI / API / Quick Registration / Kiosk
→ Registration Validation
→ Identity Candidate Generation
→ Evidence Evaluation
→ EXACT_MATCH / REVIEW_REQUIRED / NO_MATCH
→ Clinic Relationship Resolution
→ Clinic Patient Record creation or reuse
→ Portal binding ensure
→ audit

No UI-specific duplicate logic is allowed.

No approved creation path may insert directly into `clinic_patients` without passing through the canonical Patient/Identity service.

---

## 10. Registration validity contract

Required validation is separate from identity matching.

A registration is invalid before matching when:
- first name is absent;
- father name is absent;
- family name is absent;
- phone is absent or fails configured country-number validation;
- sex is absent;
- neither DOB nor valid age-at-registration is present;
- supplied DOB/age is internally invalid.

Optional absence is accepted for:
- mother name;
- national ID/card;
- email.

Required fields are not automatically unique identifiers.

---

## 11. Deterministic matching policy v1

The first implementation must use a versioned deterministic policy named `patient-match-v1`.

Evidence is normalized before comparison.

### 11.1 Evidence weights

Maximum contribution by evidence class:

- verified national ID/card exact: 30
- exact DOB: 20
- exact father name: 12
- exact family name: 12
- exact first name: 8
- exact mother name: 5
- exact sex: 5
- exact normalized phone: 5
- exact normalized email: 3

Maximum full-evidence score: 100.

When DOB is unavailable, age-at-registration evidence contributes at most 8 points:
- exact age agreement at the same reference date: 8;
- one-year difference attributable to reference-date difference: 4;
- greater difference: 0.

Age evidence cannot be combined with DOB points for the same candidate.

### 11.2 Normalization

Name comparison uses the approved normalization layer for:
- Unicode normalization;
- whitespace/punctuation normalization;
- Arabic/Latin representation handling where supported;
- case normalization for case-insensitive scripts;
- controlled transliteration variants only where explicitly implemented.

Phone comparison uses country-aware normalization.

Email comparison uses normalized case/format representation.

National ID/card comparison uses identifier-type-specific normalization.

### 11.3 Strong conflicts

A strong contradiction never produces `EXACT_MATCH`.

Examples of strong conflict:
- verified national ID mismatch;
- exact DOB mismatch when both values are verified;
- explicit sex conflict where the field is verified and applicable.

A strong conflict moves the candidate to `REVIEW_REQUIRED` when enough other evidence exists, otherwise it contributes to `NO_MATCH`.

### 11.4 Result thresholds

The score is interpreted as:

- `EXACT_MATCH`: score >= 80, at least 3 independent evidence classes, and no strong conflict.
- `REVIEW_REQUIRED`: score 55–79, or any meaningful candidate with a strong conflict, or an otherwise incomplete high-value evidence combination.
- `NO_MATCH`: score < 55 and no review-triggering conflict/candidate condition.

No single field can reach `EXACT_MATCH`.

The policy version, weights, normalization rules and thresholds are persisted/versioned and included in audit metadata for every matching decision.

These values are implementation parameters proposed by this design, not a new product/business rule. Any change after execution begins requires controlled matching-policy change, test updates and explicit documentation.

---

## 12. Matching result behavior

### EXACT_MATCH
Reuse the existing System Patient Identity.

Within the current clinic:
- reuse the existing clinic relationship when present;
- otherwise create the clinic relationship and clinic-scoped patient record as required.

Never silently create a second identity.

### REVIEW_REQUIRED
Stop automatic creation.

Authorized staff review the candidate evidence and explicitly decide whether the registration is:
- the same identity;
- a distinct identity;
- insufficiently resolved and requires correction.

The decision is audited.

### NO_MATCH
Create:
- new System Patient Identity;
- clinic relationship;
- clinic patient record;
- non-auth Portal binding.

Creation is transactional/idempotent.

Registration never performs an automatic merge.

---

## 13. Contact-field uniqueness

The current `UNIQUE(tenant_id, phone_primary)` constraint is not the final identity authority because phone equality is evidence, not proof.

Implementation must:
- keep mandatory phone validation/normalization;
- detect phone overlap through matching;
- surface overlap as evidence/review;
- replace the blocking uniqueness constraint only after all consumers and historical assumptions are inspected;
- preserve any independently justified uniqueness constraints.

This does NOT establish a product rule that phone numbers are universally non-unique. It establishes that a contact-field overlap cannot by itself decide identity.

Email follows the same identity principle.

---

## 14. Search authority

Patient Module search is the authoritative staff search surface.

It must support:
- System Patient ID;
- clinic file number;
- first/father/family/mother names;
- Arabic equivalents where stored;
- phone;
- email;
- national ID/card where authorized;
- DOB/age;
- sex.

Search results must distinguish exact identifier hits from likely and ambiguous candidates.

Global Search remains a navigation/presentation surface and must call the Patient/Identity authority for matching/creation semantics.

Cross-clinic recognition may occur internally, but the current clinic receives only the minimum information required for duplicate review.

---

## 15. Cross-clinic recognition boundary

CORE SYSTEM may recognize that two clinic records represent the same System Patient Identity.

That recognition never grants:
- cross-clinic clinical history;
- appointments;
- financial records;
- communications;
- treatment plans;
- internal clinic identifiers;
- another clinic's Portal data.

The current clinic receives its own clinic relationship and clinic-scoped record.

---

## 16. Portal authentication and Communications migration

Known live consumers of `patient_identities` include:
- Portal activation/claim;
- Portal patient file;
- Portal patient messaging;
- Communications attachment authorization;
- Communications patient sender identity;
- patient-clinic relationship.

Migration classification:
- canonical patient references remain on `patient_identities.id`;
- authentication lookup by `auth_user_id` moves to `patient_portal_identities`;
- Communications sender/participant references remain canonical identity references where they represent the patient, but their self-authentication lookup resolves through the Portal binding.

The current self-service RLS policies on `patient_identities`:
- `patient_identity_self_read`;
- `patient_identity_self_insert`;
- `patient_identity_self_update`;

are replaced so authenticated patients cannot create or mutate canonical identity directly.

Portal self-service operates only on the Portal binding and authorized relationship.

---

## 17. RLS and security model

Canonical identity is not directly readable system-wide by every authenticated user.

Clinic staff access requires:
- authenticated session;
- current tenant;
- effective Patient permission;
- minimum necessary fields.

Patient authentication access requires:
- own Portal binding;
- own permitted relationship;
- entitlement/capability checks.

Matching candidate lookup across clinics is a privileged Patient/Identity operation.

Default preference is `SECURITY INVOKER`. If a privileged database function is proven necessary, it must be isolated, explicitly authorized, have a fixed search path, limited EXECUTE grants, and receive dedicated RLS/security tests. No privileged function is introduced merely to bypass an RLS failure.

This follows the current Supabase security model: grants and RLS are separate controls, exposed objects require RLS, and privileged functions require explicit restriction. citeturn0search1turn0search2

---

## 18. History boundary

Gate 03 does not create a new history engine.

Canonical longitudinal history is composed from owning domains, including:
- `clinic_visit_sessions`;
- Treatment Plans;
- medical records/files;
- Financial records;
- Follow-up;
- Communications where authorized.

`patient_history` remains a derived summary/read model if useful.

Existing `usePatientHistory()` is a migration target. It must consume the canonical Patient history composition contract rather than treating `patient_history` as the source of truth.

No identity migration is allowed to relink `patient_history` directly to System Identity as a shortcut.

---

## 19. Insurance boundary

Gate 03 does not rebuild Insurance.

Reuse:
- `patient_insurance_profiles`;
- payer/insurance contracts;
- claims and financial records.

Gate 03 establishes only the identity/relationship reference required to keep Patient Identity separate from coverage and financial truth.

Detailed insurance/claims lifecycle remains owned by Gate 08.

---

## 20. Merge architecture

Merge is Administrative.

Gate 03 owns:
- survivor/superseded identity state;
- identity merge transaction;
- audit;
- identity-level relationship/identifier reconciliation.

Owning domains own reconciliation of their domain records.

Merge must:
- require explicit authorization;
- record evidence and actor;
- lock the identities for the transaction;
- preserve immutable audit history;
- mark the superseded identity with survivor reference;
- avoid blind destructive deletion;
- verify tenant integrity;
- be idempotent/retry-safe.

Merge cannot be declared complete while required downstream domain reconciliation remains unresolved.

---

## 21. Existing-data backfill

Current live reality:
- 395 active `clinic_patients`;
- 0 `patient_identities`;
- 0 `patient_clinic_relationships`;
- 0 `patient_history`;
- current clinic data has incomplete DOB/gender/email coverage.

Backfill stages:

### M0 — schema preparation
Add structures/columns/indexes without changing active registration behavior.

### M1 — identity seeding
For each active clinic patient:
1. validate/normalize available evidence;
2. generate candidates;
3. apply patient-match-v1;
4. create System Identity when no existing identity is sufficiently matched;
5. create relationship;
6. ensure Portal binding;
7. record provenance;
8. route ambiguous cases to review.

No ambiguous historical records are auto-merged.

### M2 — registration cutover
All patient creation paths use the canonical service.

### M3 — update continuity
Demographic updates preserve identity and use audited identity-evidence correction where required.

### M4 — Portal separation
Move authentication binding and update Portal/Communications auth lookups.

### M5 — history read model
Migrate Patient history presentation away from `patient_history` as authority.

Backfill is idempotent and must be dry-run/reconciled before live mutation.

---

## 22. Migration and rollback sequence

No production migration is authorized by this document.

When execution is approved, migration order is:

1. schema additions;
2. demographic/identifier additions;
3. composite tenant FK;
4. matching indexes;
5. canonical identity/Portal binding structures;
6. dry-run backfill;
7. reconciled backfill;
8. application canonical registration/search path;
9. Portal binding migration;
10. RLS/grant migration;
11. replace phone uniqueness enforcement;
12. history read-model transition;
13. tests/advisors/live verification;
14. production rollout only after main verification plan is approved.

Destructive removal waits until all references, policies, tests and runtime paths are migrated and verified.

Rollback preserves clinic patient rows and domain records. Identity linkage is reversible/reconcilable without deleting clinic data.

---

## 23. Verification contract

Required automated/live scenarios include at minimum:

1. complete new registration;
2. exact repeat;
3. same phone with materially different evidence;
4. same email with materially different evidence;
5. same name, different DOB/sex;
6. same first/father/family/DOB;
7. national ID absent;
8. exact national ID;
9. mother name as evidence;
10. Arabic/Latin variants;
11. phone normalization variants;
12. incomplete registration;
13. demographic update;
14. same person entering another clinic;
15. ambiguous candidate;
16. overlapping contact data for distinct people;
17. Portal activation after identity exists;
18. Portal entitlement disabled;
19. tenant isolation during search/match;
20. merge survivor/superseded audit.

Additional mandatory verification:
- all direct clinic patient creation paths are eliminated or routed through the canonical service;
- no authenticated patient can INSERT/UPDATE canonical identity;
- cross-clinic candidate lookup reveals no other clinic record;
- composite tenant relationship FK rejects mismatched tenant links;
- Portal binding exists without requiring Auth or entitlement;
- patient_history emptiness does not erase canonical history;
- matching-policy version is auditable;
- duplicate/phone constraint behavior no longer blocks a valid registration solely on contact overlap;
- RLS/grants and privileged function exposure are verified;
- security/performance advisors pass or are explicitly documented.

---

## 24. Definition of Ready

Gate 03 Implementation is Ready only when:
- this revised design is explicitly approved;
- exact schema diff is generated and reviewed;
- patient-match-v1 is encoded exactly as specified and tests are bound to its version;
- all repository/database consumers are inventoried;
- Portal migration references are mapped;
- RLS policies are specified;
- backfill dry-run plan is executable and reversible;
- migration order is executable;
- no unresolved architectural decision remains.

---

## 25. Definition of Done

Gate 03 implementation is Done only when:
- every active clinic patient has an intentional identity/relationship state;
- all new registrations use registration validation + canonical matching;
- no single field determines identity;
- Patient Module search is authoritative;
- demographic changes preserve identity;
- cross-clinic recognition does not leak clinic data;
- tenant integrity is enforced;
- Portal binding is separate and pre-created without requiring subscription/auth;
- Portal authentication references are migrated;
- history uses canonical domain truth;
- Insurance remains domain-bounded;
- merge/audit governance is enforced;
- automated, live-data, security and authenticated runtime verification pass;
- main merge and post-main production verification pass;
- documentation and migration history reconcile exactly.

---

## 26. Design Review Resolution — DR-01 to DR-12

DR-01 Resolved: clinic-owned demographic truth remains in `clinic_patients`; System Identity is a normalized matching representation with provenance.

DR-02 Resolved: explicit father/family/mother fields are added only after consumer inspection; existing last-name semantics remain backward compatible.

DR-03 Resolved: DOB is canonical; age-only registration uses provisional age evidence with reference date.

DR-04 Resolved: patient-match-v1 has explicit weights, conflict rules, thresholds, versioning and audit.

DR-05 Resolved: reuse `patient_identities` as canonical identity because it is empty in live DB; remove Portal-auth semantics and create `patient_portal_identities`.

DR-06 Resolved: composite tenant FK is supported by the existing `clinic_patients(tenant_id,id)` unique constraint.

DR-07 Resolved: Portal binding is created automatically in the background, without requiring Auth or subscription.

DR-08 Resolved: canonical identity writes move behind the authorized Patient/Identity boundary; Portal self-service cannot mutate canonical identity.

DR-09 Resolved: known live references are classified as canonical identity versus auth lookup; final execution includes a repository/database dependency gate before removing `auth_user_id`.

DR-10 Resolved: history transition remains read-model work and does not rewrite history ownership.

DR-11 Resolved: merge owns identity-level transaction/audit while downstream domain reconciliation remains delegated.

DR-12 Resolved: no migration/code has been generated or executed; the design is now complete and awaits explicit execution approval.

---

## 27. Explicit non-authorizations

This design does NOT authorize:
- production DB mutation;
- migration creation/execution;
- application implementation;
- automatic historical merge;
- Portal subscription changes;
- rebuilding Insurance;
- rebuilding Patient History;
- creating a second identity engine;
- cross-clinic data visibility;
- changing Gate 01 or Gate 02;
- Vercel production deployment.

---

## 28. Final implementation-design status

**IMPLEMENTATION DESIGN COMPLETE — READY FOR EXPLICIT EXECUTION APPROVAL**

The next valid state transition is:

IMPLEMENTATION DESIGN COMPLETE
→ PRODUCT OWNER EXECUTION APPROVAL
→ IMPLEMENT
→ BUILD / TEST
→ RUNTIME / DATA / SECURITY VERIFY
→ DOCUMENT
→ CLOSE

No implementation action should begin before the explicit execution approval.
