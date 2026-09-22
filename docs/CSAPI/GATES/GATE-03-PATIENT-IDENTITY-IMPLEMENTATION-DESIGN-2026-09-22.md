# CORE SYSTEM — CSAPI Gate 03 — Patient & Identity
## Implementation Design
Date: 2026-09-22
Gate: CSAPI Gate 03 — Patient & Identity
Status: IMPLEMENTATION DESIGN — PENDING EXECUTION APPROVAL
Authority: Approved Gate 03 Architectural Decision / Requirements Contract
Execution rule: This document defines the physical implementation design. It does not authorize application code, migrations, production mutation, or deployment.

---

## 1. Design objective

Implement the approved Gate 03 architecture without creating a second Patient/Identity engine and without changing ownership of Visit, Agenda, Clinical, Financial, Insurance, Follow-up, Communications, Portal UI, or Team & Access.

Target model:

    Real Person
        |
        v
    System Patient Identity
        |
        +---- Identity / matching evidence
        |
        +---- Patient identifiers
        |
        +---- Clinic Relationship
        |         |
        |         +---- Clinic Patient Record
        |                   |
        |                   +---- existing domain records
        |
        +---- Portal Identity / binding
                  |
                  +---- Portal authentication and entitlement

Physical decomposition is deliberately different from the conceptual Person model: an explicit `persons` table is NOT required for this implementation. `patient_identities.id` is the stable system identity. The schema must retain a clean future boundary for introducing a separate Person entity without changing clinic-domain ownership.

---

## 2. Current physical reality that drives the design

Current main evidence:

- `clinic_patients` is the active clinic-scoped patient record and is referenced by downstream domains.
- `patient_identities` currently represents Portal authentication identity: it contains `auth_user_id`, email/phone, status, verification and authentication timestamps.
- `patient_clinic_relationships` already exists and is the correct structural boundary for System Patient Identity ↔ Clinic Patient relationship.
- `patient_portal_invitations` already binds invitations to `clinic_patient_id`.
- `patient_history` is a summary/projection-shaped table and is not the longitudinal source of truth.
- Current Patient creation inserts directly into `clinic_patients` without a canonical identity matching step.
- Current Patient types do not contain the required father name, mother name or national-ID/card field.
- Current live DB has `UNIQUE (tenant_id, phone_primary)`; this is an implementation constraint that may block a valid registration when phone overlap is evidence rather than identity proof. It is NOT a product decision that phone is non-unique. Its final replacement is part of the migration design below.
- Current Portal claim creates `patient_identities` during authentication/claim. That behavior must be separated from canonical identity creation.

No production change is authorized by this design.

---

## 3. Canonical physical model

### 3.1 `patient_identities` — canonical System Patient Identity

Reuse the existing table name, but change its semantic role from Portal-auth identity to canonical Patient Identity.

Required target responsibilities:

- stable system-wide patient identity ID;
- identity lifecycle;
- minimum matching profile/evidence;
- identity verification status;
- normalized governed identifiers;
- no dependency on Portal authentication;
- no tenant ownership column.

The table MUST NOT contain Portal-auth-only semantics such as `auth_user_id` as its identity key.

Recommended target core columns:

- `id uuid primary key`;
- `status` — active/suspended/revoked as applicable;
- `first_name`;
- `father_name`;
- `family_name`;
- `mother_name` nullable;
- `date_of_birth`;
- `gender`;
- `phone_primary` normalized/validated;
- `email` normalized when supplied;
- `national_id` nullable, with explicit verification state;
- `created_at`;
- `updated_at`.

Important ownership rule:

The identity profile is the system's recognition/matching representation. It is NOT the clinic's clinical or operational record and is not a substitute for `clinic_patients`.

### 3.2 Patient identifiers

Do not overload `patient_identities` with every possible identifier forever.

Introduce a governed identifier registry only where the existing schema has no authoritative equivalent:

`patient_identity_identifiers`

Suggested columns:

- `id`;
- `patient_identity_id`;
- `identifier_type`;
- `normalized_value`;
- `display_value`;
- `scope_type` (system / clinic / external);
- `tenant_id` nullable when system-scoped;
- `verification_status`;
- `is_current`;
- `valid_from`;
- `valid_to`;
- `source`;
- `created_at`;
- `updated_at`.

Rules:

- System Patient ID is the immutable primary identity and does not live as a mutable business identifier.
- Clinic file number remains clinic-scoped.
- National ID/card is optional and important, but absence never blocks registration.
- Identifier uniqueness is defined per identifier type and scope, not globally.
- A value being equal to another patient's value is evidence for matching according to identifier semantics; it is not a universal duplicate rule.

