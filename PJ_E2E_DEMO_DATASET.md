# PJ E2E Demonstration Dataset

**Purpose:** persistent synthetic Patient Journey dataset for demonstrations, future administrative tuning, regression checks, and E2E validation.  
**Tenant:** clinic-admin tenant associated with `xalkair@gmail.com`  
**Core seed:** `PJ15_DEMO`  
**Expanded seed:** `PJ15_E2E_EXPANDED`

## Dataset scale

The expanded dataset adds **60 synthetic patients**, **60 appointments**, **60 visit-session records**, notification scenarios, treatment-plan lifecycle records, medical-file lifecycle records, and follow-up lifecycle records. It is deliberately labelled and is not random production-like noise.

## Appointment scenarios

The 60 appointments deliberately cover the canonical appointment state machine repeatedly:

- scheduled
- confirmed
- arrived
- in_session
- completed
- no_show
- cancelled
- rescheduled

It also covers the supported visit types:

- first_time
- consultation
- follow_up
- emergency

Cancellation reasons include patient request, doctor unavailable, emergency, duplicate booking, financial reason, and other. Reminder flags are varied to support future notification/admin testing.

## Visit scenarios

Visit-session records cover:

- waiting after arrival
- active/in-consultation
- pending close
- completed
- cancelled
- no-show

Completed visits include synthetic examination, findings, decision, diagnosis/treatment text, waiting time, session duration, feedback and satisfaction scores. Some completed visits require follow-up and others do not. Insurance state is also varied.

## Procedures and treatment plans

Completed visits are linked to synthetic procedures, including single and multiple quantities.

Treatment plans deliberately cover every supported lifecycle status:

- draft
- active
- on_hold
- completed
- cancelled

Plans are linked back to their source visits through the canonical treatment-plan/visit relationship.

## Medical Photos / Files

The expanded dataset covers the medical-file lifecycle:

- available
- processing
- pending
- failed
- archived

Failed uploads are explicitly marked as a non-blocking scenario. They do not invalidate the associated clinical journey.

## Follow-up scenarios

The expanded dataset covers all currently supported follow-up types:

- post_visit_24h
- post_visit_7d
- reactivation_30d
- reactivation_60d
- reactivation_90d
- appointment_reminder_24h
- appointment_reminder_2h
- birthday
- custom

It also varies:

- manual vs automated execution
- open / in_progress / completed / cancelled-or-skipped lifecycle outcomes
- pending / sent / delivered / read / failed delivery states
- WhatsApp / SMS / email / in-app channels
- result/outcome and next-action states

## Notification scenarios

The notification queue contains deliberate examples of:

- queued
- processing
- sent
- failed with retry/error context
- cancelled

Priority, retry count and max retries are varied to support future administrative and operational screens.

## Failure and exception coverage

The dataset is designed to make failure paths visible rather than only happy paths. It includes:

- patient no-show
- patient-request cancellation
- doctor-unavailable cancellation
- emergency cancellation
- duplicate booking cancellation
- financial cancellation
- rescheduling
- active/waiting/in-session visits
- pending clinical closure
- failed medical-file upload
- processing/pending medical-file states
- failed notification delivery with retries
- skipped/unreachable follow-up outcomes
- inactive synthetic patients

A booking-overlap failure is represented through cancelled/duplicate-booking scenarios rather than by inserting invalid overlapping appointments, because the database deliberately rejects an invalid doctor/room overlap.

## Data hygiene

All expanded records are identifiable through `PJ15_E2E_EXPANDED` in the appropriate notes/reason/metadata fields. The original `PJ15_DEMO` core dataset remains separately identifiable.

The previous temporary Stage 14 seed (`STAGE14_E2E_TEST`) was removed. No real patient information is used. All names, phone numbers and email addresses are synthetic test values.

## Intended future use

This dataset is intentionally retained for subsequent PJ and administrative stages. It provides a stable visual and database baseline for testing dashboards, scheduling, reception, queue management, clinical views, treatment plans, follow-up administration, notification administration, reporting, permissions and other operational controls without requiring real patient data.
