# CORE SYSTEM — CSAPI Gate 03 — Patient & Identity
## Full Reconciliation / Decision Report

Date: 2026-09-22
Status: APPROVED — ARCHITECTURAL BASELINE / IMPLEMENTATION DESIGN PENDING
Main inspected: 67717ea306a3fce160d40f05a611049d33aeb4c0

## 1. Conclusion

The Gate 03 precheck is complete.

The approved target architecture is supported by the historical architecture and tenant-integrity model, but the current implementation does not yet satisfy the approved Patient & Identity contract.

The central gap is not the absence of a Patient Module. The Patient Module already exists and clinic-scoped patient records are widely referenced. The missing layer is a trustworthy reusable system-level identity that can connect independent clinic patient records without granting cross-clinic access.

Gate 03 is therefore APPROVED at the architectural/product level. Implementation is not authorized merely by the existence of gaps; the next step is bounded Implementation Design, followed by explicit execution approval.

No production database mutation or production deployment was performed during this reconciliation.

## 2. Evidence inspected

Historical architecture:
- ARCHITECTURE_DECISIONS.md, including ADR-006.
- ADR-012 Patient Portal Identity, Entitlements, and Activation.
- ADR-015 Cross-Domain Tenant Integrity Boundary.
- DATABASE_SCHEMA.md.
- CSAPI Master State and Gates Plan.
- Gate 02 closure/continuity records.
- Patient Journey implementation records.
- Financial/Insurance implementation contracts.

Current repository:
- Patient actions, queries, authorization and types.
- Patient list, form and Patient page.
- Global Search.
- Patient Portal actions and portal page.
- Insurance/Financial actions and queries.
- Relevant migrations, database types and continuity tests.

Live Supabase:
- Project: core-system-clinic.
- Region: eu-central-1.
- PostgreSQL: 17.6.1.141.
- clinic_patients: 395.
- patient_identities: 0.
- patient_clinic_relationships: 0.
- patient_history: 0.
- patient_insurance_profiles: 1.
- insurance_claims: 1.
- patient_portal_invitations: 1.
- All inspected target tables have RLS enabled.

Runtime:
- Current production deployment for main SHA 67717ea306a3fce160d40f05a611049d33aeb4c0 is READY.
- Gate 03 branch produced preview deployments only.
- Production runtime-error aggregation for the inspected 24-hour window returned no runtime error clusters.
- Protected production routes could not be exercised anonymously; the protection layer returned an authentication redirect. Therefore no claim is made that authenticated Patient behavior was runtime-verified by this anonymous probe.

## 3. External reconciliation

HL7 FHIR states that Patient records are generally created and maintained by each care organization, and that a patient receiving care from multiple organizations may therefore have multiple Patient records. FHIR also distinguishes the persistent resource ID from business identifiers such as MRN and supports patient matching/linking. citeturn2search3turn4search2

FHIR Person is a linkage concept for a person independent of a specific healthcare context and can link role-specific Patient records for the same individual. citeturn4search0turn4search1

ONC defines patient matching as identifying and linking one patient's data using multiple demographic fields. Its Patient Identification SAFER guidance covers registration, search/retrieval, duplicate detection and human/process safeguards. citeturn3search0turn3search14

NIST separates identity resolution/proofing from digital authentication, supporting a distinct Patient Identity layer and a separate Portal authentication layer. citeturn1search3turn1search36

FHIR Coverage is a separate financial resource connecting the covered patient and payer/coverage information. citeturn2search0turn2search2

External evidence therefore supports:
Person → reusable identity/linkage → clinic-specific patient records,
without treating identity linkage as permission to view another clinic's data.

## 4. Requirement matrix

