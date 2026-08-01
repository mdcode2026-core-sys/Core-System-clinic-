# DOCUMENTATION_CONSOLIDATION_PLAN.md

**Purpose:** Map every existing root-level document to the six official engineering documents required by `ENGINEERING_CONSTITUTION.md` (Chapter 4), and specify the exact action for each. Per Owner instruction: **historical documents are archived, never deleted.** This is a plan only — no file is moved, renamed, merged, or archived until approved.

**Target official document set:**
`MASTER_ROADMAP.md` · `ENGINEERING_CONSTITUTION.md` · `ARCHITECTURE_DECISIONS.md` · `DATABASE_SCHEMA.md` · `PROJECT_HANDOFF.md` · `CHANGELOG.md`

**Archive convention (proposed):** a root-level `/archive/` folder, files kept under their original name, e.g. `/archive/ANALYTICS_BUILD_PROGRESS.md`. Nothing is edited on the way in — archived files are frozen as historical record.

---

## Consolidation Table

| # | Filename | Current Path | Required Action | Reason | Depends On | Execution Order |
|---|---|---|---|---|---|---|
| 1 | `ENGINEERING_CONSTITUTION.md` | `/ENGINEERING_CONSTITUTION.md` | **Keep** | Already matches its own required name and is authoritative; no conflicting content found. | — | 1 |
| 2 | `PRODUCT_COMPLETION_ROADMAP_V2.md` | `/PRODUCT_COMPLETION_ROADMAP_V2.md` | **Rename → `MASTER_ROADMAP.md`**, then **Update** | This is the closest existing match to the required `MASTER_ROADMAP.md`. Update needed to (a) note the confirmed Section 8–16 gap as a documented open item rather than silently missing, (b) reconcile terminology with the historical Phase-based status in `CORE_SYSTEM_INDEX.md` (item 4 below) so one document is the single reference going forward. | Item 4 (Phase history must be folded in before this is final) | 4 |
| 3 | `CORE_SYSTEM_INDEX.md` | `/CORE_SYSTEM_INDEX.md` | **Split** | Two different things are currently mixed in one file: (a) durable principles/reference material — stays as a reference index, and (b) live phase-by-phase status history — this is exactly what `PROJECT_HANDOFF.md` is for. Splitting removes the Milestone-vs-Phase naming collision at its root. | — | 2 |
| 4 | *(new, produced from item 3's status section + roadmap history)* | `/MASTER_ROADMAP.md` (final form) | **Regenerate (merge)** | Reconciles the "Milestone" numbering (Roadmap) with the "Phase" numbering (Index) into one authoritative status, per your confirmation that Milestone 3 is current. | Items 2, 3 | 5 |
| 5 | `Handoff_Daily_Report_2026-07-29.md` | `/Handoff_Daily_Report_2026-07-29.md` | **Archive**, content folded into new `PROJECT_HANDOFF.md` | Dated snapshot files are exactly the pattern the Constitution's single-handoff-document rule exists to prevent. | Item 3 (status split) | 6 |
| 6 | `ANALYTICS_BUILD_PROGRESS.md` | `/ANALYTICS_BUILD_PROGRESS.md` | **Archive** | Task-complete per `CORE_SYSTEM_INDEX.md` (Phase 1A closed 2026-07-30); file itself still shows PENDING items — confirmed stale, superseded. | — | 3 |
| 7 | `QUEUE_DEBUG_PROGRESS.md` *(stray trailing space in filename — rename on archive to fix)* | `/QUEUE_DEBUG_PROGRESS.md ` | **Archive** | One-time debug log for a closed task; also produced the leftover `test_jwt_claims`/`test_queue_access` functions addressed in the security hotfix. | Security Phase A applied first (so the archive note can state the debug functions were cleaned up) | 7 |
| 8 | `QUEUE_FIX_PROGRESS.md` | `/QUEUE_FIX_PROGRESS.md` | **Verify, then Archive** | Lists PENDING items (e.g., "update database.types.ts") that are actually already done — confirmed live. Needs its status corrected to CLOSED before archiving so the historical record is accurate. | — | 3 |
| 9 | `REVISED_DESIGN_DOCUMENT_v2.md` | `/REVISED_DESIGN_DOCUMENT_v2.md` | **Archive as corrupted artifact**, not treated as a design doc | Contents are a raw Python script (accidentally committed instead of the intended output files), not documentation. Archiving preserves it for forensic reference without letting it mislead anyone reading root docs. | — | 3 |
| 10 | `supabase Data info.md` *(space in filename)* | `/supabase Data info.md` | **Archive**, replaced by new `DATABASE_SCHEMA.md` | Ad-hoc CSV paste of a schema snapshot; superseded by a properly generated, current schema doc. | New `DATABASE_SCHEMA.md` must exist first | 9 |
| 11 | `PROJECT_TREE.txt` | `/PROJECT_TREE.txt` | **Regenerate** | Stale — references files no longer present (e.g., "Appendix A/B", older handoff dates). Kept as a live-generated reference, not archived (it's a mechanical tree listing, not a historical record). | Items above should land first so the regenerated tree is accurate | 10 |
| 12 | `fix.sh` | `/fix.sh` | **Archive** (out of the active root, not deleted) | One-time patch script that rewrites 3 invoice files to a specific historical state; running it again by accident would silently regress current code. Kept for forensic reference only, clearly out of the executable path. | — | 3 |
| 13 | *(new)* | `/ARCHITECTURE_DECISIONS.md` | **Create** | Did not exist under this name. First entries: the Permission Template decision (this conversation) and a retroactive record of the 2026-07-29 tenant-model migration (`tenants`/`users`/`roles` → `master_tenants`/`clinic_users`), reconstructed from the Handoff report and live data, so it's not lost to history. | — | 2 |
| 14 | *(new)* | `/DATABASE_SCHEMA.md` | **Create (generate from live inspection)** | Did not exist under this name; replaces the ad-hoc CSV file (item 10). | — | 2 |
| 15 | *(new)* | `/PROJECT_HANDOFF.md` | **Create (merge)** | Single, living handoff document — absorbs the current content of `Handoff_Daily_Report_2026-07-29.md` and the still-open items from `QUEUE_FIX_PROGRESS.md`, going forward updated in place rather than as a new dated file each time. | Items 5, 6, 8 | 8 |
| 16 | *(new)* | `/CHANGELOG.md` | **Create (generate)** | Did not exist; reconstructable from migration file timestamps/filenames as a starting baseline, then maintained going forward per change. | Item 14 (schema doc should exist first, changelog references it) | 11 |

---

## Execution Order Summary (dependency-respecting)

1. Keep `ENGINEERING_CONSTITUTION.md` as-is (no action needed).
2. Create `ARCHITECTURE_DECISIONS.md` and `DATABASE_SCHEMA.md` — no dependencies, foundational for later items.
3. Archive `ANALYTICS_BUILD_PROGRESS.md`, correct-then-archive `QUEUE_FIX_PROGRESS.md`, archive `REVISED_DESIGN_DOCUMENT_v2.md`, archive `fix.sh` — all independent, no blockers.
4. Split `CORE_SYSTEM_INDEX.md` into (reference content stays) + (status content extracted).
5. Rename/update `PRODUCT_COMPLETION_ROADMAP_V2.md` → `MASTER_ROADMAP.md`, folding in the extracted Phase history from step 4.
6. Archive `Handoff_Daily_Report_2026-07-29.md`.
7. Apply Security Hotfix Phase A (so the QUEUE_DEBUG archive note is accurate), then archive `QUEUE_DEBUG_PROGRESS.md`.
8. Create `PROJECT_HANDOFF.md`, merging items 5–7.
9. Archive `supabase Data info.md` (now superseded by step 2's `DATABASE_SCHEMA.md`).
10. Regenerate `PROJECT_TREE.txt` (accurate now that the above is settled).
11. Create `CHANGELOG.md`.

**Nothing above is applied yet.** `ARCHITECTURE_DECISIONS.md` and `DATABASE_SCHEMA.md` (steps 1–2 of the sequence) are produced alongside this plan for your review, since they have no dependencies and are needed regardless of how the rest is sequenced. `MASTER_ROADMAP.md`, `PROJECT_HANDOFF.md`, and `CHANGELOG.md` are queued next, once you confirm this sequencing and the `CORE_SYSTEM_INDEX.md` split approach.
