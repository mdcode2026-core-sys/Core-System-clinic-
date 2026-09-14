# CORE SYSTEM — Visual Token Specification
## Clinical Precision
### 2026-09-15

**Status:** EXECUTABLE VISUAL BASELINE  
**Parent authority:** `docs/CORE-SYSTEM-VISUAL-DESIGN-CONSTITUTION.md`

This document is the implementation-ready token layer for the approved Clinical Precision visual foundation. Tokens are shared primitives, not surface-specific product decisions.

## Color tokens

```css
--cs-ink-950: #0F172A;
--cs-ink-900: #172033;
--cs-slate-700: #334155;
--cs-slate-500: #64748B;
--cs-slate-300: #CBD5E1;
--cs-slate-200: #E2E8F0;
--cs-slate-100: #F1F5F9;
--cs-slate-50: #F8FAFC;
--cs-white: #FFFFFF;
--cs-azure-700: #1D4ED8;
--cs-azure-600: #2563EB;
--cs-azure-100: #DBEAFE;
--cs-cyan-700: #0E7490;
--cs-cyan-600: #0891B2;
--cs-cyan-100: #CFFAFE;
--cs-success-700: #15803D;
--cs-warning-700: #A16207;
--cs-danger-700: #B91C1C;
```

Semantic tokens are mapped separately from primitives so components use meaning rather than raw hex values.

## Semantic color aliases

```css
--background: var(--cs-slate-50);
--foreground: var(--cs-ink-950);
--surface: var(--cs-white);
--surface-subtle: var(--cs-slate-100);
--border: var(--cs-slate-200);
--border-strong: var(--cs-slate-300);
--primary: var(--cs-azure-600);
--primary-strong: var(--cs-azure-700);
--primary-soft: var(--cs-azure-100);
--info: var(--cs-cyan-700);
--info-soft: var(--cs-cyan-100);
--success: var(--cs-success-700);
--warning: var(--cs-warning-700);
--danger: var(--cs-danger-700);
```

## Typography tokens

```css
--cs-font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--cs-text-display: 2rem;
--cs-text-title: 1.75rem;
--cs-text-section: 1.25rem;
--cs-text-body: 0.9375rem;
--cs-text-caption: 0.8125rem;
--cs-text-micro: 0.75rem;
--cs-leading-display: 1.2;
--cs-leading-title: 1.25;
--cs-leading-section: 1.35;
--cs-leading-body: 1.55;
--cs-leading-caption: 1.45;
--cs-font-regular: 400;
--cs-font-medium: 500;
--cs-font-semibold: 600;
--cs-font-bold: 700;
```

The stack must include an Arabic-capable system fallback. No proprietary font dependency is introduced by the visual foundation.

## Spacing tokens

```css
--cs-space-1: 0.25rem;
--cs-space-2: 0.5rem;
--cs-space-3: 0.75rem;
--cs-space-4: 1rem;
--cs-space-5: 1.25rem;
--cs-space-6: 1.5rem;
--cs-space-8: 2rem;
--cs-space-10: 2.5rem;
--cs-space-12: 3rem;
--cs-space-16: 4rem;
```

## Radius tokens

```css
--cs-radius-sm: 4px;
--cs-radius-md: 6px;
--cs-radius-lg: 8px;
--cs-radius-xl: 12px;
--cs-radius-2xl: 16px;
```

## Elevation tokens

```css
--cs-shadow-xs: 0 1px 2px rgb(15 23 42 / 0.04);
--cs-shadow-sm: 0 2px 8px rgb(15 23 42 / 0.06);
--cs-shadow-md: 0 8px 24px rgb(15 23 42 / 0.10);
```

Use shadows only where an element is intentionally elevated. Avoid decorative shadow stacking.

## Control tokens

- Minimum target size: 40px for compact header controls and 44px for primary mobile interaction where space permits.
- Standard control height: 40px.
- Dense control height: 36px only when surrounding information density requires it.
- Standard field radius: 8px.
- Standard button radius: 8px.
- Focus ring: 2px solid/semantic primary plus sufficient offset to remain visually distinct.

## Surface token usage

- Page canvas → `background`.
- Primary content region → `surface`.
- Secondary grouping → `surface-subtle`.
- Dividing boundary → `border`.
- Primary action → `primary`.
- Informational highlight → `info`.
- Positive outcome → `success`.
- Caution → `warning`.
- Failure/destructive → `danger`.

## Dark mode

Dark mode remains supported by the existing system architecture, but F1–F4 implementation is governed by the light Clinical Precision foundation first. Dark-mode refinement must not introduce a second visual identity; it is a contrast-preserving translation of the same semantic tokens.

## Token rule

Components should consume semantic tokens where possible. Raw primitive values are appropriate only in token definitions or tightly controlled brand asset work.
