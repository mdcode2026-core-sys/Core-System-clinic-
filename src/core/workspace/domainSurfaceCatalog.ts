/** Stage 5 — domain-to-surface decisions. This catalog records presentation placement; it does not define AJM Domain ownership or grant authorization. */
export type DomainSurfaceDecision = {
  /** Subject label used by the UX surface catalog; not necessarily an AJM business Domain. */
  domain: string;
  surface: "workspace" | "sidebar" | "contextual" | "settings";
  widget: "yes" | "no";
  widgetRationale: string;
  quickAction: "yes" | "no";
};

export const DOMAIN_SURFACE_CATALOG: readonly DomainSurfaceDecision[] = [
  { domain: "Workspace", surface: "workspace", widget: "yes", widgetRationale: "Workspace is the host surface for authorized reusable Widgets.", quickAction: "yes" },
  { domain: "Patients", surface: "sidebar", widget: "yes", widgetRationale: "Quick Registration is useful; the full patient domain remains the authoritative record/search surface.", quickAction: "yes" },
  { domain: "Agenda", surface: "sidebar", widget: "yes", widgetRationale: "Quick Appointment supports high-frequency booking while Agenda remains authoritative.", quickAction: "yes" },
  { domain: "Treatment Plans", surface: "sidebar", widget: "no", widgetRationale: "Treatment planning is a substantial clinical workflow and should remain a full domain surface rather than a miniature Widget.", quickAction: "no" },
  { domain: "Financial & Resources", surface: "sidebar", widget: "yes", widgetRationale: "Billing Summary provides useful context; invoices, payments, plans, insurance, inventory and purchasing remain full domain capabilities.", quickAction: "no" },
  { domain: "Reports", surface: "sidebar", widget: "no", widgetRationale: "Reporting is a management/reporting surface; it should not be reduced to a generic Workspace Widget.", quickAction: "no" },
  { domain: "Analytics", surface: "sidebar", widget: "yes", widgetRationale: "Analytics Overview can provide concise management context while full analytics remains authoritative.", quickAction: "no" },
  { domain: "Follow-up", surface: "sidebar", widget: "yes", widgetRationale: "Follow-up is actionable operational work and benefits from an attention/worklist Widget.", quickAction: "no" },
  { domain: "Patient Flow", surface: "sidebar", widget: "yes", widgetRationale: "Patient Flow is a first-class authorized Sidebar system; Queue remains its underlying operational mechanism and is not replaced by a Widget.", quickAction: "no" },
  { domain: "Operations", surface: "contextual", widget: "no", widgetRationale: "Operations is a contextual route in the current IA; Patient Flow owns the relevant movement system and is reconciled separately.", quickAction: "no" },
  { domain: "Clinical", surface: "contextual", widget: "no", widgetRationale: "Clinical is a contextual route; clinical workflow remains in its authoritative domain surfaces.", quickAction: "no" },
  { domain: "Settings", surface: "settings", widget: "no", widgetRationale: "Settings/configuration should not become daily-work Widgets.", quickAction: "no" },
] as const;

export function getDomainSurfaceDecision(domain: string) {
  return DOMAIN_SURFACE_CATALOG.find((entry) => entry.domain === domain);
}
