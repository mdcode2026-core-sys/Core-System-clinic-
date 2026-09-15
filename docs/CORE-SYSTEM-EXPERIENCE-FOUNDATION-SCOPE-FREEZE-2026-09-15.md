# CORE SYSTEM — Experience Foundation Scope Freeze
## 2026-09-15

**Status:** BINDING WORK SCOPE FOR CURRENT CYCLE
**Applies to:** Experience Foundation F1–F4 only
**Implementation branch:** `feat/visual-design-constitution-f1-f4-2026-09-15`

## 1. Decision

The current work cycle is restricted to completing the approved **Experience Foundation F1–F4**:

- **F1 — Login**
- **F2 — Header**
- **F3 — Home**
- **F4 — Home → Workspace transition**

No unrelated application repair, technical-debt cleanup, database optimization, test-engine repair, or cross-domain investigation is part of the current implementation scope.

## 2. Explicitly frozen work

The following classes of work are frozen until Experience Foundation closure:

- patient creation/list visibility investigations;
- `clinic_patients` RLS/performance remediation follow-up;
- PatientForm save/refetch behavior investigation;
- `destination stream closed early` investigation;
- authentication/runtime failures outside the F1–F4 acceptance surface;
- unrelated Supabase/schema/migration changes;
- unrelated Communications, Chat, Agenda, Patient Journey, Patient Flow, module, permission, analytics, inventory, workforce, or financial fixes;
- broad technical-debt discovery or cleanup;
- redesign or repair of surfaces outside F1–F4.

These items are **not declared resolved**. They are deliberately quarantined so that the Experience Foundation can be completed without scope drift.

## 3. Testing and investigation boundary

No new test execution or unrelated investigation is to be initiated during this freeze by the current work cycle.

Existing validation evidence is retained as historical evidence only. It must not be interpreted as proof that unrelated runtime errors are harmless or resolved.

When the Experience Foundation is reopened for its final governed verification, only tests directly required by the F1–F4 closure contract may be executed. Unrelated failures discovered during that verification must be recorded and quarantined unless they directly block an F1–F4 acceptance criterion.

## 4. What remains active

Work may continue only when it directly advances F1–F4 toward closure, including:

- implementation corrections required by the approved Experience Constitution and Visual Design Constitution;
- visual consistency corrections within F1–F4;
- responsive behavior corrections for F1–F4;
- RTL/LTR, accessibility, focus, keyboard, and touch corrections directly within F1–F4;
- documentation and ledger reconciliation for F1–F4;
- preparation of the final F1–F4 closure evidence package.

## 5. Non-regression rule

The approved functional and architectural boundaries remain locked. Experience Foundation work must not be used as a reason to modify unrelated domain behavior, permissions, tenant isolation, database schema, or authoritative domain ownership.

## 6. Closure condition

Experience Foundation remains **OPEN** until its own governed closure evidence is complete. This scope freeze does not falsely close F1–F4; it establishes the only work permitted to reach that closure.

After F1–F4 closure, the quarantined technical issues may be resumed as a separate, explicitly governed workstream.
