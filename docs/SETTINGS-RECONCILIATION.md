# Settings Reconciliation

Date: 2026-08-27

## Scope

Reconcile the existing Settings surface without creating new domains or authorization systems.

## Decisions

- Team & Access is presented as one grouped surface; Users, Roles, Overrides, Templates and My Settings remain the authoritative existing managers.
- Clinic Profile owns clinic identity, branding, contact and address data.
- System Preferences owns language, direction, timezone and currency.
- Rooms remain an operational resource and are presented separately from clinic identity.
- Procedures remain the existing Service Catalog/Master Library anchor; they are not duplicated.
- Subscription remains its own domain surface.
- Audit remains a separate activity/observability surface.
- Workspace is UX organization only and is never an authorization boundary.
- No new authorization engine, financial engine, Agenda engine or Patient Journey was introduced.

## Legacy cleanup targets

- Remove duplicate timezone/currency editing from Clinic Profile.
- Prevent misleading presentation of unsupported subscription activation.
- Make Role Template cloning generate a unique custom role key and provide explicit success/error feedback.
- Distinguish System Role permission viewing from Custom Role editing.
- Keep Create User distinct from account invitation semantics.

## Acceptance

Settings is considered reconciled when the grouped information architecture is visible in production, all existing managers remain reachable, no setting has two competing owners, and unsupported actions are not presented as completed functionality.
