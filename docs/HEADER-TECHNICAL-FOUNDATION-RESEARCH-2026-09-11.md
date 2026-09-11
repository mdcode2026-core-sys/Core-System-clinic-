# CORE SYSTEM — Header Technical Foundation Research

**Date:** 2026-09-11  
**Scope:** Authenticated global Header technical foundation  
**Decision type:** Architecture / implementation foundation, not visual imitation

## Comparative evaluation

### ServiceNow

ServiceNow's current Unified Navigation is explicitly a global shell spanning classic modules and modern Workspaces. It consolidates navigation, search, notifications and user settings into a consistent top-level experience. Employee Center's header guidance emphasizes consistent branding/navigation, prominent search, user-specific items, profile access, contextual notifications/links, and keyboard interaction. This supports a stable shell plus progressive disclosure pattern rather than putting full workflows in the header.

**Adopt:** persistent shell, stable placement, permission-aware visibility, progressive disclosure, keyboard/assistive interaction.  
**Reject:** portal/topic-taxonomy navigation as a model for CORE's business domains.

### Salesforce Lightning

Lightning provides persistent global search, global actions, notifications, profile/personal settings and navigation. Its global search supports suggestions and direct navigation to records; global actions are explicitly separate from navigation. This supports fast cross-domain discovery and carefully bounded global actions.

**Adopt:** dedicated global search, explicit distinction between global controls and business navigation, unread notification state, direct record routing.  
**Reject:** broad CRM-style global action launcher for CORE's initial scope.

### Microsoft Power Platform / Dynamics patterns

Microsoft's current model-driven navigation separates navigation from contextual work and provides reference panels that let users inspect related information without leaving the current context. Its current healthcare architecture guidance emphasizes role-specific workspaces, task/attention-oriented entry points, progressive disclosure, and actionable notifications with deep links.

**Adopt:** deep-link routing to authoritative domains, contextual access without duplicating domain ownership, attention-oriented interaction.  
**Reject:** making the Header itself a task dashboard.

### Carbon Design System

Carbon's current Global Header defines the header as essential global UI shell functionality, providing stable locations for system-wide functions such as settings and notifications, with explicit accessibility testing including keyboard and screen-reader testing. Current React components are versioned and continuously accessibility-tested.

**Adopt:** dedicated shell component, explicit accessibility contract, deterministic keyboard behavior, stable global control locations.  
**Reject:** copying Carbon visual identity or control arrangement.

### MUI / Material guidance

MUI's current App Bar guidance demonstrates responsive shell patterns, integrated search, menus and drawer behavior, and warns that fixed bars require layout compensation. Responsive guidance is mobile-first and breakpoint-aware.

**Adopt:** semantic shell sizing, responsive adaptation, predictable layering, mobile-first constraints.  
**Reject:** treating generic App Bar patterns as the CORE product architecture.

### GOV.UK / service design

GOV.UK's current navigation guidance separates government-wide tools from service-level navigation and recommends a skip link before the header. This reinforces the distinction between truly global controls and product/service navigation.

**Adopt:** clear separation of global vs service-level responsibilities and skip-to-main accessibility.  
**Reject:** government-specific branding/layout conventions.

### Healthcare safety / ONC SAFER guidance

Current ONC guidance emphasizes usability and safety, continuous optimization, reducing cognitive burden, reliable communication, contextual information, accurate patient identification, and testing across different user roles, contexts and devices. The 2025 SAFER Guides were updated for high-risk/common EHR safety issues; usability testing across common devices and after major customization is explicitly recommended.

**Adopt:** safety-first interaction, role/context testing, device testing, contextual information, reliable communication, clear responsibility boundaries.  
**Reject:** adding clinical decision content to the global Header without domain ownership.

## Decision

CORE SYSTEM should use a **calm, persistent, capability-aware global shell** with:

```text
GlobalHeader
├── Brand / system identity
├── Global Search
├── Communications
├── Chat (compact over Communications)
├── Notifications
└── Quick Actions (initially Language + Logout)
```

The header should prefer **stable placement + progressive disclosure + fast routing** over dense navigation. It should not become a dashboard, module directory, or business-action launcher.

The technical foundation should be reusable and domain-neutral, with each child control integrating its existing authority rather than introducing parallel state engines.

## Quality bar

The chosen direction is not optimized for implementation speed. It is optimized for:

- user recognition and predictability;
- low cognitive load;
- fast discovery and routing;
- clinical safety and attribution;
- cross-domain consistency;
- responsive behavior;
- accessibility;
- internationalization/RTL;
- future extensibility without architectural drift;
- a professional enterprise appearance without copying another vendor.

**End of research record.**
