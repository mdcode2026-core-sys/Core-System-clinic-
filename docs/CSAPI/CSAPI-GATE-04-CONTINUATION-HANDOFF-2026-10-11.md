> **Current verified checkpoint — 2026-10-15 (Workstream #1059):**
- Candidate SHA `30409ab6bfacb448393e0f5a8b119c4f9e446d4f` passed Workstream Verification [#1059](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38727561225): all 12 jobs completed successfully, including authenticated E2E, isolated Gate 04 DB verification, and Final gate. Engineering Governance also passed on this exact SHA.
- The prior rerun on candidate `bd362b46ceb8d89393808cf9896ad47701ef9336` ended with its authenticated-E2E job cancelled; it is not counted as a pass. The independent #1059 exact-head run is the accepted verification.
- Scenario 33 is PASS on branch-local isolated DB evidence; scenario 34 is PASS at the approved Gate 04 minimum handoff scope. Do not add a Follow-up return-reference field or lifecycle.
- Remaining WP-7 gaps: scenarios 26, 27, 29, 30, 31 and 32. Scenarios 26/27/29/30 depend on approved canonical resource-requirement, shared-capacity, and consumable contracts; do not invent these. For 31/32, inspect the existing Treatment Plan → Next Action → Operational Work/Agenda reference path and reconcile with the binding Gate 04 and Gate 02 ownership records before adding tests or changing behavior. Treatment Plan/clinical progression remains outside Gate 04 implementation ownership.
- WP-8 remains BLOCKED: read-only inventory still shows repository/hosted migration-history divergence and a live exclusion-constraint mismatch. Continue semantic classification and evidence gathering only; no hosted DDL/data/history writes, bulk migration, merge or production promotion.
- **Resume point:** first complete the read-only ownership/suppression review for scenarios 31–32 and establish whether a safe, direct Gate 04 assertion exists without reopening Gate 02 or implementing Gate 06 Treatment Plan scope. Then pursue WP-8 semantic lineage classification. Avoid broad implementation until a concrete, approved Gate 04 gap and root cause are established.
- PR #242 remains OPEN / DRAFT / NOT MERGED. This checkpoint update creates a new candidate and requires fresh exact-head Workstream Verification and Engineering Governance.

---

> **Session resume override — 2026-10-15 (verified exact code head; scope reconciled):** Code/documentation head `51b28b30b478590bb303988e90515f48fcbfdc17` passed Workstream Verification [#1050](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38718190150) (12/12 jobs including Gate 04 isolated DB, authenticated E2E and Final gate) and Engineering Governance [#310](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38718190151). The isolated DB lane includes two-session exclusive-resource concurrency (one winner, one exclusion conflict, one persisted appointment, cleanup PASS), denied Agenda create/update without grants, and audit-row confidentiality. Authenticated E2E confirms both Follow-up work and scheduled entry points open Agenda with the same tenant patient/request context.

**Scenario 34 is PASS at the approved Gate 04 minimum scope, not at a broader imagined contract.** Binding execution-contract §21 requires an active Follow-up appointment-request action to open the canonical Agenda form with the same tenant-scoped patient/request context; Agenda alone creates appointment state. Follow-up continuity/lifecycle is Gate 11-owned. Do not add an `agenda_event_id` field to `retention_followups`, duplicate appointment-reference storage or new Follow-up lifecycle behavior without a separately approved owner decision. A durable result-reference path is outside this frozen Gate 04 minimum.

**Resume point:** continue with scenario 33 (Agenda → Patient Flow/Visit) using a narrowly scoped, local-only verifier if direct inspection establishes an independent Gate 04 assertion. Reuse the canonical `clinic_visit_sessions.agenda_event_id` reference and existing arrival/visit authority; do not invent a new flow or scheduler. Do not run the broad Gate 02 longitudinal E2E as incidental coverage: the binding workstream contract explicitly suppresses it because Gate 02 is closed and its suite is mutation-capable. Scenarios 31–32 remain GAP and require ownership/suppression review before selecting a safe test. Scenarios 26/27/29/30 remain GAP pending owner-approved resource requirement, capacity and consumable contracts. Do not reopen timezone scenario 16 absent new failing evidence. WP-7 OPEN; WP-8 BLOCKED. PR #242 remains Draft/open/unmerged. No hosted Supabase schema/data/history mutation, merge, deployment or production promotion. This docs revision requires its own exact-head Workstream and Governance verification.

---

---

---

> **Verification result correction — 2026-10-14:** Workstream Verification #1026 on candidate `ec6b6572ed679c65f379f0b9d13a70ed263d4840` subsequently completed **PASS**: all 11 verification lanes and the final gate succeeded. Engineering Governance #286 also passed on that candidate. Scenario 19 is therefore PASS on direct branch-local DB evidence and the exact implementation candidate is fully verified. The later documentation-only candidate `369278b00dcbfb25f0f78e8925b1edb91f5fb3e0` started Workstream Verification #1027, but that run is superseded by this status correction; the new documentation candidate created by this correction requires its own exact-head verification. Do not report the current documentation head as verified until its run completes.

---

**Next action:** obtain exact-head Workstream Verification for this documentation correction. Once it passes, continue directly with frozen scenario 22 (Workforce change must not silently delete or rebook existing appointments). Do not return to timezone scenario 16 without new failing evidence.

---

> **Scenario 19 checkpoint — 2026-10-14:** Candidate `ec6b6572ed679c65f379f0b9d13a70ed263d4840` adds the direct overrun assertions in `tools/csapi-gate04-database-verification.mjs`. In Workstream Verification #1026, the isolated Gate 04 database lane passed, proving the past-ended appointment remains one `master_agenda_events` record in `in_session` with its planned times unchanged. The overall Workstream run is not yet PASS: the authenticated-E2E job remains in progress without available step/log evidence. Governance #286 passed on the candidate. WP-7 remains OPEN; WP-8 BLOCKED; PR #242 remains Draft/unmerged. No hosted DB/history mutation, merge, or production promotion.

---

**Next action:** obtain exact-head Workstream Verification for the documentation reconciliation. Then continue directly with frozen scenario 22 (Workforce change must not silently delete or rebook existing appointments). Do not return to timezone scenario 16 without new failing evidence.

---

> **Current verified checkpoint — 2026-10-13:** Branch head `36795c5ba406541e938b711d7a6532a4892d97b5` passed Workstream Verification #1024 and Engineering Governance #284. The current WP-7 matrix is the controlling scenario list. Existing isolated behavioral checks cover timezone boundaries, buffers, late arrival, Workforce schedule/approved leave, required/optional provider behavior, and Agenda lifecycle/conflict probes. A focused follow-on adds positive/negative configured Workforce procedure-capability assertions; it must pass exact-head CI before counting as verified. WP-7 remains OPEN for the explicitly listed remaining gaps; WP-8 remains BLOCKED pending complete migration-lineage reconciliation and release review. PR #242 remains Draft/open/unmerged; no hosted Supabase schema/data/history changes, merge, or production promotion.

---

> **Latest verified Gate 04 checkpoint — 2026-10-13:** Candidate `66a76b200d7871a5e4e1870727d9150b7fd5db4d` passed Workstream Verification [#1022](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38405509811) and Engineering Governance [#282](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38405509614). The dedicated timezone lane passed 12 behavior groups, including DST gap/overlap, non-hour offsets, explicit-offset handling, wall-clock duration arithmetic, and DST-aware tenant week bounds. Gate 04 static and isolated database lanes also passed. Scenario 16 is now verified at the boundary cases, not just a normal conversion. WP-7 remains OPEN for remaining scenario gaps; WP-8 remains BLOCKED for migration-lineage/release review. No hosted schema/data/history mutation, merge, or production promotion.

---

> **Latest Gate 04 continuation — 2026-10-13:** Last relevant-lane checkpoint `53624e96010816e763da9c98f39ea52932f02d8b`: Gate 04 static and isolated database lanes passed, including room/resource conflicts and combined provider-room-device feasibility. Workstream #1016 failed only in the unrelated authenticated-route E2E lane: `/financial-resources/financial-plans` redirected to login while repeated `destination stream closed early` errors appeared; a retry was started but superseded to continue the frozen Gate 04 scenario matrix. Governance #276 passed. Current candidate adds direct DB checks for 15-minute resource buffer exclusion and late-arrival preservation of planned start time. Exact-head verification pending. Timezone helper scenario 16 is already PASS and is not being reopened. WP-7 OPEN; WP-8 BLOCKED; hosted schema/data/history unchanged.

---

> **Latest verified checkpoint — 2026-10-13:** Candidate `94a2ad508aff6ffa49ddabefda1a8c2c85198b48` passed Workstream Verification #1015 and Engineering Governance #275. Timezone helper and availability-engine behavior are already verified; do not reopen timezone work unless new evidence fails. The next candidate adds isolated runtime probes against the actual conflict engine for room conflict, device/resource conflict, and combined provider+room+device feasibility. These are intentionally partial until protected mutation submission and authoritative requirement configuration are tested. Exact-head CI is pending for this new candidate. WP-7 remains OPEN; WP-8 remains BLOCKED; hosted schema/data/history unchanged.

---

> **Latest verified checkpoint — 2026-10-13:** Candidate `c88fbc376a5225db44d4a4897c67ccfe7ba633c5` passed Workstream Verification #1014 and Governance #274. Timezone helper behavior is PASS; actual availability-engine behavior is directly tested (scenarios 2 and 6 PARTIAL pending full booking-submit integration). The next candidate replaces direct-URL-only Follow-up E2E with actual Book appointment clicks from both work and scheduled views; exact-head CI is pending. The new E2E is read-only and does not create hosted appointments. WP-7 remains OPEN; WP-8 remains BLOCKED; hosted schema/data/history unchanged.

---

> **Latest verified checkpoint — 2026-10-13:** Candidate `1d2bf5c76eeda9f32907fc5b5362924c6850220e` passed Workstream Verification [#1013](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38387583325) and Engineering Governance [#273](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38387583360). The static lane executes the real timezone helpers and availability engine: scenario 16 is PASS; scenarios 2 and 6 are PARTIAL (engine decision proven, integrated appointment-submit behavior remains untested). DB clean replay, reschedule/no-show, and four-dimension conflict probes pass. WP-7 remains OPEN for remaining integrated scenarios; WP-8 remains BLOCKED. Hosted preflight/migration-lineage status unchanged; no hosted writes, merge or production promotion.

---

> **Latest verified checkpoint — 2026-10-13:** Candidate `c623912fcf6fa22c0d464a1a679e91a1e443bada` passed Workstream Verification #1012 and Engineering Governance #272. The Gate 04 static lane now executes the real tenant-local timezone helpers and passed conversion/round-trip/offset-preservation checks; scenario 16 is PASS. The next candidate adds isolated behavioral checks for provider availability and overlap rejection; exact-head CI is pending. WP-7 remains OPEN; WP-8 remains BLOCKED. Hosted Supabase schema/data/history remain unchanged, and no merge or production promotion occurred.

---

> **Latest verified checkpoint — 2026-10-13:** Candidate `731548e7d7bffcb3baf6c8430ca4b9bfd76d0563` passed Workstream Verification #1011 (attempt 2) and Engineering Governance #271. Attempt 1 had one authenticated dashboard-route timeout accompanied by repeated Next.js `destination stream closed early` errors; the single failed job was rerun and passed on the same SHA, while all other lanes passed first attempt. The next candidate adds executable timezone conversion/round-trip assertions to the Gate 04 static audit; exact-head CI is pending for that new code. WP-7 remains OPEN; WP-8 remains BLOCKED. Hosted preflight and migration boundaries remain unchanged: no hosted schema/data/history writes, no merge or production promotion.

---

> **Latest verified checkpoint — 2026-10-13:** Candidate `f7a3d828ff2d133ca4797d8153fd5758e077e1dc` passed Workstream Verification [#1010](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38384971238) and Engineering Governance [#270](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38384971284). The isolated DB lane passed clean replay, confirmed-appointment reschedule/status/audit, no-show/status/audit/provider-release, and patient/provider/room/resource-device conflict probes. Scenarios 7–15 and 28 now have direct branch-local evidence where classified PASS in the WP-7 matrix. Hosted read-only preflight found 0 active conflict pairs across the four exclusive dimensions; 13 time-overlap pairs shared no exclusive dimension. Hosted doctor/patient/room predicates still include completed appointments; the forward migration is branch-only. Current migration snapshot: `docs/CSAPI/GATES/GATE-04-WP8-MIGRATION-LINEAGE-SNAPSHOT-2026-10-13.json`. WP-7 remains OPEN for remaining scenario gaps; WP-8 remains BLOCKED for full lineage reconciliation and release review. PR #242 stays Draft/open/unmerged. No hosted writes, merge, or production promotion.

---

> **Current-state override — 2026-10-13 (read this before older historical sections):** The current branch head at this checkpoint is `972786d6569e5e596a6974a8c2e5fde155a6f727`. Workstream Verification [#1008](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38383256056) and Engineering Governance [#268](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38383256172) passed on that exact SHA. The isolated Gate 04 database lane passed clean migration replay and separate completed-release/active-overlap probes for patient, provider, room, and resource/device. Scenario 15 is now PASS for branch-local clean replay; hosted Supabase remains unchanged. Refreshed WP-8 snapshot: `docs/CSAPI/GATES/GATE-04-WP8-MIGRATION-LINEAGE-SNAPSHOT-2026-10-13.json`, committed in `972786d`. Latest repository counts: 240 SQL files / 234 canonical / 6 legacy; 292 hosted rows; 121 shared, 113 repository-only, 171 hosted-only, 12 shared-name mismatches; 42 repository-only and 99 hosted-only entries have no exact-name candidate. PR #242 remains Draft/open/unmerged. WP-7 remains OPEN for remaining scenario gaps; WP-8 remains BLOCKED for complete lineage reconciliation and release preflight. Any documentation update below creates a new candidate and requires exact-head CI. Do not repeat old status statements below as current evidence.

---

# CSAPI Gate 04 — Operational Continuation Handoff
**Record date:** 2026-10-12  
**Status:** ACTIVE — CONTINUE IMPLEMENTATION / VERIFICATION; NOT CLOSED  
**Gate:** Gate 04 — Agenda & Scheduling  
**Branch:** `csapi/gate04-agenda-implementation-2026-10-10`  
**PR:** #242 — OPEN / DRAFT / NOT MERGED  
**Last exact candidate verified in Actions:** `fe4f4d2b34b546540236102cd469946dcab4a59d`  
**Last Workstream Verification:** [Run #984](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38172836080) — FAIL  
**Last Engineering Governance:** [Run #244](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38172836077) — PASS

This is the operational resume record for the next conversation. It supersedes stale status statements in older CSAPI entry pages and PR #242's previous “owner decision required” wording only where this record explicitly updates them. It does not override the binding Gate 04 execution contract or erase historical evidence.

## 1. Entry instruction for the next conversation

When the user starts the next conversation with **CSAPI**, read this file first after the CSAPI Master State, Gate Plan, Master Engineering Prompt, execution handoff/ledger, and binding Gate 04 records. Then verify the live branch, PR, current SHA, latest Actions and changed files before making changes.

**Resume exactly from the Gate 04 verification/reconciliation point. Do not restart Gate 04 design, repeat completed work, switch gates, or report closure based on documentation alone.** Continue autonomously within the approved scope and timebox; request the owner only for a genuinely reserved product/architecture decision.

Required sequence:
1. Reconcile current GitHub PR/head and latest workflow runs against this record.
2. Fix the verification-lane classification described in §5 so a closed Gate 02 mutation-capable suite is not accidentally run for the approved Gate 04 Follow-up UI bridge.
3. Rerun exact-head Engineering Governance and Workstream Verification.
4. Investigate and repair any remaining relevant failure within the existing timebox/attempt limits. Do not mask, weaken, or silently bypass a failing test.
5. Obtain explicit evidence for the minimum Follow-up → Agenda handoff, all Gate 04 contract evidence, security and isolated local DB replay.
6. Independently review the diff and reconcile WP1–WP8, migration lineage, handoff, ledger, and PR description.
7. Keep PR #242 Draft until every required exit condition is proven. Do not merge, mutate hosted Supabase, edit hosted migration history, or promote Vercel under the current boundary.

## 2. Owner-approved Follow-up integration decision

On 2026-10-11 the Product Owner explicitly approved **Follow-up ↔ Agenda integration as part of the minimum required scope for Gate 04 closure**. This decision is no longer an open question and must not be asked again.

Minimum required behavior:
- An active Follow-up whose requested action is an appointment exposes a localized **Book appointment** action in both the operational list and scheduled view.
- The action opens the canonical Agenda form, carries the same tenant-scoped patient reference, and passes a Follow-up request context marker.
- Agenda visibly identifies the booking as initiated from a Follow-up appointment request and can clear the context.
- Appointment creation remains exclusively within Agenda's canonical mutation path and `master_agenda_events` source of truth.
- Follow-up remains the continuity/lifecycle owner. Gate 04 must not implement a second appointment store, Follow-up lifecycle engine, new Follow-up state transitions, or an unapproved durable foreign-key relationship.
- Gate 11 remains a separate gate. Its broader lifecycle is not reopened by this minimum booking handoff.

Relevant implementation commits already present in the branch include:
- `9483043f81b8a0911a1a83e9912001174336829f` — localized Follow-up booking action/context.
- `83dc5aedb01333deb6c526404a30aa67793ab9d3` — Agenda Follow-up context label.
- `bf85897636c2862f7028c5adec1f503db6b82add`, `cd025d2837b0798f528a05405b87b9959dab0046`, `94c894eeb492858674d90db9d6de5cb08291b9df` — operational/scheduled Follow-up booking handoff.
- `06c292d9ac4d10eaab19ea13b01390d87d49aa37`, `383a2f0cc86e209a4f4f33af130dad9980c87c9d`, `a2582751992e7f47fb5b102f0816da7453cda99a` — static assertions and route/context test corrections.
- Documentation decision reconciliation: `774e6f4772b85386865e7e9172c9b7b6270dde6f`, `d49ad35f82c658ff4e6648f132200d6b35e2c27c`, `619f39e03b30205e7297cf0d504b03a3aa134edf`, `fe4f4d2b34b546540236102cd469946dcab4a59d`.

## 3. Latest verification evidence — exact candidate `fe4f4d2b34b546540236102cd469946dcab4a59d`

Workstream Verification [#984](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38172836080) completed **FAIL**. The result must not be described as a pass or Gate 04 closure.

| Lane | Result | Evidence / interpretation |
|---|---|---|
| Build applicable lane plan | PASS | Lane plan generated. |
| Engineering | PASS | Typecheck, lint and build passed. |
| Gate 04 static | PASS | `csapi-gate04-static` passed, including the Gate 04 contract assertions available in that lane. |
| Gate 04 database | PASS | Isolated local Gate 04 DB/security/command/audit/rebooking verification passed. |
| Authenticated route E2E | PASS | Authenticated route suite passed. |
| Gate 03 identity static | PASS | Passed. |
| Gate 03 identity E2E | PASS | Passed on run #984; this supersedes the previous candidate's hosted registration timeout for this run only. |
| Cross-domain runtime | PASS | Read-only reconciliation lane passed. It is not proof of every cross-domain E2E scenario. |
| Changed-source i18n/catalogue parity | PASS | Changed-source audit and AR/EN catalogue integrity passed. |
| Global presentation static | PASS | Passed. |
| Patient Journey lane | **FAIL — classification/verification blocker** | The old `patient-journey` lane invoked `tools/csapi-gate02-longitudinal-e2e.mjs` and failed with `CSAPI_GATE02_LONGITUDINAL_E2E=FAIL|Error: Redirected to login from /patients`. Gate 02 is closed. This old suite is credential-backed/mutation-capable and is not the correct substitute for Gate 04's explicit minimum Follow-up → Agenda handoff test. |
| Global presentation runtime | **FAIL — runtime test blocker** | The lane ended in a Playwright `TimeoutError`; inspect full job logs and distinguish an environmental/authentication/session issue from a genuine regression before any repair. Do not assume the cause. |
| Final gate | FAIL | Correctly failed because required lanes failed. |

Run jobs and logs:
- Patient Journey job: `114569695260`
- Global presentation runtime job: `114569695337`
- Final gate job: `114570411299`

Latest Engineering Governance run #244 passed on the same candidate. The branch head at this checkpoint is `fe4f4d2b34b546540236102cd469946dcab4a59d`; re-fetch it before acting because any documentation update changes the candidate SHA.

## 4. Gate 04 implementation and owner decisions already established

### Canonical booking architecture
- Agenda is the scheduling module and appointment authority.
- `master_agenda_events` is the canonical appointment source of truth.
- Appointment CREATE/UPDATE/status/cancel/reschedule uses the canonical server mutation service and protected database command boundary.
- Reuse existing domain engines; do not introduce a second scheduler, calendar, queue, resource, Follow-up, or workflow engine.
- Provider requirements are conditional on Service/Procedure metadata; resource concurrency defaults to exclusive unless the owning domain explicitly defines otherwise.
- Appointment audit must be reconstructible for create/update/status/cancel/reschedule.
- Tenant-local wall-clock input is normalized server-side; stored times are UTC.
- No direct browser table-write bypass may be restored.

### Owner decisions recorded 2026-10-10
1. Booking a new patient routes to canonical patient registration and returns to Agenda with the registered patient selected.
2. Quick Appointment searches by patient name or phone and requires selecting the correct patient record; no manual patient-ID entry.

### Existing branch-only migration boundary
Four Gate 04 migrations are on the feature branch and must not be applied to hosted Supabase during this work:
- `20261010100000_csapi_gate04_agenda_command_boundary.sql`
- `20261010110000_csapi_gate04_agenda_audit_completion.sql`
- `20261010120000_csapi_gate04_agenda_write_acl_lockdown.sql`
- `20261010130000_csapi_gate04_agenda_permission_catalog_reconciliation.sql`

## 5. Root cause to resolve next: closed Gate 02 suite is being pulled into Gate 04 verification

The binding Gate 04 descriptor `docs/testing/workstream-contracts/csapi-gate04-agenda.execution.json` declares Gate 02 suppression because Gate 02 is closed and its broad legacy E2E is not safe as incidental coverage. Its `suppression_bypass_patterns.csapi-gate02-patient-journey` currently includes `^src/features/followup/`. The approved minimum Gate 04 handoff necessarily modifies Follow-up presentation files, so the bypass pattern prevents suppression and makes the old `patient-journey` suite run.

Next action:
- Inspect the descriptor, planner semantics and relevant workflow output.
- Adjust the suppression/bypass contract narrowly so the Gate 04-owned Follow-up appointment handoff is verified by Gate 04's own static and authenticated E2E coverage, while Gate 02 remains closed and its legacy mutation-capable suite is not incidentally invoked.
- Do not globally suppress legitimate future Gate 02 regressions or weaken required Gate 04 evidence. If the descriptor cannot express the intended narrow rule, update the lane selection logic and add an executable planner assertion.
- Commit the contract/planner correction on the existing Gate 04 branch, then rerun exact-head CI. This is a verification-contract correction, not a product-architecture decision.

## 6. Work-package disposition

- **WP-1:** Canonical mutation service/protected command boundary implemented; Gate 04 local DB lane passed on #984. Keep evidence reconciled with exact-head diff/security review.
- **WP-2/WP-3:** Procedure booking requirements, provider optionality and exclusive-by-default resource concurrency implemented; keep contract/DB evidence exact-head.
- **WP-4:** Audit boundary implemented; Gate 04 local DB verification passed; independent review still required.
- **WP-5:** Agenda/Quick Appointment convergence and canonical patient registration/return handoff implemented. The newly approved Follow-up request handoff is also implemented in operational and scheduled views; verify the full route/context behavior on exact head.
- **WP-6:** Binding descriptor/static/local DB checks exist; descriptor/planner closed-gate suppression has the specific defect in §5.
- **WP-7:** **OPEN** — integrated verification and independent review are not closed; run #984 failed.
- **WP-8:** **BLOCKED** — repository-vs-hosted migration history remains unreconciled; it is not permission to mutate hosted history.

## 7. WP-8 migration lineage — read-only evidence only

Previously recorded comparison: 235 SQL migration files in repository `main` versus 292 hosted migration-history rows; 102 repository version identifiers absent from hosted history, 160 hosted identifiers absent from repository, and 12 shared versions with different names. Latest recorded hosted version: `20260926105306`; latest recorded repository version: `20260926110000`.

These differences prove lineage is unreconciled, not that every missing identifier should be applied. Do not bulk-apply migrations, edit hosted history, perform hosted DDL/data changes, merge, or promote production as part of this Gate 04 continuation. WP-8 needs a separate evidence-backed lineage plan and release authorization.

## 8. Required work discipline and stop rules

- Follow the repository's governing AI Engineering Master Prompt, CSAPI Master State, Gate Plan, binding Gate 04 execution contract, Verification Plan, descriptor, and execution handoff.
- Execution order: VERIFY → PLAN → IMPLEMENT → BUILD/TEST → VERIFY → REVIEW → DOCUMENT → CLOSE.
- Focused investigation target: 25 minutes; hard stop at 30 minutes. After two unsuccessful attempts at the same proposed repair, stop and reassess rather than stacking speculative patches.
- Record failures immediately and classify them as code defect, test defect, environment/credentials, unrelated pre-existing issue, or scope/contract mismatch only when supported by evidence.
- Do not call pending work passed. Documentation-only commits create a new candidate and require exact-head verification.
- Do not touch `main`; keep PR #242 Draft; no merge, hosted Supabase mutation/history edits, or Vercel promotion.
- Before ending the next session, update this handoff, Gate 04 progress/evidence, execution ledger, CSAPI Master State/entry guidance, and PR description to reflect the exact latest candidate and outcomes.

## 9. Canonical files to read

1. `docs/AI-ENGINEERING/AI-ENGINEERING-MASTER-PROMPT.md`
2. `docs/CSAPI/CSAPI-MASTER-STATE.md`
3. `docs/CSAPI/CSAPI-GATES-PLAN.md`
4. `docs/CSAPI/CSAPI-DECISION-AND-ACTION-LEDGER.md`
5. `CORE_SYSTEM_EXECUTION_HANDOFF.md`
6. `CORE_SYSTEM_EXECUTION_LEDGER.md`
7. `docs/CSAPI/GATES/GATE-04-AGENDA-EXECUTION-CONTRACT-2026-09-29.md`
8. `docs/CSAPI/GATES/GATE-04-VERIFICATION-PLAN-2026-09-29.md`
9. `docs/CSAPI/GATES/GATE-04-IMPLEMENTATION-PLAN-2026-09-29.md`
10. `docs/CSAPI/GATES/GATE-04-IMPLEMENTATION-PROGRESS-2026-10-10.md`
11. `docs/CSAPI/GATES/GATE-04-WP1-WP6-EVIDENCE-RECONCILIATION-2026-10-10.md`
12. `docs/testing/workstream-contracts/csapi-gate04-agenda.execution.json`

**Current closure statement:** Gate 04 is NOT CLOSED. Continue from §5 on the existing branch and do not ask the Product Owner again whether minimum Follow-up → Agenda integration belongs in Gate 04; that decision is approved.


## 10. Exact-head verification checkpoint — 2026-10-12 (Workstream #996)

**Verified candidate:** `60940355af233c9023e4e06ea0ca4e5192226c79` (the next documentation commit will supersede this exact-head evidence and must be reverified).

- [Workstream Verification #996](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38176686805): **PASS** on this SHA. All 12 jobs passed, including Gate 04 static, isolated Gate 04 database, engineering, authenticated E2E, Gate 03 identity static/E2E, cross-domain read-only runtime, i18n/catalogue parity, global presentation static/runtime, and final gate.
- [Engineering Governance #256](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38176686800): **PASS** on the same SHA.
- Gate 04 static evidence explicitly passes `followup-appointment-action-routes-to-agenda`, `agenda-opens-booking-form-from-followup-request`, `followup-agenda-entry-keeps-owning-domain-context`, and `approved-followup-bridge-does-not-bypass-closed-gate02`.
- Authenticated E2E reports **3 passed**, including `Follow-up appointment request opens the Agenda booking form in patient context`.
- The prior global presentation runtime timeout did not reproduce: this lane now passes on #996. Record this as resolved for this candidate only; do not infer broader root cause beyond the evidence.
- The Gate 02 legacy patient-journey lane was not selected by the applicable plan; this is supported by the successful plan/final gate and the descriptor's narrow exception. Gate 02 remains closed.
- Current branch head at the last check: `60940355af233c9023e4e06ea0ca4e5192226c79`. PR #242 remains OPEN / DRAFT / NOT MERGED.

### Required next work — no closure yet
1. Perform the independent diff review against the Gate 04 execution contract and inspect WP1–WP8 reconciliation; record evidence rather than infer completion from green CI.
2. Resolve WP-8 only through a separate, evidence-backed repository-versus-hosted migration lineage plan. The previously recorded 235 repository SQL files versus 292 hosted history rows, 102 repo-only versions, 160 hosted-only versions, and 12 shared-version name mismatches remain a blocker until freshly reconciled. No bulk apply or hosted history edits.
3. Verify whether WP-7 and every other Gate 04 exit criterion are satisfied from current evidence; do not declare Gate 04 closed while WP-8 remains blocked.
4. Update PR description and all operational docs to the new candidate SHA, then run exact-head Workstream Verification and Engineering Governance again because documentation changes create a new candidate.

**Release boundary unchanged:** keep PR #242 Draft; do not merge, change hosted Supabase schema/data/history, or promote Vercel.
 

## Exact-head verification + independent review checkpoint — 2026-10-12

- Candidate SHA: `534474015383716e6517a7b0d26cc205864a493f`.
- [Workstream Verification #997](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38178282485): **PASS**, all 12 jobs including final gate.
- [Engineering Governance #257](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38178282396): **PASS** on the same SHA.
- Exact-head Gate 04 static audit: **59 checks passed, 0 failed**. The approved Follow-up bridge narrow Gate 02 suppression assertion passed.
- Exact-head isolated local database lane: clean migration replay, command ACL, direct table-write ACL, Agenda audit trigger/RLS checks, and authenticated command/audit flow passed. The flow specifically verified create + CREATE audit, scheduled→confirmed + STATUS_CHANGE audit, cancellation + reason/actor audit, and cancelled→scheduled rebooking + RESCHEDULE audit.
- Authenticated route E2E: **3 passed**, including the Follow-up appointment request opening the Agenda form with patient/request context. Cross-domain read-only, identity, i18n/catalogue parity, global presentation static/runtime, and engineering lanes also passed.
- Preliminary independent source review confirms the server action does not accept tenant/actor identity from submitted form data: mutation context is derived from the authenticated session; the dedicated server-only service-role client calls protected RPCs; SQL commands validate active tenant actor, effective permission, tenant-scoped references and expected state; ordinary authenticated/anonymous roles cannot call the RPC or write appointment rows directly. This is a source-level review, not a substitute for the complete Gate 04 security and scenario matrix.
- **Evidence boundary:** the DB lane does not itself prove every scenario listed in the Gate 04 Verification Plan. In particular, integrated provider-required/provider-optional cases, true concurrent competing-booking probes, and the full positive/negative lifecycle/cross-domain matrix still require explicit traceable evidence before WP7 can be called complete. Do not infer those scenarios from green generic lanes.
- WP1/WP4 protected command and audit probes now have direct local evidence for the tested flows; WP2/WP3/WP5 and WP7 must still be reconciled against each specific exit criterion and the missing scenario evidence. WP8 remains **BLOCKED** pending a fresh, evidence-backed repository-versus-hosted migration-lineage reconciliation.
- PR #242 remains OPEN / DRAFT / NOT MERGED. No hosted Supabase mutation/history edit, merge, or production promotion. This checkpoint is documentation-only; fresh exact-head CI is required for the resulting SHA.


## WP-8 read-only migration-lineage inventory — 2026-10-13

Snapshot artifact: `docs/CSAPI/GATES/GATE-04-WP8-MIGRATION-LINEAGE-SNAPSHOT-2026-10-13.json` captured against repository SHA `1ef5f0e86810c07e4de09989c140d13369d0b872` and hosted project `core-system-clinic` (ref `qaslsjyxjwvdoiczmhgq`). This is a read-only version-key inventory from the repository Git tree and Supabase migration-history listing; no hosted SQL, schema, data, or migration history was modified.

Fresh counts:
- Repository SQL migration files: **238** total; **233** with 14-digit migration versions and **5** shorter legacy-prefix files.
- Hosted migration-history rows: **292**.
- Shared exact 14-digit version keys: **121**.
- Repository-only version keys: **112**.
- Hosted-only version keys: **171**.
- Shared version keys with different names: **12**.

These counts supersede the older WP-8 headline counts in prior notes because the current snapshot is from the current branch head and explicitly separates 14-digit version keys from five shorter legacy filenames. They are **not semantic migration equivalence counts**: a version-key difference can reflect a rename/re-version/replay or an actually unrepresented change; only content/schema evidence can classify it. Matching version keys also do not prove file contents match what was applied. Therefore WP-8 remains **BLOCKED**.

Next: group candidates by normalized intent and compare repository SQL bodies, hosted history names, and current schema/catalog evidence in read-only mode; classify each discrepancy as equivalent/renamed, repo-only not applied, hosted-only untracked, name-only mismatch, or unresolved. Produce an approved remediation plan before any hosted change. Do not bulk-apply migrations, edit hosted history, or infer a safe order from names alone.


## Exact-head checkpoint — 2026-10-13 (Workstream #1000 / Governance #260)

- Candidate SHA: `548f050c2f6e18122b9350e655e74ea5ab54090e`.
- [Workstream Verification #1000](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38368309289): **PASS**, all 12 jobs including final gate.
- [Engineering Governance #260](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38368309490): **PASS** on the same candidate.
- Gate 04 isolated local DB clean replay, command ACL, table-write ACL, RLS/audit trigger checks passed. The command flow additionally proves cross-tenant patient rejection, normal UPDATE + UPDATE audit, stale expected-status rejection, CREATE audit, scheduled→confirmed STATUS_CHANGE audit, cancellation reason/actor audit, and cancelled→scheduled RESCHEDULE audit.
- Authenticated route E2E: **3 passed**, including Follow-up request opening the Agenda booking form with patient/request context. This test opens the form; it does not submit the appointment. Other green lanes do not prove all scenarios in the frozen Verification Plan.
- Added scenario-by-scenario evidence matrix: `docs/CSAPI/GATES/GATE-04-WP7-SCENARIO-EVIDENCE-MATRIX-2026-10-13.md`. WP-7 remains **OPEN** because provider/resource feasibility, conflicts, concurrency, timezone/buffer, workforce, full lifecycle, and Treatment Plan/Patient Flow integration cases remain unproven.
- Read-only live schema checks confirmed current appointment exclusion constraints and Workforce capability/availability tables; the historical `clinic_procedure_resources` table is absent. Do not resurrect or bulk-apply old migrations.
- Fresh exact-name migration triage counts differ from the earlier 82/80/82 note; record the method discrepancy as unresolved rather than treating candidate names as semantic equivalence. WP-8 remains **BLOCKED**.
- PR #242 remains OPEN / DRAFT / NOT MERGED. No hosted Supabase schema/data/history changes, merge, or production promotion. The documentation commit that follows creates a new candidate and requires exact-head verification.


## Constraint-policy finding — completed appointments vs. active conflicts (2026-10-13)

Read-only comparison of `src/domain/agenda/conflict.engine.ts`, repository migrations, and hosted `pg_constraint` definitions identified a concrete mismatch relevant to Verification Plan scenario 15:

- Application conflict queries exclude `cancelled`, `no_show`, and `completed`.
- Hosted `no_doctor_overlap`, `no_patient_overlap`, and `no_room_overlap` exclude only `cancelled` and `no_show`; `no_resource_overlap` also excludes `completed`.
- Repository migration `20260830030349_ajm_reality_audit_patient_overlap_constraint.sql` defines the patient predicate with `completed` excluded, unlike the hosted live definition.
- No repository migration SQL defining the hosted `no_room_overlap` constraint was found in the current migration tree.

**Classification:** Gate 04 scenario 15 is a confirmed application/schema policy mismatch, and the missing/different constraint definitions are additional WP-8 lineage evidence. The approved Verification Plan says completed appointments must not remain active conflicts; the frozen execution contract still prohibits silently weakening database integrity constraints.

**Next technical action:** prepare a forward-only migration that aligns all four exclusion predicates with the approved active-conflict lifecycle, retains exclusivity for active appointments, and represents `no_room_overlap` in the repository migration chain. Add a local DB probe that marks an appointment completed and verifies an overlapping new booking succeeds, then verifies a competing active booking is rejected. First perform a read-only preflight for existing overlapping active rows. Do not alter hosted schema/history or promote release until WP-8 lineage reconciliation and release authorization are complete.


## Exact-head checkpoint — 2026-10-13 (#1001 / #261) and newly confirmed constraint mismatch

- Documentation candidate `9bb87d9a338c99bcced0ac11b21f0740b2675de8`: [Workstream Verification #1001](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38369001203) **PASS — 12/12 jobs**; [Engineering Governance #261](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38369001190) **PASS**.
- New read-only review found scenario 15 is a concrete policy mismatch, not merely missing coverage: app conflict queries exclude completed appointments, but live doctor/patient/room exclusion constraints do not; resource constraint does. The repo patient migration defines a different predicate than the hosted live constraint, and the live room constraint has no matching definition in the repo migration tree.
- This is classified as a Gate 04 verification defect and WP-8 migration-lineage finding. Do not alter hosted constraints. Next prepare a forward-only migration, add a local test proving completed releases conflict while active appointments remain exclusive, and preflight existing data read-only. WP-8 must be reconciled before release.
- Scenario matrix updated with this finding. Gate 04 remains OPEN, WP-7 OPEN, WP-8 BLOCKED; PR #242 remains Draft/unmerged.


## Exact-head verification checkpoint — 2026-10-13 (#1004 / #264)

- Candidate SHA: `a24f6e70c659d3996c4e9bb5f0352220f2dc5dbc`.
- [Workstream Verification #1004](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38380111698): **PASS**; all required jobs completed successfully, including engineering, Gate 04 static, isolated local Gate 04 database, authenticated E2E, cross-domain runtime, Gate 03 regression lanes, i18n, presentation static/runtime, and final gate.
- [Engineering Governance #264](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38380111547): **PASS** on the same candidate.
- The local database lane cleanly replayed the branch migrations and passed the new lifecycle probe: scheduled → confirmed → arrived → in_session → completed; a same-patient overlapping appointment was then accepted; a further overlapping active appointment was rejected. The test also checks that all four doctor/patient/room/resource exclusion predicates mention completed, cancelled and no_show.
- This is direct evidence for the completed-appointment patient-conflict path and predicate consistency in the local schema. It does **not** yet independently prove completed-vs-active behavior for each doctor, room and resource dimension, nor does it close the other WP-7 scenarios.
- WP-7 remains **OPEN**. The scenario matrix remains authoritative for the unproven provider, room/resource, workforce, tenant-local time/buffer, concurrency, permissions, audit-disclosure, and cross-domain scenarios. Do not infer coverage from green aggregate CI.
- WP-8 remains **BLOCKED** pending evidence-backed repository/hosted migration-lineage reconciliation. The migration is branch-only; hosted Supabase schema/data/history are unchanged.
- PR #242 remains OPEN / DRAFT / UNMERGED. No merge, hosted database mutation/history edit, or production promotion.
- Next action: continue WP-7 scenario evidence work within the frozen Verification Plan, prioritizing direct, deterministic local database probes for the missing conflict/resource/provider/permission cases, while separately classifying WP-8 lineage discrepancies read-only. Do not add another broad implementation change until the next concrete gap and its root cause are established.


## WP-7 scenario 15 extension — dimension-specific probes added; verification pending (2026-10-13)

- Extended `tools/csapi-gate04-database-verification.mjs` with separate provider, room, and resource/device scenarios. Each scenario drives a booking through scheduled → confirmed → arrived → in_session → completed, verifies a new overlapping booking on that same dimension can be created, and verifies a further active overlap is rejected.
- The probes seed distinct same-tenant patients and dedicated room/resource records so patient overlap does not mask provider/room/resource results.
- The existing patient-dimension scenario remains in place. The four constraint-definition assertions remain as a separate structural check.
- **Evidence status remains PARTIAL / PENDING exact-head CI.** These new probes are implementation, not evidence of success until the local database lane passes on this exact revision. Do not upgrade scenario 15 to PASS beforehand.
- The most recent documentation-only candidate `b89a408234aac26e707d22f60152bbf59eac0f0c` had a passing Gate 04 database lane but failed the unrelated global presentation runtime lane while waiting for `global-header` visibility after repeated “destination stream closed early” errors. The targeted retry was initiated; no retry result is assumed here.
- Scope remains Gate 04 WP-7. WP-7 stays OPEN pending exact-head results and remaining scenarios; WP-8 stays BLOCKED. Branch-only changes: no hosted Supabase mutation/history edits, PR merge, or production promotion.

## Exact-head verification addendum — 2026-10-15 (SHA `f00a1d0e146d7ef9b5f99da55f563cb776227daf`)

- Workstream Verification [#38721803811](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38721803811), retry attempt 2, completed **PASS** on the exact SHA above; all 12 jobs, including the final gate, succeeded. Engineering Governance [#38721803849](https://github.com/mdcode2026-core-sys/Core-System-clinic-/actions/runs/38721803849) also passed on this candidate.
- The previously failing Gate 03 authenticated identity E2E now passed: authenticated login, registration without national ID, `REVIEW_REQUIRED` / `CREATE_NEW` resolution, authoritative patient search, and identity-preserving demographic update. The earlier `PATIENT_DATABASE_ERROR` / statement timeout did not recur in this run; this supports recording the retry as PASS, not a claim that all possible database latency is eliminated.
- The authenticated route E2E passed all 4 tests, including Follow-up → Agenda retaining the same patient and request context. Next.js emitted `destination stream closed early` messages during the run, but the Playwright suite reported `4 passed` and the job completed successfully; retain these messages as a runtime observation, not a test failure.
- Gate 04 isolated local database verification passed on this exact SHA, including clean local migration replay, security/ACL/RLS/audit checks, authenticated Agenda command audit flow, Agenda → same-tenant Visit / canonical D3 queue bridge without duplicate appointment, and concurrent exclusive-resource booking. The two independent command sessions yielded one winner, one exclusion conflict, and exactly one persisted appointment; cleanup passed.
- A verifier-only permissions fixture repair was included in the preceding implementation commit: required standard permission keys are restored inside the local rollback-only verification transaction. This is not a schema migration or persistent hosted database change.
- These results are branch/local-candidate evidence only. They do not reconcile repository-vs-hosted migration lineage or prove the hosted database was changed. No hosted Supabase mutation, PR merge, or production promotion occurred. PR #242 remains OPEN / DRAFT / UNMERGED.
- Gate 04 remains OPEN: WP-7 scenario gaps remain as classified in this matrix; WP-8 remains BLOCKED pending read-only, evidence-backed migration-lineage reconciliation. Do not infer closure from the green aggregate workflow.


## WP-8 read-only refresh — 2026-10-15 (candidate `bd362b46ceb8d89393808cf9896ad47701ef9336`)

**Method:** Re-read the repository Git tree at the stated candidate and the hosted Supabase migration-history listing for project ref `qaslsjyxjwvdoiczmhgq`. Then ran read-only `SELECT` against `pg_constraint` to inspect live exclusion-constraint definitions. No hosted DDL, data, or migration-history changes were made.

**Fresh inventory:** 241 repository SQL files; 235 filenames with canonical 14-digit version prefixes; 6 legacy/noncanonical SQL filenames; 292 hosted migration-history rows; 121 shared exact version keys; 114 repository-only version keys; 171 hosted-only version keys; 12 shared version keys with different names. Exact-name matches across differing version keys are candidate correlations only (71 repository-only names and 72 hosted-only names have a counterpart); they are not evidence of equivalent SQL or effects. These figures supersede the older inventory counts for this candidate, not the older candidate's immutable snapshot artifact.

**Confirmed live Gate 04 lineage boundary:** the newest canonical repository migration is `20261015100000_csapi_gate04_audit_read_policy_lockdown`; the newest hosted migration-history version returned is `20260926105306`. Thus the repository's Gate 04 forward migrations dated 2026-10-10, 2026-10-13, and 2026-10-15 are not recorded as applied in the hosted history. Do not apply them or edit hosted history as part of this read-only reconciliation.

**Live schema mismatch re-confirmed:** `no_doctor_overlap`, `no_patient_overlap`, and `no_room_overlap` exclude only `cancelled` and `no_show`; `no_resource_overlap` also excludes `completed`. This differs from repository migration `20261013100000_csapi_gate04_completed_appointment_conflict_policy.sql`, which excludes `completed` for all four dimensions. Therefore local candidate PASS for scenario 15 does not establish hosted parity. The live definitions are evidence for WP-8 remediation planning, not authorization to change the hosted database.

**Disposition:** WP-8 remains **BLOCKED** pending semantic classification of the 114 repository-only keys, 171 hosted-only keys, 12 same-version name mismatches, and relevant live schema drift. No bulk migration, history repair, merge, or production promotion is authorized by this inventory. Gate 04 remains OPEN. The documentation commit requires fresh exact-head Workstream Verification and Engineering Governance.
