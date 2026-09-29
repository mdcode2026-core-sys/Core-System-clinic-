# CSAPI Gate 05 — Clinical Template & Documentation Architecture
## Version 1 — 2026-09-30

Status: ARCHITECTURE DESIGN — FROZEN / IMPLEMENTATION-READY INPUT
Purpose: Define how the comprehensive Clinical model becomes configurable for specialties and visit types while preserving canonical clinical truth and a simple clinician UX.

## 1. Core architecture rule

Clinical Template controls presentation, applicability and requirements.
Clinical entities store clinical truth.
Clinical Document stores authored documentation and references canonical facts.
Template must never become a hidden medical-record database.

Therefore:
Template = configuration.
Observation / Assessment / Problem / Decision / Recommendation / Procedure Execution = clinical truth.
Clinical Document = human-readable authored record.
Governance audit = cross-domain audit history.

## 2. Template hierarchy

The design supports three logical levels:

1. System / specialty baseline template
2. Clinic-configured template derived from the applicable baseline
3. Versioned published template used by a Visit

Published versions are immutable.
A Visit records the exact template version used so that historical documentation remains interpretable after the clinic changes its template.

A clinic must not silently alter the meaning of an already-completed Visit by editing the current template.

## 3. Template applicability

Template selection may consider:
- specialty;
- visit type;
- service/procedure context when available;
- clinic configuration;
- enabled commercial capability/entitlement;
- explicit clinical workflow configuration.

Commercial entitlement controls whether an optional capability can be exposed.
Entitlement must not alter the meaning of previously stored clinical data.

## 4. Template field model

Each template field has a stable semantic key and declares:
- label and localization key;
- semantic target;
- data type;
- required / optional;
- repeatable / single;
- visible / conditionally visible;
- required when condition is met;
- validation constraints;
- allowed option set where appropriate;
- unit or measurement semantics where appropriate.

Important rule:
A field is not itself the stored clinical fact.

Example:
A blood-pressure field maps to a Clinical Observation of the relevant observation type.
A diagnosis field maps to a Clinical Problem/Diagnosis operation or structured reference.
A treatment recommendation field maps to a Clinical Recommendation.

This prevents the same fact from becoming different values merely because two specialties use different UI templates.

## 5. Observation/value architecture

Clinical Observation must support structured facts across future specialties.

Recommended semantic shape:
- observation identity;
- patient;
- optional Visit;
- observation type / semantic definition;
- value representation;
- unit where applicable;
- effective/occurrence time;
- recorded time;
- performer/recorder;
- clinical status;
- optional Problem linkage;
- optional source Medical File linkage for image-derived context.

Value payload may use a controlled typed representation rather than a separate table for every specialty measurement.
The semantic observation type must remain queryable and stable even when the underlying value payload is flexible.

Image measurements remain owned by Medical Files and are surfaced through Clinical Observation/reference semantics when needed.

## 6. Clinical Document architecture

Clinical Document is the durable authored narrative/structured presentation for a clinical interaction.

Supported document types should be extensible, including examples such as:
- encounter/visit note;
- procedure note;
- assessment note;
- consultation note;
- discharge/after-care note;
- referral or clinical letter;
- other specialty-specific documents.

A Visit may have multiple documents.
A document may reference one Visit and one template version when template-driven.

Document storage must distinguish:
- structured references to canonical facts;
- authored narrative text;
- document status;
- document version;
- author/recorder;
- attestation where required;
- amendment/supersession relationship.

The document must not copy the complete medical record or silently become the only place where clinical facts exist.

## 7. Required document lifecycle

Conceptual lifecycle:
Draft → Final → Attested where required → Amended/Superseded.

Rules:
- Draft may be edited by authorized users.
- Final marks a completed clinical documentation version.
- Attested records an explicit clinical attestation when policy requires it.
- Amendment creates a new version while preserving the prior version.
- Supersession changes current applicability without erasing history.

A signed/final clinical document must not be silently overwritten.

## 8. Visit closure and template validation

Gate 01 remains owner of Patient Flow lifecycle.
Gate 05 supplies the clinical validation needed before the Visit is handed to Patient Flow for pending-close.

Clinical completion validation has two layers:

Layer A — universal clinical minimums
- enough clinical information to constitute a valid clinical interaction according to the Visit type;
- required procedural/execution documentation where a procedure was performed;
- required next-step decision where applicable.

Layer B — template-specific requirements
- specialty-required findings;
- required observations/measurements;
- required assessment elements;
- required patient decision;
- required procedure note;
- required attestation.

No single rigid universal form is imposed on every specialty.