| Requirement | Current reality | Classification | Decision |
|---|---|---|---|
| R1 Canonical identity | clinic_patients is canonical today; reusable identity is unused | Partial / Contradictory | Implement reusable System Patient Identity |
| R2 Clinic relationship | relationship tables exist; normal registration does not create them | Partial | Create relationship as part of Patient identity flow |
| R3 Duplicate matching | create paths insert directly; phone is uniquely constrained | Missing / Contradictory | Multi-attribute matching and human review |
| R4 Patient search | Patient Module has client-side name/phone/email search | Partial | Patient Module owns authoritative search |
| R5 History | canonical visits exist; patient_history is empty summary data | Partial / Duplicated | patient_history becomes projection/summary only |
| R6 Insurance | profiles, claims and contracts exist with tenant integrity | Partial / Downstream | Gate 03 defines boundary; Gate 08 owns lifecycle |
| R7 Portal | separate entitlement/auth model exists, but identity is created on activation | Partial / Contradictory | Identity exists before Portal activation |
| R8 Identifier governance | file number and identity model are incomplete | Missing | System ID + clinic file ID + governed evidence |
| R9 Demographic continuity | update edits same clinic record | Partial | Make continuity explicit and test it |
| R10 Merge | no merge engine found | Missing | Administrative merge with recovery/audit |
| R11 Match confidence | no current matching authority | Missing | Document result classes |
| R12 Tenant safety | RLS and tenant-aware controls are strong | Working | Preserve and extend |
| R13 Referential integrity | composite tenant FKs are widely present | Working / identity gap | Add identity continuity without replacing domain FKs |
| R14 Auditability | audit infrastructure exists, identity events incomplete | Partial | Add identity-event audit coverage |

## 5. Critical findings

### A. Current identity is clinic-scoped, not reusable

Patient creation currently generates a UUID and inserts directly into clinic_patients.

There is no pre-create identity matching.

The existing patient_identities table is currently tied to Portal authentication fields and contains zero rows in production.

Therefore it cannot simply be assumed to be the canonical reusable Patient Identity without architectural correction.

### B. Current phone uniqueness is an implementation constraint that must be reconciled with the matching architecture

Live database constraint:
UNIQUE (tenant_id, phone_primary)

This constraint is not itself a product decision. The approved architecture requires mandatory phone validation and multi-attribute identity matching. A phone overlap is evidence for matching/review; it is not by itself proof of duplicate identity or a reason to reject a valid registration.

Therefore the implementation must preserve valid phone-format/number validation while ensuring that a phone overlap cannot block a valid registration solely because the value already exists. The exact replacement index/constraint behavior is an Implementation Design detail and must be finalized after inspecting all phone consumers and historical assumptions.

### C. Patient Module search is not yet identity authority

Patient Module search currently filters a loaded patient collection using name, phone and email.

It does not yet provide the full authoritative search/matching process using file number, date of birth, gender, Arabic names and governed identifiers.

Global Search is broader, but it must remain a presentation/navigation surface rather than the Patient matching authority.

### D. Patient History is currently split

patient_history has zero live rows and contains summary-oriented fields.

Gate 02 already established canonical visit continuity through clinic_visit_sessions.

Therefore:
- visits/sessions remain canonical Visit history;
- Treatment Plans remain Clinical/PJ truth;
- Medical Files remain Clinical/Medical truth;
- Financial records remain Financial truth;
- Follow-up remains Follow-up truth;
- patient_history is a derived projection/summary or legacy artifact.

The current usePatientHistory hook still reads patient_history, so the Patient Module has a source-of-truth inconsistency that must be corrected.

### E. Portal identity is currently created too late

The current Portal claim path creates patient_identities when an invitation is claimed.

The approved Gate 03 model is:
Patient registration → System Patient Identity → Clinic Relationship → separate Portal Identity/authentication → entitlement-controlled Portal access.

Portal subscription must control access, not creation of the patient identity.

### F. Clinic ownership remains explicit

The clinic owns and maintains its Clinic Patient Record.

The system-level identity is a recognition/linkage mechanism for continuity, duplicate prevention and future Portal capability.

