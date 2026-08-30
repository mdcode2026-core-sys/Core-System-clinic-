# CORE SYSTEM — Scenario Register

**Date:** 2026-08-30  
**Status:** GOVERNED BASELINE  
**Purpose:** Permanent register of ideal scenarios and deferred difficult/exception scenarios.  
**Rule:** Difficult scenarios must not dilute, replace, or silently alter the ideal baseline.

## 1. Ideal scenario baseline

The current baseline contains 42 normal/ideal clinic-operation scenarios covering the complete Enterprise clinic model.

### Patient entry
1. New patient first contact and identification.
2. Existing patient recognition.
3. Walk-in patient registration and routing.
4. Pre-booked patient arrival/check-in.
5. Pre-booking information request.
6. Service/procedure selection and appropriate next action.

### Booking and capacity
7. Standard appointment booking.
8. Booking with provider availability.
9. Booking requiring room/resource.
10. Booking requiring specific device.
11. Booking requiring provider + room + device simultaneously.
12. Appointment confirmation and communication.
13. Normal rescheduling.
14. Normal cancellation.

### Clinical journey
15. Entry into clinical visit.
16. Doctor assessment.
17. Specialist-performed appropriate service.
18. Clinical decision creates Treatment Plan.
19. Multi-stage/multi-session Treatment Plan.
20. Treatment stage produces Next Action.
21. Next Action requires future appointment.
22. Procedure/session advances Treatment Plan.
23. Treatment Plan planned completion.

### Commercial/service
24. Procedure selected from Medical Master/Service Catalog.
25. Individual Service sale.
26. Multi-service Package sale.
27. Configured Offer/Discount application.
28. Package linked to financial commitment.
29. Normal patient payment.
30. Installment payment against financial commitment.

### Insurance/finance
31. Insured patient, payer/coverage and responsibility determination.
32. Claim-ready service information.
33. Claim reconciliation and remaining patient responsibility.
34. Operating expense recorded separately from patient revenue.
35. Supplier obligation and payment recorded.
36. Collected revenue used for downstream financial attribution.

### Workforce/resources
37. Working pattern contributes to operational availability.
38. Leave/absence affects availability and planning.
39. Procedure matched to competence/qualification and authorization.
40. Procedure consumption reflected in resources/inventory.

### Continuity/coordination
41. Domain event creates operational work for an authorized actor, who completes it without changing source-domain ownership.
42. Completed visit produces appropriate follow-up/next journey action and continuation.

## 2. Ideal end-to-end chain

`First Contact → Patient Identity → Service/Procedure → Booking → Capacity Check → Confirmation → Arrival → Patient Flow/Visit → Clinical Decision → Treatment Plan → Next Action → Appointment → Procedure/Session → Financial Commitment → Payment/Insurance → Resource Consumption → Follow-up → Next Journey Action → Completion`

## 3. Completion gate for ideal scenarios

A scenario is documentation-complete only when:

- ownership is explicit;
- source of truth is explicit;
- actor and authorization are explicit;
- UX/work surface is explicit;
- cross-domain handoff is explicit;
- result and next state are explicit;
- audit requirements are explicit;
- historical conflicts are classified;
- acceptance evidence is defined.

## 4. Future difficult/exception scenario register

The following scenarios are intentionally deferred until the ideal baseline is repaired and accepted:

1. Late patient arrival.
2. No-show.
3. Same-day cancellation.
4. Provider absence.
5. Specialist absence.
6. Staff absence affecting multi-function coverage.
7. Room unavailable.
8. Device unavailable.
9. Provider + room + device conflict.
10. Emergency appointment insertion.
11. Appointment overrun.
12. Patient waiting beyond expected time.
13. Queue priority conflict.
14. Treatment Plan changed after one or more completed sessions.
15. Treatment Plan paused/resumed.
16. Package cancellation.
17. Package partial refund.
18. Transfer of package/session entitlement.
19. Failed payment.
20. Partial payment dispute.
21. Overdue installment.
22. Refund or financial adjustment.
23. Insurance rejection.
24. Partial insurance coverage.
25. Coverage expired between booking and visit.
26. Claim correction/re-submission.
27. Stock shortage before scheduled procedure.
28. Unexpected stock consumption during procedure.
29. Supplier delay.
30. Partial receiving.
31. Supplier invoice discrepancy.
32. Workforce leave overlaps existing appointments.
33. Official holiday changes capacity.
34. Conference/seminar creates availability change.
35. Temporary delegation.
36. Multi-role permission conflict.
37. User can view but cannot execute.
38. Request sent to unauthorized recipient.
39. Handoff rejected/returned.
40. Work item becomes overdue/escalated.
41. Communication delivery failure.
42. Patient portal request requiring internal action.
43. Patient transfer between providers.
44. Cross-clinic patient context where permitted.
45. Duplicate patient risk.
46. Duplicate booking risk.
47. Audit dispute requiring reconstruction of events.
48. Contradictory financial/clinical records requiring reconciliation.
49. Resource becomes unavailable after booking.
50. Cancellation caused by workforce/resource failure.
51. Clinical action requires administrative follow-through.
52. Administrative request requires clinical review.
53. Financial exception requires management review.
54. Conflicting simultaneous operational requests.
55. Automation generates work that is already completed.
56. Automation failure leaves work unassigned.
57. Escalation reaches a user without the required authority.
58. Advanced skill/qualification mismatch.
59. Cross-domain event arrives out of order.
60. Recovery after partial transaction completion.

## 5. Rule for difficult scenarios

When a difficult scenario exposes a problem, the problem must be traced back to the ideal contract that should have governed the normal path.

Do not create a one-off exception architecture merely to make the difficult scenario pass.

## 6. Change control

The 42 ideal scenarios and this difficult-scenario register are governed project records. Any addition, removal or semantic change must be documented as an explicit change/superseding decision.
