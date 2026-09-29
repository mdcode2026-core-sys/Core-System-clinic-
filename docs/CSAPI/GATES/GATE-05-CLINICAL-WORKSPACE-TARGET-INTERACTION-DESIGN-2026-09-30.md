# CSAPI Gate 05 — Clinical Workspace Target Interaction Design
## Version 1 — 2026-09-30

Status: ARCHITECTURE / UX DESIGN — FROZEN / IMPLEMENTATION-READY INPUT
Purpose: Translate the comprehensive clinical architecture into a clinician-first workspace that remains simple, direct and fast.

## 1. UX north star

The clinician should think in clinical terms, not database terms.

Primary flow:
Understand → Examine → Assess → Decide → Act → Next Step → Finish

The interface may contain many backend entities, but the clinician should experience one Clinical Workspace.

## 2. Workspace structure

### A. Persistent clinical header

Always visible:
- patient name and clinic file number;
- age/sex or other core identity summary when available;
- current Visit type/context;
- assigned clinician;
- current status;
- high-priority clinical alerts only when supported by canonical data.

The header must remain compact.

### B. Current Visit context

Show:
- reason / clinical context;
- appointment or walk-in context;
- relevant service/procedure context where available;
- room/provider context only when useful to the clinical task.

Do not expose technical identifiers by default.

### C. Relevant history strip

Provide immediate compact access to:
- recent relevant Visits;
- active Problems/Diagnoses;
- previous related Procedures;
- current Treatment Plans;
- relevant Follow-up status;
- recent clinical Documents;
- relevant Medical Files/photos.

Use one-click expansion or a side panel for deeper history.

Do not render the entire Medical Record by default.

## 3. Main clinical work area

The central workspace is template-driven.

Base sequence:
1. Clinical context / history
2. Examination
3. Observations / Measurements
4. Assessment / Problems
5. Clinical Decision
6. Recommendation
7. Patient Decision
8. Procedure Execution when applicable
9. Clinical Documentation
10. Next Step / consequence review

Not every section is shown on every Visit.

Template applicability controls what appears.

## 4. Progressive disclosure

Default view shows only information needed for the current clinical interaction.

Advanced content is available through:
- expandable sections;
- contextual panels;
- history drawer;
- measurements drawer;
- document/details drawer;
- advanced actions menu.

Advanced capability must never be removed from the architecture because it is commercially optional.

## 5. Examination and observations interaction

Examination should feel like a normal clinical workspace, not a database form.

Template may expose structured fields when they produce reusable clinical value.

Free narrative remains available for nuanced clinical description.

Observation capture should support fast entry modes such as:
- text;
- numeric measurement;
- choice;
- boolean;
- range where applicable.

The clinician should not manually select a database entity type.

## 6. Assessment and problems

Assessment should provide a concise synthesis area with structured references where useful.

Problems/Diagnoses should be selectable from existing longitudinal problems or created when a genuinely new clinical problem is identified.

The UI should distinguish:
- observation/finding;
- assessment/interpretation;
- longitudinal problem/diagnosis.

This distinction is important for clinical accuracy and downstream analytics.

## 7. Clinical Decision

The Decision area is the clinician-authoritative point of the visit.

It should make visible:
- decision;
- rationale where useful;
- related problem/assessment;
- proposed action.

AI or automation may assist later, but the clinician remains the final authority.

## 8. Recommendation and Patient Decision

Recommendation entry should use direct clinical actions rather than generic free-text tasks.

Examples:
- recommend procedure;
- recommend medication or therapeutic action when supported by the future clinical capability set;
- recommend review;
- recommend Treatment Plan;
- recommend Follow-up.

Patient response control:
- Accept;
- Decline;
- Defer;
- Undecided;
- Partial acceptance where a composite recommendation contains independently decidable items.

The UI must visibly distinguish patient choice from clinician recommendation.

## 9. Procedure Execution

When a Procedure is selected:
- show the selected Procedure Definition name;
- show only clinically relevant execution fields;
- identify performer;
- allow required procedure-specific observations/notes;
- show execution state;
- show completed/not-performed/partial/stopped outcome when applicable.

Do not use quantity as a substitute for repeated execution events.

Procedure selection and Procedure execution must remain visually distinct:
selected ≠ planned ≠ scheduled ≠ performed.

## 10. Medical Photos / Files

Photos are first-class in the Clinical Workspace for specialties where they matter.

Interaction:
Patient/Visit → Add Photo/File → Continue Clinical Work

Upload must be non-blocking where technically possible.

The workspace should show:
- current/relevant photos;
- before/after or prior comparison when available;
- image details on demand.

Medical Files remains the canonical owner.

## 11. Full Clinical Record access

The clinician gets full-history access without leaving the current Visit mental context.

