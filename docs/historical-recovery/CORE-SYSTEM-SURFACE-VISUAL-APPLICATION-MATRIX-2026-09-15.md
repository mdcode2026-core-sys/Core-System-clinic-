# CORE SYSTEM — Surface Visual Application Matrix
## Clinical Precision
### 2026-09-15

This matrix applies the shared Visual Design Constitution to surfaces without changing their functional contracts.

| Surface | Experience purpose | Density | Visual behavior | Explicit non-change |
|---|---|---:|---|---|
| Login | Authentication | Low | Calm light canvas, focused auth surface, restrained Azure, strong hierarchy | No authenticated Header/Sidebar; no auth engine change |
| Header | Global access | Low / compact | Flat/light shell, independent controls, strong focus/unread states | No dashboard, no new engines, no business-action expansion |
| Home | Awareness / entry | Low / contextual | Identity + lightweight Weather → Today → contextual Attention → Destinations; whitespace-led hierarchy | No Notifications, Communications, Work Center, Quick Actions, Portal info, or widgets |
| Home → Workspace | Entry into execution | Low → Medium transition | Subtle visual shift from awareness to work; preserve route semantics | No duplicate workspace layer |
| My Workspace | Personal execution | Medium | Contextual, configurable presentation within permissions | No authorization changes |
| Role Workspace | Primary professional work | Medium–High | Vertex-capable density with Horizon clarity and Zenith context | No role reclassification |
| Work Center | Coordinated operational work | High | Dense execution surface where ownership/handoff/escalation require it | Do not redesign because of Home removal |
| Communications | Clinic-wide internal communication | Medium–High | Clear conversation hierarchy, calm density, strong ownership cues | Not doctor-only; no second chat engine |
| Chat | Compact communication access | Compact | Overlay/surface optimized for quick interaction | Remains a surface over Communications |
| Notifications | Personal attention feed | Compact–Medium | Distinct attention state, not communications styling | Separate from Communications/Follow-up |
| Agenda | Planning / availability | High | Information-dense scheduling surface when necessary | Remains authoritative scheduling domain |
| Calendar | Visual scheduling representation | High | Calendar-specific visualization | Not a second scheduling engine |
| Patient Journey | Longitudinal patient context | Medium–High | Context-led, relationship-rich presentation | Remains separate from Patient Flow |
| Analytics | Business/clinical intelligence | Medium–High | Data hierarchy, restrained semantic color, dense only as required | No dashboard styling imposed on all surfaces |

## F1 — Login application

The Visual Constitution changes presentation only. Authentication actions, routes, reset/register behavior, language switching, and accessibility contracts remain authoritative.

## F2 — Header application

The Header must read as a set of global capabilities rather than a single toolbar card. Spacing and border treatment should create separation without heavy containers. Controls remain independently accessible and preserve the existing injected domain controls.

## F3 — Home application

Home uses the constitution to establish a compact identity/context surface containing clinic identity, user identity, approved welcome behavior, and lightweight Weather/ambient information. Today remains a coherent daily-awareness surface; Attention appears only when a genuinely actionable condition exists; Destinations remain direct paths into authoritative work. The functional Home removals are mandatory and independent of visual decisions.

## F4 — Transition application

The transition from Home to Workspace should be perceptually clear but lightweight: users move from contextual awareness into an execution environment. Existing destination semantics remain authoritative.

## Propagation rule

After F1–F4 are accepted, the same tokens and visual rules may be applied to other surfaces through their own contracts. No surface may be visually copied from Home or Login merely because the same tokens are shared.

## Review rule

When a surface requires a density, component, or layout pattern not represented here, classify it as:

- **reuse** — existing approved pattern;
- **extend** — existing pattern adapted without changing meaning;
- **new visual decision** — requires Product Owner approval when it materially changes the system language;
- **new functional decision** — must return to product/architecture governance.
