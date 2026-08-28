# Stage 5 — Unrelated Findings Register

Date: 2026-08-28

## Purpose

During Stage 5 closure we deliberately ran a full-repository ESLint diagnostic. This exposed pre-existing defects outside the Stage 5 implementation surface. They are recorded here so none is silently ignored.

The Stage 5-specific GitHub gate passed TypeScript, I18N audit/parity, Widget Catalog audit, Domain Surface audit, changed-surface ESLint and Production Build.

## Confirmed React defects — 12 errors

React's current ESLint guidance treats these diagnostics as legitimate correctness/performance issues and recommends restructuring state/effects rather than suppressing the rule.

1. `src/features/followup/followup-create-form.tsx:18` — URL parameters are copied into state synchronously inside an effect.
   - **Decision:** DEFERRED — Follow-up/PJ remediation.
   - **Reason:** Real effect/state design issue; requires choosing the canonical URL-context initialization pattern.

2. `src/features/followup/followup-shell.tsx:12` — `Date.now()` / `new Date()` are used during render for time-dependent buckets.
   - **Decision:** DEFERRED — Follow-up/PJ remediation.
   - **Reason:** Real purity issue; needs a stable time snapshot/source.

3. `src/features/patient-portal/patient-portal-invite-button.tsx:12` — channel/fallback state is normalized synchronously in an effect.
   - **Decision:** DEFERRED — Patient Portal remediation.
   - **Reason:** Real state-derivation issue; should be derived or normalized at the event/input boundary.

4. `src/features/reports/reports-shell.tsx:23` — reports are derived from `moduleKey` in an effect and stored in state.
   - **Decision:** DEFERRED — Reports remediation.
   - **Reason:** Real derivation issue; derive reports directly and reset dependent state in the module-change handler.

5. `src/features/settings/roles/EditRoleDialog.tsx:21` — role props are copied into local edit state in an effect.
   - **Decision:** DEFERRED — Settings/Roles remediation.
   - **Reason:** Real synchronization issue; requires an explicit edit-session initialization model.

6–7. `src/features/settings/templates/RoleTemplatesManager.tsx:11` — `Date.now()` occurs in the render path and `useTemplate` is named like a Hook, triggering `rules-of-hooks`.
   - **Decision:** DEFERRED — Settings/Templates remediation.
   - **Reason:** Both are real. Rename the event handler and generate IDs inside the event handler.

8. `src/features/settings/user/UserSettingsManager.tsx:41` — persisted workspace/sidebar state is synchronously copied in an effect.
   - **Decision:** DEFERRED — Settings/User Settings remediation.
   - **Reason:** Real initialization/precedence issue requiring deliberate state design.

9. `src/features/treatment-plans/TreatmentPlanWorkspace.tsx:17` — `refresh()` performs state updates and is invoked from an effect; dependency warning is coupled to it.
   - **Decision:** DEFERRED — Treatment Plans remediation.
   - **Reason:** Real fetch/effect lifecycle issue.

10–11. `src/features/workspace/EntitlementAwareWorkspaceShell.tsx:42–43` — two effects synchronously close the mobile sidebar on pathname/locale changes.
   - **Decision:** DEFERRED — Workspace Shell remediation.
   - **Reason:** Real shared-infrastructure issue; requires a stable navigation-state design to avoid RTL/mobile regressions.

12. `src/features/workspaces/OperationWorkspace.tsx:35` — `refresh()` updates state and is invoked from an effect.
   - **Decision:** DEFERRED — Operations/AJM remediation.
   - **Reason:** Real data-fetch/effect design issue requiring review against the Operations workflow.

## Warnings

- `src/core/entitlements/useEntitlements.ts:60` — missing `hasCapability` dependency.
- `src/features/medical-files/ui/MedicalFilesPanel.tsx:21` — missing `load` dependency.
- `src/features/treatment-plans/TreatmentPlanWorkspace.tsx:17` — missing `refresh` dependency.
- `src/features/medical-files/ui/MedicalFilesPanel.tsx:38` — `<img>` optimization warning.

**Decision:** DEFERRED to the respective domain remediation passes. These are not to be silenced; they should be corrected as part of the associated effect/performance refactor.

## Tooling console warnings

Warnings were emitted in the audit/tool scripts (`domain-surface-audit.mjs`, `i18n-audit.mjs`, `i18n-catalog-parity.mjs`, `medical-file-agent/index.mjs`, `widget-catalog-audit.mjs`).

**Decision:** KEEP. These are CLI diagnostics whose console output is intentional. They are not product defects. A future CI lint-policy cleanup may scope `no-console` differently for `tools/**`.

## Dependency/security findings

The GitHub install step reported 14 npm audit vulnerabilities (1 moderate, 13 high) and deprecated/transitive packages including `inflight`, `lodash.get`, `glob@7`, `uuid@9`, and `recharts@2.15.4`.

**Decision:** DEFERRED — dependency/security hardening. Do not run `npm audit fix --force` blindly; inspect the dependency tree and compatibility first.

## CI warning

GitHub reported that `actions/checkout@v4` and `actions/setup-node@v4` target Node 20 while the runner is forcing Node 24.

**Decision:** DEFERRED — CI maintenance. The workflow succeeded; action upgrades should be deliberate and separately validated.

## Final decision

No finding above is deleted or silently suppressed. The 12 React errors are confirmed real defects and remain assigned to their owning workstreams. They were not introduced by Stage 5 and were not opportunistically rewritten during Stage 5 because several require architectural decisions in their owning domains.

The tooling console warnings are intentionally retained. The dependency/security and CI findings remain explicit hardening backlog items.

**Stage 5 is not represented as globally defect-free. Its own implementation and applicable production-readiness gate passed.**