### 3.3 `patient_clinic_relationships` — canonical relationship

Reuse the existing table.

Target meaning:

`patient_identity_id` ↔ `clinic_patient_id` ↔ `tenant_id`

Required guarantees:

- one active relationship for a given System Patient Identity + Clinic Patient record;
- tenant of relationship must equal tenant of clinic patient;
- no relationship grants cross-tenant record access;
- relationship status is independently lifecycle-managed;
- Portal access is not implied by relationship existence.

The existing unique `(patient_identity_id, tenant_id)` must be reviewed during implementation because it would prevent one System Patient Identity from having multiple distinct clinic-patient records in the same tenant if the product later permits that scenario. The approved model does not require duplicate clinic records for the same identity; therefore the preferred invariant is one identity ↔ one clinic relationship per tenant unless a later explicit product decision changes it.

### 3.4 `clinic_patients` — clinic-owned Patient Record

Keep `clinic_patients` as the clinic-owned patient record and preserve its existing downstream references.

Extend the registration demographic model with:

- `father_name` mandatory;
- `mother_name` nullable;
- `national_id` nullable;
- `national_id_verification_status` where required;
- preserve existing first/family-name representation or introduce explicit `family_name` only if the current last-name semantics cannot safely represent it.

The implementation MUST first inspect existing naming conventions and all consumers before adding/renaming columns.

Required registration data:

1. first name — mandatory;
2. father name — mandatory;
3. family name — mandatory;
4. mother name — optional but important;
5. national ID/card — optional but important;
6. phone — mandatory and country-format validated;
7. email — optional but important;
8. sex — mandatory;
9. age or date of birth — mandatory.

These are registration-validity requirements. They are NOT uniqueness rules.

### 3.5 Portal identity/binding

Create a separate physical Portal identity/binding boundary, e.g. `patient_portal_identities`.

It should contain:

- `id`;
- `patient_identity_id`;
- `auth_user_id` unique;
- verification/activation status;
- verified timestamp;
- last authenticated timestamp;
- created/updated timestamps.

Portal invitation continues to point to the clinic patient and must resolve through the canonical relationship to the System Patient Identity before activation.

Portal subscription/entitlement remains an access decision, not an identity-creation decision.

---

## 4. Registration validity vs identity matching

This separation is mandatory.

### Layer A — Registration validity

Before identity matching can conclude that a new patient may be created, the submitted registration must satisfy:

- first name present;
- father name present;
- family name present;
- phone present and valid for the configured country/numbering rules;
- sex present;
- DOB or age present and internally consistent;
- optional fields accepted when absent.

Invalid registration is rejected before identity matching.

### Layer B — Identity matching

Once registration is valid, compare the available evidence against existing System Patient Identities.

Evidence includes, as available:

- first name;
- father name;
- family name;
- mother name;
- date of birth / age;
- sex;
- national ID/card;
- normalized phone;
- normalized email;
- other governed identifiers.

No single field is conclusive by itself.

An overlap is evidence, not an automatic duplicate decision.

The implementation must never encode the example/test case of a shared contact number as a universal business rule. The implementation must instead support the general rule: a valid registration may produce an overlap warning and require review rather than being rejected solely because one field matches an existing record.

---

## 5. Matching engine design

### 5.1 Authority

Patient / Identity domain owns matching.

Implement one reusable server-side matching service used by:

- normal Patient registration;
- quick registration;
- kiosk/object registration;
- future imports/integrations where authorized.

No separate UI-specific duplicate engines.

### 5.2 Candidate generation

Candidate retrieval should use indexed, normalized evidence to avoid scanning the complete patient population.

Candidate keys should include combinations of:

- normalized name tokens;
- father/family name;
- DOB;
- national ID/card when supplied;
- phone;
- email;
- other governed identifiers.

Candidate generation is a recall stage. It must not itself declare identity.

### 5.3 Evidence scoring

Use a documented weighted evidence model rather than a single-field rule.

Design requirements:

- exact high-authority identifier evidence can produce a high-confidence candidate;
- strong demographic agreement across multiple fields can produce a high-confidence candidate;
- partial/missing data lowers confidence;
- conflicting strong evidence must reduce confidence and may force manual review;
- optional evidence contributes when present;
- absent optional evidence is not a contradiction;
- weak/common values do not dominate the decision.

Thresholds must be configurable and covered by tests. They are implementation parameters, not a new product decision.

### 5.4 Result classes

The implementation should expose:

- `EXACT_MATCH` — evidence is sufficiently strong to reuse an existing identity;
- `REVIEW_REQUIRED` — candidate evidence is meaningful but not sufficiently decisive;
- `NO_MATCH` — no candidate reaches the configured evidence floor.

