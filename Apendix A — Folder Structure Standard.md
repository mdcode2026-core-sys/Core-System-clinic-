----

# Appendix A — Official Repository Structure Standard

## 1. Purpose

This appendix defines the official repository structure of CORE SYSTEM.

Its purpose is to eliminate ambiguity regarding:

- folders;
- routes;
- file locations;
- imports;
- architectural boundaries.

Every engineer must verify the repository against this standard before creating, moving or modifying files.

---

# 2. Repository Is the Authority

The actual repository structure is the only valid reference.

Documentation must follow the repository.

The repository must never be modified simply to match assumptions.

---

# 3. Path Verification Rule

Before referencing any file path, the engineer must verify that the path actually exists.

Never assume.

Never autocomplete.

Never invent folders.

Examples:

❌ Wrong

```
src/app/(dashboard)/dashboard/page.tsx
```

because it has not been verified.

✅ Correct

```
Verify repository

↓

Confirm path

↓

Use actual path
```

---

# 4. Creating New Files

A new file may only be created after answering all of the following questions.

Does this file already exist?

Does another file already perform this responsibility?

Does this file belong to the current phase?

Will it duplicate existing functionality?

Does it respect Vertical Slice Architecture?

If any answer is unknown,

implementation must stop.

---

# 5. Moving Files

Moving files is considered an architectural operation.

It requires:

Architecture review

Dependency verification

Owner approval

Documentation update

Never move files to make implementation easier.

---

# 6. Deleting Files

Deleting files requires verification that:

The file is unused.

The repository no longer references it.

Documentation is updated.

Rollback is possible.

Deleting files without verification is prohibited.

---

# 7. Folder Responsibilities

Every folder has one responsibility.

Example:

```
app/
```

Routing only.

```
core/
```

Core business infrastructure.

```
domain/
```

Business rules.

```
features/
```

Feature implementation.

```
shared/
```

Reusable components.

```
infrastructure/
```

External integrations.

Responsibilities must never overlap.

---

# 8. Route Verification

Before creating a route,

verify:

Current routing

Current layouts

Current groups

Current redirects

Protected routes

Public routes

Do not assume routing structure.

---

# 9. Layout Verification

Before modifying any layout,

verify:

Which routes use it.

Which components depend on it.

Which middleware interacts with it.

What redirects already exist.

Multiple redirect systems require careful coordination.

---

# 10. Middleware Verification

Middleware must be treated as critical infrastructure.

Before changing middleware,

verify:

Authentication flow

Protected routes

Public routes

Cookies

Redirect logic

Supabase session refresh

One incorrect redirect may disable the entire application.

---

# 11. Authentication Files

Authentication-related files must never be modified independently.

Always inspect together:

AuthProvider

Server Actions

Middleware

Supabase Client

Supabase Server

Protected Layout

JWT Claims

Database Functions

Authentication is one system.

Not isolated files.

---

# 12. Database Dependencies

Before modifying application code,

verify database dependencies.

Example:

Changing registration logic may affect:

auth.users

master_tenants

subscriptions

clinic_users

subscription_events

Database Function

Triggers

RLS Policies

Changing one layer without understanding the others is prohibited.

---

# 13. No Duplicate Routes

The repository must contain only one implementation of each route.

Examples:

One login page.

One register page.

One dashboard root.

Never multiple competing implementations.

---

# 14. Canonical Locations

Every important module should have one canonical location.

There must never be uncertainty about:

where Authentication lives;

where Dashboard lives;

where Database utilities live;

where shared components live.

Consistency improves maintainability.

---

# 15. Dependency Inspection

Before modifying a file,

inspect:

Who imports it?

What imports does it use?

What depends on it?

What breaks if it changes?

Dependency awareness is mandatory.

---

# 16. File Naming

Names must be:

consistent,

descriptive,

stable,

predictable.

Avoid abbreviations unless officially adopted.

---

# 17. Repository Validation

Before every major implementation,

perform repository validation.

Confirm:

Folder structure

Route structure

Authentication structure

Database layer

Current phase

Architecture consistency

Only then begin implementation.

---

# 18. Structural Changes

Structural changes include:

creating folders;

moving folders;

renaming folders;

renaming routes;

changing imports.

These require architectural approval.

---

# 19. Engineering Principle

The repository represents the current reality.

The engineer adapts to the repository.

The repository does not adapt to assumptions.

---

# 20. Final Principle

Whenever uncertainty exists regarding project structure,

the correct action is always:

Inspect first.

Never guess.

Never generate paths from memory.

Reality always wins.

---

