# CORE SYSTEM — AI Engineering Control & Continuity

Status: GOVERNING
Effective: 2026-09-23

## 1. Purpose

This document defines how the AI team stays aligned across work, phases and new conversations.

## 2. Sources of truth

Use this order:

1. Approved product decisions and the Founder's current decisions.
2. ENGINEERING_CONSTITUTION.md and applicable governing architecture documents.
3. Implemented repository state on the relevant authoritative branch.
4. Live Supabase state for database and runtime facts.
5. GitHub Actions and other executable verification evidence.
6. Current work-package and handoff records.
7. Historical documents as evidence only.

A document cannot override executable reality by declaration alone.

## 3. Work package rule

Work is handled as a work package, not as a loose conversation task.

Each package must have:

- objective;
- owner function;
- allowed scope;
- forbidden scope;
- acceptance conditions;
- required evidence;
- current status;
- next action.

No new implementation starts from an unbounded request such as "fix everything".

## 4. Decision control

The AI Engineering Leader decides normal engineering execution.

The Founder decides product and other reserved owner matters.

When a new material decision is discovered:

1. isolate the affected work;
2. explain the decision plainly;
3. give the consequences and realistic choices;
4. wait only if the decision is reserved to the Founder;
5. continue all unaffected work.

A technical discovery must not be silently turned into a product decision.

## 5. Verification control

Work is not complete because code was written.

The Leader must ensure the required chain for the work:

Implement → Test → Verify → Reconcile → Document → Close

Verification must use the exact candidate being accepted.

Do not weaken, delete, rename, skip or relabel failed evidence to obtain closure.

## 6. Branch and change control

Use one working branch for one coherent work package when a branch is needed.

Do not create a branch for every tiny fix.

Do not create parallel branches for overlapping ownership.

Do not mix unrelated domains into one package merely to reduce branch count.

When the package closes, obsolete branches are cleaned up according to the repository rules.

## 7. Cross-domain findings

When work in one area reveals a problem elsewhere, classify it as:

- required dependency;
- verification defect;
- unrelated defect;
- future work.

Only required dependencies and narrowly necessary verification corrections may enter the current package.

Everything else remains separately owned.

## 8. Conversation continuity

A new conversation is a new session of the same engineering organization.

The system must never depend on chat memory alone.

Before a conversation is closed, the Leader updates the current handoff/current-state record with:

- current objective;
- completed work;
- verified evidence;
- failed evidence;
- active work package;
- open decisions;
- exact next action;
- forbidden actions;
- relevant repository, database and runtime references.

## 9. Keyword entry rule

CSAPI is a continuity command, not a request to guess the current state.

When a new conversation starts with CSAPI, the AI must:

1. read the governing AI engineering documents;
2. read the current CSAPI handoff and master-state records;
3. inspect current GitHub state;
4. inspect live Supabase/runtime state when relevant;
5. compare the records with reality;
6. identify the canonical continuation point;
7. continue only from that point.

It must not reopen closed work merely because an old document says otherwise.

## 10. Conflict rule

If two documents disagree, do not choose silently.

Classify the disagreement:

- historical vs current;
- documentation drift;
- repository state conflict;
- live database conflict;
- verification conflict;
- genuine architecture/product conflict.

Then correct the authority path before relying on the disputed statement.

## 11. Closure memory

A closed work package remains closed unless new evidence or an explicit decision reopens it.

Historical findings cannot become current scope merely because a new conversation is opened.

## 12. Conversation key rule

Keyword = where to enter.
Handoff = where we are.
Repository/runtime = what is actually true.