The UI may use clearer Arabic labels, but the server-side contract remains deterministic.

### 5.5 Create behavior

- EXACT_MATCH → staff reuses the existing patient identity/clinic relationship where appropriate.
- REVIEW_REQUIRED → staff must review the candidate before creation can proceed.
- NO_MATCH → create a new System Patient Identity and clinic relationship.

The system must not silently merge records during registration.

---

## 6. Phone and contact constraints

The current `UNIQUE (tenant_id, phone_primary)` constraint cannot remain the final identity authority because phone equality is matching evidence rather than proof of identity.

Implementation must:

1. preserve mandatory phone validation/normalization;
2. detect phone overlap during matching;
3. surface overlap as evidence/review;
4. avoid a database uniqueness constraint that prevents a valid registration solely because the phone value already exists;
5. preserve any other legitimate uniqueness rules that are independently justified.

The exact index/constraint replacement must be produced as part of the migration after all current phone consumers and historical assumptions are inspected.

Email is similarly evidence, not universal identity proof.

---

## 7. Patient search design

### 7.1 Patient Module search

The Patient Module becomes the authoritative staff search surface.

It must support:

- System Patient ID;
- clinic file number;
- first/father/family/mother names;
- Arabic equivalents where stored;
- phone;
- email;
- national ID/card where authorized;
- DOB/age;
- sex;
- matching candidate status where applicable.

Search results must distinguish:

- exact identifier hit;
- likely patient;
- ambiguous candidates.

### 7.2 Global Search

Global Search remains a navigation/presentation surface.

It may return Patient results, but Patient matching and Patient creation must call the Patient / Identity authority rather than relying on Global Search result logic.

### 7.3 Authorization

Search must be tenant-scoped for clinic users.

Cross-clinic identity recognition may occur inside the matching authority without revealing another clinic's record contents to the current clinic.

Only the minimum information needed for duplicate review may be surfaced.

---

## 8. Cross-clinic recognition without cross-clinic leakage

The matching service may determine that a newly registered person is likely the same System Patient Identity represented at another clinic.

The current clinic must NOT receive:

- the other clinic's clinical history;
- appointments;
- financial records;
- notes;
- communications;
- treatment plans;
- portal data;
- internal clinic identifiers.

The safe response is identity continuity only:

> Existing System Patient Identity detected; current clinic relationship will be created/linked after the required review.

The current clinic then receives its own clinic-scoped Patient Record and file number.

---

## 9. Existing-data transition

Because current live data has 395 active clinic patients and zero current System Patient Identities / clinic relationships, implementation must use a staged migration.

### Phase M0 — schema preparation

Create/extend structures without changing existing patient behavior.

### Phase M1 — identity seeding

For each active clinic patient:

1. validate available identity evidence;
2. normalize matching attributes;
3. attempt candidate matching within permitted identity scope;
4. create a System Patient Identity when no sufficiently strong candidate exists;
5. create the clinic relationship;
6. record migration provenance;
7. do not merge ambiguous records automatically.

Ambiguous historical records become explicit review cases.

### Phase M2 — registration cutover

Route all Patient creation paths through the canonical matching service.

No direct `clinic_patients` insert remains an approved creation path.

### Phase M3 — existing Patient update

Updates must preserve the System Patient Identity.

If identity evidence materially changes:

- update the governed identity evidence;
- rerun matching safeguards as appropriate;
- never create a second patient because demographics changed.

### Phase M4 — Portal separation

Move Portal authentication binding from the canonical identity table to the dedicated Portal identity/binding structure.

Historical portal data is preserved.

### Phase M5 — history read model

Stop treating `patient_history` as authoritative.

Patient history presentation reads canonical domain sources and may retain `patient_history` only as a derived summary/read model if it is still useful.

No history data is deleted during this gate solely because it is a projection.

---

## 10. Migration safety and rollback

All DB changes must be delivered through isolated migrations.

Migration order:

1. add new/extended identity structures;
2. add new demographic/identifier fields;
3. add relationship integrity constraints;
4. add matching indexes;
5. seed identities/relationships in a controlled, idempotent operation;
6. deploy application matching path;
7. validate;
8. only then remove/replace obsolete Portal-auth constraints and phone uniqueness enforcement.

No destructive column drop should occur until:

- all application references are migrated;
- RLS policies are migrated;
- tests are green;
- live verification proves no dependency remains.

Rollback must be application-safe: previous clinic patient records remain intact; identity linkage can be disabled/reconciled without deleting clinic data.

