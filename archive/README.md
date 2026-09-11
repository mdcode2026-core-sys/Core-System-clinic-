# CORE SYSTEM — Archive Governance

**Status:** Historical / Non-authoritative
**Reconciled:** 2026-09-11

This directory preserves historical implementation packages, prompts, roadmaps, handoffs, and execution records. These files are retained as evidence of what was planned or executed at the time and must not be treated as current architecture merely because they remain in the repository.

## Global-surfaces interpretation

For any historical document in this directory that uses terms such as **Workspace, Home, My Workspace, Sidebar, Role, Primary Work Context, Permission, Widget, Header, Patient Flow, Communications, Chat, Notifications, or My Settings**, the current interpretation is governed by:

`docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

In particular:

```text
Primary Role / Job Function
        ↓
Primary Work Context / Classification
        ↓
Role Workspace

Effective Permissions
        ↓
Authorized Capabilities
        ├── Sidebar
        ├── Widgets
        └── My Workspace

Home = independent global starting / awareness surface
Header = persistent global access layer
My Settings = personal account/preferences destination
```

Additional permissions do not redefine the user's Primary Role, Primary Work Context, or Role Workspace.

## Historical-integrity rule

Historical documents are **not rewritten merely to make their old wording look current**. Their original wording may be necessary evidence for understanding previous implementation decisions. When an old meaning conflicts with the current architecture, the current reconciliation document governs.

A historical document may be promoted to current authority only through an explicit new architectural decision.

## Archive discovery rule

Future agents must inspect archive material when reconstructing history, but must classify it as historical evidence before using it to make current architectural decisions.

**End of Archive Governance.**
