# CORE SYSTEM — CSAPI Gate 03 — Patient Matching Policy Resolution
Date: 2026-09-22
Status: RESOLVED — PRE-IMPLEMENTATION VERIFICATION MAY CONTINUE
Authority: Gate 03 approved architectural baseline + Revised Implementation Design

## 1. Blocker

The initial patient-match-v1 parameters made EXACT_MATCH mathematically unreachable whenever national ID/card was absent:
- maximum with national ID absent and exact DOB present = 70;
- EXACT_MATCH threshold = 80.

This unintentionally made an optional government identifier a practical prerequisite for automatic identity matching.

## 2. Resolution

The 80-point threshold is retained. The national ID/card remains high-value evidence but is not required.

patient-match-v1 now has two controlled EXACT_MATCH paths.

### Path A — weighted high-confidence match

EXACT_MATCH when:
- score >= 80;
- at least 3 independent evidence classes contribute;
- no strong conflict.

### Path B — non-government-ID core-profile match

EXACT_MATCH is permitted without national ID/card only when all are true:
- exact DOB matches;
- exact first name matches;
- exact father name matches;
- exact family name matches;
- exact sex matches;
- normalized phone matches;
- no strong conflict;
- at least two additional corroborating evidence classes agree from available evidence such as mother name, email, or another governed non-government identifier with verified/current status;
- candidate is unique after candidate generation.

This is a deterministic high-confidence pattern, not a statement that any one of these fields is unique.

### REVIEW_REQUIRED

Use REVIEW_REQUIRED when:
- weighted score is 55–79;
- a meaningful candidate has a strong conflict;
- the complete core profile is present but Path B corroboration or uniqueness is insufficient;
- evidence is incomplete or ambiguous.

### NO_MATCH

Use NO_MATCH when score <55 and there is no review-triggering candidate or conflict.

## 3. Safety rules

- National ID/card absence never blocks registration.
- No single field determines identity.
- Phone/email equality is evidence, not proof.
- A matching phone alone can never produce EXACT_MATCH.
- Name equality alone can never produce EXACT_MATCH.
- Strong DOB/sex/national-ID conflicts never produce EXACT_MATCH.
- Ambiguous cases require authorized human review.
- Automatic merge is never part of registration matching.
- The matching policy version and decision evidence are auditable.

## 4. Age-only cases

When DOB is unavailable, age-at-registration evidence may contribute to scoring, but age-only matching cannot produce EXACT_MATCH.

If the non-DOB core profile is incomplete, the case remains REVIEW_REQUIRED or NO_MATCH according to the weighted score and conflict rules.

## 5. Why this is the correct correction

The correction does not solve the blocker by simply lowering the 80 threshold. It preserves the high-confidence weighted threshold and adds a narrowly constrained deterministic path for a complete non-government-ID patient profile.

This is consistent with healthcare patient-matching practice: matching uses multiple demographic attributes, duplicate warnings occur before creating a new record, and uncertain matches are routed for human review.

## 6. Verification implications

The implementation test contract must include:
1. complete patient with national ID → high-confidence path;
2. complete patient without national ID + two corroborating fields → non-ID EXACT_MATCH;
3. complete patient without national ID but insufficient corroboration → REVIEW_REQUIRED;
4. same phone with materially different demographics → never automatic EXACT_MATCH;
5. same names with different DOB → never automatic EXACT_MATCH;
6. strong DOB/sex conflict → REVIEW_REQUIRED or NO_MATCH;
7. ambiguous candidate set → REVIEW_REQUIRED;
8. genuinely distinct patient with overlapping contact data → creation remains possible after matching decision;
9. age-only candidate → never EXACT_MATCH;
10. Arabic/Latin normalized-equivalent names → matching follows normalization rules without changing identity semantics.

## 7. State transition

PRE-IMPLEMENTATION VERIFICATION
→ MATCH-POLICY BLOCKER RESOLVED
→ PRE-IMPLEMENTATION VERIFICATION CONTINUES
→ IMPLEMENT

No application code, migration, production database mutation, or deployment is authorized by this document alone.