---

## 11. Merge design

Merge is Administrative only.

The first implementation should not perform a blind physical delete.

Preferred model:

- select survivor System Patient Identity;
- select duplicate identity;
- record explicit merge decision and evidence;
- lock both identities for the transaction;
- re-point/reconcile clinic relationships and governed identifiers according to domain rules;
- preserve immutable audit record;
- mark the superseded identity as merged/revoked with a survivor reference;
- do not destroy historical evidence;
- verify downstream foreign keys and tenant boundaries.

Because downstream domains have different ownership, each domain's references must be reconciled by its own approved contract. Gate 03 owns the identity/relationship transaction and audit boundary, not domain-specific business reconciliation.

A merge must be idempotent and safe to retry.

---

## 12. Audit design

Identity-sensitive events require an append-only audit record.

Minimum event classes:

- identity_created;
- identity_updated;
- clinic_relationship_created;
- clinic_relationship_changed;
- match_reviewed;
- match_confirmed;
- match_rejected;
- merge_started;
- merge_completed;
- merge_recovery;
- identifier_added;
- identifier_changed;
- portal_binding_created;
- portal_binding_changed;
- identity_correction.

Audit records must include actor, tenant context when applicable, subject identity, event time, action/result, and structured evidence metadata without unnecessarily duplicating sensitive patient data.

---

## 13. RLS / security design

### Canonical identity

The canonical identity table must not be directly readable by arbitrary authenticated users across tenants.

Access should be through authorized Patient / Identity operations that enforce:

- authenticated user;
- current tenant;
- effective Patient permissions;
- minimum necessary fields.

### Clinic relationship

Relationship reads/writes must verify:

- current user is authorized for the clinic tenant;
- relationship tenant matches clinic patient tenant;
- target identity is valid.

### Portal binding

Portal binding must be readable by the patient authentication context only for its own binding and by authorized clinic staff for the clinic relationship.

Portal authentication must never become the mechanism for staff authorization.

### Security-definer functions

If a privileged matching function is required to inspect cross-tenant identity evidence, it must be treated as a security-sensitive API:

- keep it in a non-exposed schema where possible;
- explicitly validate authenticated caller and clinic authorization;
- grant only required execution rights;
- avoid trusting user-editable JWT metadata;
- run Supabase security/performance advisors after migration.

No SECURITY DEFINER function is introduced merely to bypass an RLS error.

---

## 14. API/application boundary

The approved server boundary is:

    Patient UI
       ↓
    Patient registration/search action
       ↓
    Patient Identity service
       ↓
    Candidate matching
       ↓
    Review / result
       ↓
    Clinic Patient creation or existing relationship reuse
       ↓
    Existing domain references

The UI must not directly decide duplicate identity.

Existing Server Actions may be extended, but the final creation path must have one canonical authority.

Object-based, kiosk and quick-registration flows must call the same authority.

---

## 15. History implementation boundary

Gate 03 does not create a new history engine.

The Patient Module's longitudinal view should compose canonical sources such as:

- `clinic_visit_sessions`;
- Treatment Plans;
- medical records/files;
- Financial records;
- Follow-up;
- Communications where the user is authorized.

`patient_history` may remain a read model/summary if useful.

The existing `usePatientHistory()` direct dependency on `patient_history` is therefore a migration target: it must eventually consume the canonical history/read model contract rather than assume the summary table is the source of truth.

This does not authorize rebuilding any owning domain.

---

## 16. Insurance implementation boundary

Gate 03 only establishes the Patient ↔ Coverage relationship boundary.

Reuse existing:

- `patient_insurance_profiles`;
- insurance contracts/payers;
- claims and financial records.

Gate 03 may add the identity/relationship reference required to keep Patient Identity separate from clinic insurance data, but detailed claims, payer, billing, reconciliation and responsibility lifecycle remain Gate 08.

---

## 17. Portal implementation boundary

Portal activation flow becomes:

    Clinic Patient exists
          ↓
    System Patient Identity exists
          ↓
    Clinic Relationship exists
          ↓
    Portal Identity/binding may be created
          ↓
    Patient authentication is verified
          ↓
    Entitlement/capability checked
          ↓
    Authorized portal data exposed

Portal entitlement does not create the System Patient Identity.

If Portal is not subscribed, identity and relationship still exist; portal access simply remains unavailable.

---

## 18. Verification contract

Before execution is considered complete, the implementation must pass all of the following.

### Registration

- required fields enforced;
- invalid phone rejected;
- DOB/age requirement enforced;
- optional fields accepted;
- no single-field duplicate rejection.

### Matching

