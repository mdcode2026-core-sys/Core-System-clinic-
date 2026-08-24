# PJ E2E Demonstration Dataset

**Purpose:** persistent synthetic Patient Journey dataset for demonstrations, future administrative tuning, regression checks, and E2E validation.

**Tenant:** clinic-admin tenant associated with `xalkair@gmail.com`

**Seeds:** `PJ15_DEMO` and `PJ15_E2E_EXPANDED`

## Status

This dataset is the persistent synthetic baseline for the Patient Journey and subsequent administrative stages. It is intentionally richer than a simple happy-path fixture and is designed to be visible through the application UI as well as queryable in Supabase.

All records are synthetic. No real patient information is used.

## Dataset coverage

The expanded dataset contains 60 synthetic patients and associated journey records covering appointments, visits, procedures, treatment plans, treatment-plan stages, medical files, follow-ups and notifications.

The data is deliberately labelled and is not random production-like noise.

## Appointment scenarios

The appointment data repeatedly covers:

- scheduled
- confirmed
- arrived
- in_session
- completed
- no_show
- cancelled
- rescheduled

Visit types include:

- first_time
- consultation
- follow_up
- emergency

Cancellation scenarios include patient request, doctor unavailable, emergency, duplicate booking, financial reason and other.

Reminder states are varied for future notification/admin validation.

## Visit scenarios

Visit sessions cover:

- waiting after arrival
- active/in-consultation
- pending clinical closure
- completed
- cancelled
- no-show

Completed visits contain synthetic examination, findings, decision, diagnosis/treatment information, waiting time, session duration, feedback and satisfaction values. Insurance state and follow-up requirement are varied.

## Procedures

Completed visits are linked to synthetic procedures, including both single and multiple quantities. These procedure records are part of the same persistent E2E seed and can therefore be used by future clinical and administrative screens.

## Treatment Plans — integrated multi-stage coverage

Treatment-plan coverage was expanded after the initial dataset so that plans are not merely header records.

The dataset now contains **multiple synthetic treatment plans across selected demo patients**, including historical, active, paused, cancelled and future courses. Plans contain multiple ordered treatment stages through `clinic_treatment_plan_items` and are linked to source visits through the canonical treatment-plan/visit relationship.

The treatment-plan scenarios include:

- historical courses completed in full
- active multi-session courses
- courses containing completed and future stages
- future courses that have not started
- plans on hold
- cancelled courses
- restart/review candidates
- maintenance/follow-up courses
- multi-procedure plans

Treatment-plan items deliberately cover:

- planned
- in_progress
- completed
- skipped
- cancelled

Items contain procedure links, sequence numbers, planned dates, quantities and completion timestamps where applicable.

The date distribution intentionally provides both **historical stages and future scheduled stages**, allowing the application to demonstrate a patient's treatment journey over time rather than showing only a single current plan.

## Treatment Plan UI behavior

The standalone Treatment Plans workspace is expected to display the persistent plans when opened without a patient context. Patient context remains required for operations that semantically belong to a specific patient, such as creating or managing a plan from the patient journey.

This distinction is intentional:

- **Standalone workspace:** browse/review existing treatment plans across the tenant.
- **Patient context:** create, edit and manage a patient's treatment plan.

The standalone workspace was corrected so that the existence of demo plans is not hidden behind the patient-context creation message.

## Medical Files / Medical Photos

The expanded dataset covers the medical-file lifecycle:

- available
- processing
- pending
- failed
- archived

Failed uploads are represented as non-blocking journey scenarios. They do not invalidate the associated clinical journey.

## Follow-up scenarios

The dataset covers all currently supported follow-up types:

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
- open / in_progress / completed / skipped/cancelled outcomes
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

Priority, retry count and max retries are varied for future operational/admin validation.

## Failure and exception coverage

The dataset intentionally makes failure paths visible. It includes:

- patient no-show
- patient-request cancellation
- doctor-unavailable cancellation
- emergency cancellation
- duplicate-booking cancellation
- financial cancellation
- rescheduling
- waiting/in-session journeys
- pending clinical closure
- failed medical-file upload
- processing/pending medical-file states
- failed notification delivery with retries
- skipped/unreachable follow-up outcomes
- inactive synthetic patients
- cancelled and paused treatment courses
- skipped/cancelled treatment stages

Invalid database states are not inserted merely to manufacture errors. Where the database correctly rejects an invalid state, the dataset represents the corresponding real-world exception through the supported business state (for example, cancellation/rescheduling rather than an illegal overlapping booking).

## Data hygiene and lifecycle

All expanded records are identifiable through `PJ15_E2E_EXPANDED` in the appropriate notes, reason or metadata fields.

The original `PJ15_DEMO` dataset remains separately identifiable.

The temporary Stage 14 seed `STAGE14_E2E_TEST` was removed.

No real patient data is used. Synthetic contact values are used throughout.

These records are intentionally retained for subsequent PJ and administrative stages. They are the baseline demo/E2E data rather than disposable random test data.

## Intended future use

The dataset is intended to support future validation of:

- patient dashboards
- scheduling and reception
- queue management
- clinical workflow
- treatment plans
- medical files/photos
- follow-up and retention
- notifications
- reporting and analytics
- permissions and administrative controls
- operational KPIs

Any future stage that changes the Patient Journey data model should reconcile against this dataset rather than replacing it with unrelated random fixtures.