Recognition of the same person across clinics must never grant one clinic access to another clinic's records.

## 6. Insurance boundary

Current insurance implementation already includes:
- patient insurance profiles;
- payer name;
- policy/member identifiers;
- coverage summary;
- effective dates;
- clinic insurance contracts;
- claims;
- patient responsibility;
- reconciliation;
- tenant-aware integrity.

This is sufficient evidence that Gate 03 should not rebuild Insurance.

Gate 03 owns the conceptual Patient → Coverage/Profile relationship.

Gate 08 owns detailed financial responsibility, claim and reconciliation lifecycle.

## 7. Duplicate matching target

Registration:
Search → candidate matches → multi-attribute assessment → result.

Result classes:
- confirmed same person → reuse System Patient Identity;
- possible/probable same person → warning and authorized review;
- sufficiently different → create a new identity.

Evidence may include:
date of birth/age, gender, first name, parent/father name where applicable, family name, phone, email and governed identifiers.

These are evidence, not interchangeable identity keys.

## 8. Merge

Merge is required because human error can create duplicates.

Authority:
Administrative only.

Before implementation, merge must define:
- initiation/approval;
- survivor and superseded records;
- evidence;
- visits;
- appointments;
- treatment plans;
- medical files;
- invoices/payments;
- insurance/claims;
- follow-up;
- communications;
- Portal identity;
- identifiers;
- audit;
- recovery/rollback.

No destructive shortcut is authorized.

## 9. Identifier model

System Patient ID:
- stable system-level identity;
- represents the same person within CORE SYSTEM;
- does not change because demographics change.

Clinic Patient/File ID:
- clinic-owned;
- independent per clinic;
- not the global identity key.

Search/matching attributes:
- name;
- Arabic name;
- DOB;
- gender;
- phone;
- email;
- parent/family information where applicable;
- governed external identifiers.

FHIR similarly separates persistent resource IDs from business identifiers such as MRN. citeturn2search3turn2search10

## 10. Person model

Person is approved as a distinct concept.

Implementation interpretation:
Real Person → System Patient Identity → Clinic Relationship → Clinic Patient Record.

The physical database decomposition must still follow Inspect → Reuse → Extend → Create and must not create competing identity engines.

FHIR provides a comparable conceptual distinction between Person and organization-specific Patient records. citeturn4search0turn4search1

## 11. Tenant/security conclusion

ADR-015 is aligned with the approved model.

Existing protections include:
- tenant-scoped Patient RLS;
- tenant-aware permissions;
- composite tenant foreign keys;
- separate staff and patient authorization;
- Portal relationship checks.

No evidence justifies weakening this boundary.

The new identity layer must be a recognition/linkage authority, not a cross-tenant data-access mechanism.

## 12. Live data quality observations

Active Patient distribution:
- 3 patients in one tenant;
- 391 in another;
- 1 in a third.

No duplicate active primary phone values were found within tenant data. This does not validate the uniqueness rule; it only describes today's data.

Demographic completeness across 395 active records:
- DOB present: 189;
- gender present: 202;
- email present: 189.

This reinforces the need for multi-attribute matching that works with incomplete evidence.

Clinic file number is populated for only 1 of 395 active patients.

This is a data-quality finding and must not be silently repaired during precheck.

## 13. Security/performance observation

Supabase advisory output reports duplicate indexes, including duplicate tenant/id indexes on clinic_patients.

This is database hygiene work and must be handled through controlled migration review. It is not an authorization to make ad-hoc production changes during Gate 03 precheck.

## 14. Gate 03 implementation boundary

Implementation should be limited to:
1. canonical System Patient Identity;
2. Clinic Relationship creation/maintenance;
3. identifier governance;
4. registration matching;
5. authoritative Patient Search;
6. shared-phone-safe duplicate handling;
7. demographic continuity;
8. Patient History projection/source boundary;
9. Portal Identity separation;
10. administrative merge governance/mechanics;
11. identity auditability;
12. tenant-isolation and identity regression tests.

