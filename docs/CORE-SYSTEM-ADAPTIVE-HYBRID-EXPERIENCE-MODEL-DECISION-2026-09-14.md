# CORE SYSTEM — Adaptive Hybrid Experience Model Decision
## 2026-09-14

**Status:** APPROVED — Product Owner decision recorded 2026-09-14.
**Authority:** Current Product Owner decision under the approved Design/UX/Architecture Constitution and Integrated Work / Execution Contract.

## 1. Decision
CORE SYSTEM adopts a single **Adaptive Hybrid Experience System** composed of three governing layers:

```text
Horizon = Foundation
Vertex  = Work Engine
Zenith  = Experience Layer
```

This is **one experience system, not three visual designs**. The three models contribute principles and behavior according to context; they must not be mixed as disconnected visual styles.

## 2. Layer Responsibilities
### Horizon — Foundation
Controls simplicity, clarity, hierarchy, learnability, consistency, accessibility and avoidance of unnecessary surface complexity.

### Vertex — Work Engine
Provides professional work capability, information density where work complexity requires it, advanced workflows, operational monitoring, management views and analytics capability.

### Zenith — Experience Layer
Provides contextual presentation, personalization, adaptive emphasis and a human-centered presentation of authorized information and actions.

## 3. Constitutional Rule
> **Horizon controls simplicity. Vertex provides capability. Zenith adapts the experience.**

Arabic:
> **Horizon يضبط البساطة. Vertex يوفر قوة العمل. Zenith يجعل التجربة متكيفة مع المستخدم والسياق.**

## 4. Surface Application
| Surface | Primary layer | Supporting layers |
|---|---|---|
| Login | Horizon | — |
| Home | Horizon | Zenith |
| My Workspace | Zenith | Horizon |
| Clinical Workspace | Vertex | Horizon + Zenith |
| Operational Workspace | Vertex | Horizon + Zenith |
| Administrative Workspace | Vertex + Zenith | Horizon |
| Modules / Domains | Horizon navigation | Vertex work + Zenith context |
| Analytics | Vertex | Horizon clarity + Zenith context |
| Mobile | Horizon | Zenith + task-required Vertex |

This matrix is a governing direction, not a permission model and not a literal component recipe.

## 5. Information Density Rule
> **Information Density must follow Work Complexity.**

Higher capability may justify higher density. Higher density must not be introduced merely because the system can expose more information.

## 6. Home Rule
Home is **Simple + Contextual**. It should answer:
- What matters to me now?
- What needs attention?
- Where should I go to do the work?

Home must not become a specialist workspace, a full dashboard, or a duplicate workflow engine.

## 7. Implementation Rule
The implementation must not select colors, cards or other visual elements from the three source models independently. It must translate the approved principles into one shared CORE SYSTEM experience language.

Existing shared primitives remain reusable where they support this rule. Existing work must be classified as KEEP / ADAPT / REPLACE / UNVERIFIED before modification.

## 8. Relationship to PR #123
PR #123 remains **OPEN / PROVISIONAL for implementation purposes**. Its Constitution, Contract, VERIFY and PLAN artifacts provide the governance foundation, but its existing Home pilot and experience primitives must be reconciled against this newly approved Model Decision before implementation is considered aligned.

Initial reconciliation finding:
- Governance documents: KEEP, with this decision added as the current experience-model authority.
- Existing experience primitives: ADAPT pending detailed component-level review; their current card/container treatment is not sufficient evidence of the hybrid model by itself.
- Home pilot: ADAPT; current information architecture remains materially card/overview oriented and must be evaluated against the Simple + Contextual Home rule.

## 9. Open Decisions Preserved
This decision does not close:
- exact Home ordering/visual hierarchy;
- Dashboard vs Analytics boundary;
- Work Center vs My Workspace boundary;
- final visual token taxonomy and semantic mapping;
- visual regression tooling;
- Administrative Workspace IA;
- Super Admin Workspace scope;
- final platform-content model.

## 10. Effective Date
Effective immediately for subsequent CORE SYSTEM UX/Experience governance, planning and implementation work from **2026-09-14** onward.

**End of Model Decision.**