Preferred interaction:
Current Visit → History / Record drawer or dedicated overlay → return to Current Visit.

The full record view can provide:
- timeline;
- category filters;
- search;
- date range;
- procedure history;
- problem/diagnosis history;
- clinical documents;
- treatment plans;
- follow-up;
- relevant media.

It must remain a projection over canonical source domains.

## 12. Next Step / consequence panel

Before clinical completion, the workspace should summarize resulting actions.

Examples:
- no further action;
- Treatment Plan created/updated;
- Follow-up required;
- appointment required;
- operational action required;
- procedure completed;
- patient declined;
- deferred decision.

The panel must show destination ownership when useful, but not technical domain names.

The clinician sees the clinical meaning, while the system routes the consequence to the correct domain.

## 13. Finish behavior

Finish should be a single clear action.

Before handoff to Patient Flow pending-close:
1. Validate universal clinical minimums.
2. Validate applicable template requirements.
3. Validate procedure execution documentation when applicable.
4. Validate required patient-decision capture when applicable.
5. Validate required next-step/consequence information.
6. Apply attestation when the template/policy requires it.
7. Hand the Visit to the existing Gate 01 Patient Flow transition.

Do not create a second Visit completion engine inside Clinical.

## 14. Save / draft behavior

Clinical data entry must be recoverable.

Target behavior:
- explicit Save Draft;
- safe incremental persistence;
- clear unsaved/saved state;
- no silent loss of clinician input.

Autosave may be introduced where technically safe, but it must not create ambiguous finalization semantics.

Draft is not Final and is not Attested.

## 15. Responsive / device behavior

The Clinical Workspace must support:
- desktop clinical stations;
- tablet use;
- mobile-sized layouts for focused actions where needed.

Priority on smaller screens:
patient identity → current clinical task → required action → finish.

Secondary history and advanced content should collapse progressively.

## 16. Safety and usability rules

1. Critical patient context must not be hidden behind a deep interaction.
2. Patient choice must never look like clinician recommendation.
3. Planned/scheduled/performed states must never look identical.
4. Signed/final clinical documentation must visibly differ from drafts.
5. Current Visit must remain visually anchored during history exploration.
6. Errors must identify the clinical action that failed, not database terminology.
7. Technical IDs, tenant IDs and backend domain names remain hidden from normal clinical use.
8. The workspace must not make a clinician repeat data already held canonically elsewhere.

## 17. Commercial capability behavior

Core subscription:
- current Visit;
- core examination;
- basic findings/decision;
- basic procedure execution;
- core photos;
- core next-step handling.

Advanced / Specialty / Add-on capabilities may add:
- specialty templates;
- advanced observations and measurements;
- richer documents;
- advanced media/imaging;
- AI assistance;
- advanced analytics;
- interoperability.

The same Clinical Workspace should progressively unlock these capabilities rather than create separate incompatible clinician applications.

## 18. Architectural UX invariants

Clinical Workspace ≠ Clinical Domain.
Clinical Workspace ≠ Medical Record storage.
Visit ≠ Treatment Plan.
Recommendation ≠ Patient Decision.
Procedure Definition ≠ Procedure Execution.
Agenda ≠ clinical completion.
Patient Flow ≠ Clinical documentation.
Commercial entitlement ≠ data model.

## 19. Resulting target interaction

Entry
→ patient context
→ relevant history
→ template-driven clinical work
→ assess
→ decide
→ recommendation / patient decision
→ perform procedure if applicable
→ document
→ review consequences
→ validate
→ finish
→ existing Patient Flow pending-close

The clinician should be able to complete the normal path without opening advanced panels.

## 20. Status and continuity checkpoint

Gate 05: OPEN
Current-State Reconciliation: COMPLETE — V1
Canonical Entity Relationship & Lifecycle Design: COMPLETE — V1
Entity Design Review: COMPLETE — V1
Clinical Template & Documentation Architecture: COMPLETE — V1
Clinical Workspace Target Interaction Design: COMPLETE — V1 / PROVISIONAL
Implementation Design: COMPLETE — FROZEN
Implementation: NOT STARTED
Schema migration: NOT STARTED
Production mutation: NONE

Next stage:
Gate 05 Implementation Design — translate the approved architecture into an implementation-ready schema, action boundaries, migration plan, tests and verification contract.

New CSAPI conversation resume point:
Gate 05 → Clinical Workspace Target Interaction Design V1 → Gate 05 Implementation Design.

End of document.

## Final UX freeze — 2026-09-30

The Clinical Workspace target is now **FROZEN** for implementation.

The implementation contract preserves the central UX requirement: complex clinical structure stays in the backend while the normal clinician path remains direct and progressively disclosed.

The target interaction does not create a second Visit engine, Medical Record store, scheduler, Treatment Plan flow, Follow-up engine, or Medical Files store.
