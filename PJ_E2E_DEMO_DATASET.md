# PJ E2E Demonstration Dataset

**Purpose:** persistent demonstration data for Patient Journey review and demonstrations.  
**Tenant:** clinic-admin tenant associated with `xalkair@gmail.com`  
**Seed marker:** `PJ15_DEMO`

## Design

This is not random test data. It is a deliberately labelled operational demonstration dataset intended to make the common daily clinic states visible from the clinic-admin account.

## Included scenarios

### Appointments

- Scheduled appointment
- Confirmed appointment
- Arrived appointment
- Completed appointment
- No-show appointment
- Cancelled appointment

### Clinical workflow

- Completed clinical visit with diagnosis, examination, findings and decision
- Visit with a procedure performed
- Active treatment plan linked to the visit
- Visit currently waiting after arrival

### Medical photos

- Available medical photo
- Failed photo upload state demonstrating the non-blocking path

### Follow-up

- Open automated 7-day follow-up
- In-progress manual follow-up
- Completed automated follow-up
- Cancelled manual follow-up
- Queued notification

## Data hygiene

All records belonging to this demonstration seed are identifiable by `PJ15_DEMO` in the appropriate notes/reason/metadata fields. This makes the dataset auditable and removable without guessing which records are demonstration records.

The previous Stage 14 temporary seed (`STAGE14_E2E_TEST`) was removed after the permanent demonstration dataset was established.

## Demonstration account

The requested clinic-admin account is `xalkair@gmail.com`. The dataset is created in that account's tenant so that it can be inspected through the normal application UI rather than through a separate test tenant.

No real patient information is used. All patient names, phone numbers and email addresses in this dataset are synthetic test values.