Do not rebuild Patient Flow, Patient Journey, Agenda, Clinical, Financial, Insurance claims lifecycle, Follow-up, Communications, Portal UI or the permission engine.

## 15. Later-gate findings

Gate 04: Agenda/Scheduling lifecycle.

Gate 05: Clinical Care and medical source-of-truth.

Gate 06: Treatment Planning lifecycle.

Gate 08: detailed Financial/Insurance lifecycle.

Gate 11: Follow-up/Retention.

Gate 14: Medical Files and Portal release/file experience.

Gate 17: cross-cutting Security/Authorization hardening.

These findings do not reopen Gate 01 or Gate 02.

## 16. Decision status

The reconciliation satisfies the Gate 03 Definition of Ready:

- external research reconciled;
- historical architecture inspected;
- current code inspected;
- live database inspected;
- runtime/deployment evidence inspected;
- seven mandatory questions answered;
- R8–R14 evaluated;
- ownership boundaries defined;
- history source-of-truth defined;
- duplicate/matching target defined;
- merge authority defined;
- identifier strategy defined;
- Portal boundary defined;
- insurance boundary defined;
- tenant isolation structurally verified;
- gaps classified;
- scope and non-scope defined.

Gate 03 is now:
**APPROVED — ARCHITECTURAL BASELINE / IMPLEMENTATION DESIGN PENDING**

The exact matching thresholds, identifier registry physical schema, merge transaction/recovery mechanics, final physical Person/Patient Identity decomposition, migration/backfill sequence and exact verification contract are now defined in the Gate 03 Implementation Design document; execution remains pending design review and explicit approval.

All approved decisions remain subject to the normal CSAPI change-control process in later stages.

## 17. Final architecture statement

Real Person
→ System Patient Identity
→ Clinic Relationship
→ Clinic Patient Record
→ domain-owned records.

System Patient Identity
→ separate Portal Identity/authentication
→ entitlement/capability
→ authorized Portal access.

Core rule:

CORE SYSTEM may recognize that patient records in different clinics represent the same real person, but that recognition never grants one clinic access to another clinic's patient record.

The clinic owns the clinic patient record; the system maintains the identity/linkage mechanism needed for continuity without becoming the owner of the clinic's clinical data.


### Pre-Implementation Design authority reconciliation — 2026-09-22

The final authority check found documentation-state drift but no unresolved architectural contradiction. The corrected status is APPROVED — ARCHITECTURAL BASELINE / IMPLEMENTATION DESIGN PENDING. Remaining design details are bounded to matching thresholds/result vocabulary, identifier registry schema, merge/recovery/audit mechanics, physical Person/Patient Identity decomposition, migration/data-transition strategy, and the exact verification contract.


### Portal ID semantic decision — 2026-09-22

The final pre-Implementation Design review resolved one semantic ambiguity in the approved Portal requirement. The background **Portal ID** is a stable non-authentication identity/binding associated with the System Patient Identity. It exists before Portal subscription/activation, but it is not a login account, does not authenticate the patient, and does not grant access. Authentication/account binding remains separate; subscription/entitlement controls access and visibility. This preserves the approved rule that identity exists before Portal activation without coupling canonical identity to authentication.


### Implementation Design reconciliation — 2026-09-22

The Gate 03 Implementation Design has been drafted and reconciled against the approved architectural baseline, current main source, and live Supabase schema/constraints.

The design explicitly separates:
1. Registration Validity — required-field and phone-format validation;
2. Identity Matching — multi-attribute evidence against existing System Patient Identities.

The design does not promote any example into a product rule. In particular, a shared/overlapping phone scenario is a verification fixture for the broader matching contract, not a rule that phone numbers are universally non-unique.

No application code, migration, production database mutation, or production deployment has been performed. Current state: IMPLEMENTATION DESIGN DRAFTED / DESIGN REVIEW PENDING.
