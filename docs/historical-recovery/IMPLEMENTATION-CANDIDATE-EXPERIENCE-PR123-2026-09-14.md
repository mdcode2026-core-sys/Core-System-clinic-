# CORE SYSTEM — Historical Implementation Candidate Record
## PR #123 — ExperiencePage + Experience UI primitives
### 2026-09-14

**Source PR:** #123  
**Source branch:** `docs/ux-experience-constitution-work-contract-2026-09-14`  
**Classification:** HISTORICAL IMPLEMENTATION CANDIDATE — NOT AUTOMATICALLY PROMOTED

## 1. Source files
The source implementation changed:

- `src/app/(dashboard)/page.tsx`
- `src/shared/components/ui/experience.tsx`

## 2. Historical purpose
The branch introduced a reusable Experience presentation layer and a Home implementation intended to make Home a distinct overview/awareness surface rather than a full workspace.

The implementation included:

- `ExperiencePage`
- `ExperienceIntro`
- `ExperienceSection`
- `ExperienceMetricLink`
- `ExperienceContextCard`

The Home candidate used these primitives, retained permission-aware data loading for Agenda/queue statistics, and routed the user toward `/agenda` or `/workspace`.

## 3. Why this is not a blind promotion
The Home candidate still contains information and destinations that were later explicitly removed from the approved F1–F4/Concept 01 Home contract:

- Notifications and reminders as a Home section;
- Internal Communications as a Home section;
- Work Center as a Home section;
- Patient Portal information as a Home section;
- a general “Quick access” grouping that conflicts with the later Home exclusions.

It also routes “Today's appointments” to generic `/agenda` rather than carrying the later-required user/context-aware destination semantics. Therefore the full `page.tsx` snapshot is historical evidence and must not replace the current canonical Home implementation without a new governed plan.

## 4. Reusable primitive assessment
`src/shared/components/ui/experience.tsx` is materially different from the Home information architecture. It is a presentation primitive layer with no database engine, authorization engine or domain ownership of its own.

Potentially reusable elements:

- semantic page container;
- intro/header composition;
- section grouping;
- metric destination link;
- context destination card.

However, before promotion, the primitives must be reconciled with the final Visual Design Constitution, especially:

- card usage discipline;
- semantic color/tokens;
- responsive density;
- RTL/LTR logical behavior;
- accessibility and focus states;
- mobile-specific composition;
- Concept 01 visual foundation.

## 5. Preservation rule
The source implementation must remain available as historical evidence even if a subset is later promoted. Promotion is a new implementation action and does not erase this historical snapshot.

## 6. Current status
**Home candidate:** SUPERSEDED / RETAIN PROVENANCE.  
**Experience primitives:** COMPATIBLE IMPLEMENTATION CANDIDATE — review and integrate selectively.  
**Production status:** NOT PROVEN by this historical PR alone.

**End of historical implementation record.**