## 9. Bounded template evaluator

Gate 05 should implement a bounded template evaluator, not a generic cross-domain rules engine.

Allowed responsibility:
- determine visible fields;
- determine template-required fields;
- evaluate simple local conditional requirements;
- validate controlled field values;
- report missing clinical completion requirements.

Not allowed:
- owning Treatment Plan lifecycle;
- scheduling appointments;
- changing Follow-up status;
- mutating Financial or Inventory state;
- becoming the global business rules engine.

Cross-domain consequences are emitted through the explicit owning-domain contracts.

## 10. Narrative plus structured data

The target documentation model is hybrid.

Structured data is used where downstream clinical value exists:
- observations;
- measurements;
- problems;
- decisions;
- recommendations;
- patient decisions;
- procedure execution;
- clinically important coded facts.

Narrative remains available for:
- nuanced clinical reasoning;
- contextual explanation;
- exceptions;
- communication between clinicians;
- specialty content that is not yet worth forcing into a structured field.

The UX should not force the clinician to fill a database form for every sentence.

## 11. Legacy transition

Current Visit fields remain transitional until the canonical documentation path is runtime verified.

Migration principle:
- preserve existing clinical content;
- backfill only when semantic mapping is trustworthy;
- retain unmappable narrative as historical documentation;
- do not manufacture diagnoses or procedure executions from ambiguous free text;
- retire legacy fields only after verified canonical replacement.

This is an additive migration, not a destructive rewrite.

## 12. Clinician UX contract

The backend may contain many entities, but the clinician should continue to experience one Clinical Workspace.

Primary interaction:
Current Visit → required clinical work → decision/action → next step → finish.

Progressive disclosure:
- patient context first;
- relevant history one click away;
- specialty template fields only when applicable;
- advanced observations/measurements only when needed;
- complete Medical Record available without replacing the current Visit context.

The clinician should never need to understand which database domain owns an entity.

## 13. Commercial capability boundary

Template and Document capabilities can be controlled by entitlements.

Examples:
- basic visit template in Clinical Core;
- advanced measurement/template packs in Advanced Clinical;
- specialty templates in Dermatology/Aesthetics/Laser or other specialty packs;
- advanced document types as optional capabilities;
- AI-assisted documentation as an independent capability.

These commercial classifications do not create separate data models or separate clinical truth stores.

## 14. Implementation-design targets

Likely configuration structures:
- clinical template aggregate;
- published template versions;
- template section/field definitions;
- controlled observation-type definitions where needed.

Likely clinical structures:
- clinical observations;
- clinical documents and document versions;
- clinical problems;
- clinical assessments;
- clinical decisions;
- recommendations and recommendation items;
- patient decisions.

Existing structures to extend:
- clinic_visit_sessions;
- clinic_visit_procedures;
- audit_trail;
- Medical Files references;
- cross-domain source references where the receiving gate owns them.

Exact table names and foreign keys remain implementation-design work.

## 15. Design invariants

1. Template ≠ clinical truth.
2. Document ≠ medical record mega-table.
3. Visit ≠ Treatment Plan.
4. Recommendation ≠ Patient Decision.
5. Planned ≠ Scheduled ≠ Performed.
6. Authenticated account ≠ workforce professional identity.
7. Medical Record = projection/read model.
8. Gate 05 does not own Agenda, Treatment Plan, Follow-up or Procedure Catalog lifecycle.
9. No generic cross-domain rules engine is introduced.
10. Advanced capabilities remain architecturally supported regardless of subscription packaging.

## 16. Status and continuity

Gate 05: OPEN
Current-State Reconciliation: COMPLETE — V1
Canonical Entity Relationship & Lifecycle Design: COMPLETE — V1
Entity Design Review: COMPLETE — V1
Clinical Template & Documentation Architecture: COMPLETE — V1 / PROVISIONAL
Implementation Design: COMPLETE — FROZEN
Implementation: NOT STARTED
Schema migration: NOT STARTED
Production mutation: NONE

Next stage:
Clinical Workspace Target Interaction Design, followed by Gate 05 Implementation Design.

New CSAPI conversation resume point:
Gate 05 → Clinical Template & Documentation Architecture V1 → Clinical Workspace Target Interaction Design.

End of document.

## Final template/documentation freeze — 2026-09-30

The template and clinical-document architecture is now frozen for implementation.

The bounded template evaluator, immutable published template versions, documentation versioning, finalization/attestation semantics, and the distinction between canonical clinical facts and document snapshots are part of the Gate 05 Execution Contract and Verification Plan.

No generic cross-domain rules engine is introduced.