- exact high-confidence match reuses identity;
- multi-field candidate produces review;
- no-match creates identity;
- conflicting evidence does not silently merge;
- phone/email overlap alone does not automatically reject a valid registration;
- example scenarios are treated as tests of the general matching contract, not business rules.

### Identity continuity

- demographic update does not create a new identity;
- clinic relationship is created exactly once for the patient/clinic;
- system identity remains stable.

### Tenant safety

- clinic A cannot read clinic B records;
- cross-clinic recognition never exposes clinic B patient data;
- all relationship operations enforce tenant integrity.

### Search

- Patient Module supports governed identifiers and demographic search;
- Global Search remains presentation-only;
- search results are permission-aware.

### Portal

- portal binding is separate from canonical identity;
- subscription controls access;
- portal auth does not grant staff access;
- historical patient identity is not created only at Portal claim.

### History

- canonical visit/domain sources are used;
- empty `patient_history` does not make a patient appear to have no history when canonical records exist.

### Merge

- administrative authorization enforced;
- audit record preserved;
- survivor/superseded relationship traceable;
- retry is idempotent;
- no silent destructive deletion.

---

## 19. Test matrix to implement

Minimum deterministic fixtures:

1. brand-new patient with complete required data;
2. exact repeat registration;
3. same phone, materially different identity evidence;
4. same email, materially different identity evidence;
5. same name, different DOB/sex;
6. same name + father + family + DOB;
7. optional national ID absent;
8. national ID exact match;
9. mother name supplied as additional evidence;
10. Arabic/Latin name variants;
11. phone normalization variants;
12. incomplete required registration;
13. demographic update;
14. same person entering a second clinic;
15. ambiguous candidate requiring review;
16. two distinct people with overlapping contact information;
17. Portal activation after identity already exists;
18. Portal entitlement disabled;
19. tenant isolation during search/match;
20. merge survivor/superseded identity audit.

The tests must assert the general architectural rules, not encode any single example as a product rule.

---

## 20. Execution order

Execution must follow:

1. finalize repository consumer inventory;
2. finalize exact migration SQL;
3. finalize matching score/threshold configuration;
4. finalize RLS and privileged-function design;
5. implement schema migrations on isolated development database;
6. seed/backfill with dry-run and reconciliation;
7. implement canonical Patient registration/search path;
8. migrate Portal binding;
9. migrate history read model;
10. run structural/unit/integration tests;
11. run live Supabase read-only verification;
12. run authenticated runtime verification;
13. run security/performance advisors;
14. reconcile documentation;
15. request/receive explicit execution approval for each mutation stage;
16. only then merge and perform final production verification.

No step may silently expand into another CSAPI gate.

---

## 21. Definition of Ready for execution

Implementation is Ready only when:

- this design is approved;
- exact schema diff is reviewed;
- exact matching thresholds are recorded;
- migration/backfill plan is executable and reversible;
- current consumers are inventoried;
- RLS policies are specified;
- Portal migration path is specified;
- history read-model transition is specified;
- test matrix is encoded;
- no unresolved architectural decision remains.

## 22. Definition of Done

Gate 03 implementation is Done only when:

- canonical System Patient Identity exists and is stable;
- every active clinic patient has an intentional identity/relationship state;
- all new registrations pass registration validation + matching;
- duplicate prevention works without single-field false rejection;
- search is authoritative within the Patient Module;
- demographic changes preserve identity;
- tenant isolation is proven;
- Portal identity is separated from canonical identity;
- history uses canonical domain truth;
- insurance remains domain-bounded;
- merge/audit governance is enforced;
- automated, live data, security and authenticated runtime verification pass;
- documentation and migration history are reconciled;
- production verification passes after main merge.

---

## 23. Explicit non-authorizations

This design does NOT authorize:

- applying migrations;
- modifying production Supabase;
- changing Portal UI;
- rebuilding Patient Journey;
- changing Patient Flow;
- changing Agenda;
- implementing insurance claim lifecycle;
- implementing Follow-up/Communications workflows;
- changing Team & Access permission architecture;
- production deployment;
- data deletion;
- automatic historical merge.

---

## 24. Design conclusion

The implementation path is one canonical Patient / Identity authority with an explicit clinic relationship boundary and a separate Portal authentication boundary.

The central registration rule is:

> Validate the required patient registration data first. Then perform multi-attribute identity matching against the existing System Patient Identity population. No single demographic or contact field is sufficient by itself to decide identity, duplication, or rejection.

The phone-overlap scenario remains a test of this rule, not a rule itself.

The next CSAPI action after this design is **Design Review / Execution Approval**, not immediate production implementation.
