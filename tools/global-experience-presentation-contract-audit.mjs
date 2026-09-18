import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const header = read("src/features/workspace/GlobalHeader.tsx");
const shell = read("src/features/workspace/EntitlementAwareWorkspaceShell.tsx");
const overlay = read("src/features/workspace/GlobalOverlayPortal.tsx");
const chat = read("src/features/workspace/GlobalChatHeaderControl.tsx");
const communications = read("src/features/workspace/CommunicationsHeaderControl.tsx");
const notifications = read("src/features/workspace/NotificationsHeaderControl.tsx");
const quickActions = read("src/features/workspace/QuickActionsHeaderControl.tsx");
const search = read("src/core/search/GlobalSearch.tsx");
const navigation = read("src/core/navigation/navigationRegistry.ts");
const geometry = read("src/features/workspace/GlobalSurfacesDesktopGeometry.module.css");

const checks = [
  ["Header has a dedicated component", header.includes("export function GlobalHeader")],
  ["Header has an independent mobile composition", header.includes("grid-cols-[auto_minmax(0,1fr)]") && header.includes("col-span-2")],
  ["Header has an independent tablet/desktop composition", header.includes("md:grid-cols-[auto_minmax(12rem,1fr)_auto]")],
  ["Header search remains injected and protected", header.includes("search?: ReactNode") && shell.includes("search={<GlobalSearch />}") && search.includes("GlobalSearch")],
  ["Header controls are isolated from search geometry", header.includes("data-testid=\"global-header-controls\"") && header.includes("overflow-visible")],
  ["Header brand keeps intrinsic image dimensions", header.includes("width={150}") && header.includes("height={33}")],
  ["Header exposes a 40px mobile navigation target", header.includes("h-10 w-10") && header.includes("data-testid=\"global-header-mobile-nav\"" )],
  ["Header avoids hard-coded left/right positioning", !/\b(left|right)-/.test(header)],
  ["Shell uses viewport-height composition", shell.includes("h-[100dvh]")],
  ["Sidebar is direction-aware through logical inset", geometry.includes("inset-inline-start: 0") && shell.includes("dir={isArabic ? \"rtl\" : \"ltr\"}" )],
  ["Desktop sidebar is persistent and content is offset logically", geometry.includes("transform: translateX(0) !important") && geometry.includes("margin-inline-start: 16rem")],
  ["Sidebar uses logical spacing", shell.includes("ps-4") && shell.includes("border-s")],
  ["My Settings remains in sidebar registry", navigation.includes('{href:"/settings"') && navigation.includes('labelKey:"settings"')],
  ["Patient Flow remains contextual, not ordinary sidebar", navigation.includes('href:"/patient-flow"') && navigation.includes('visibility:"contextual"')],
  ["Shared overlays use a portal", overlay.includes("createPortal")],
  ["Overlay has viewport collision handling", overlay.includes("shouldOpenAbove") && overlay.includes("Math.max(EDGE_GAP")],
  ["Overlay supports mobile composition", overlay.includes("MOBILE_BREAKPOINT") && overlay.includes("mobilePlacement")],
  ["Overlay accounts for safe-area bottom padding", overlay.includes("env(safe-area-inset-bottom)")],
  ["Overlay restores focus and traps Tab", overlay.includes("anchorRef.current") && overlay.includes("FOCUSABLE") && overlay.includes("event.key !== \"Tab\"" )],
  ["Overlay closes on Escape and outside interaction", overlay.includes("event.key === \"Escape\"") && overlay.includes("pointerdown")],
  ["Chat has explicit mobile/tablet/desktop modes", chat.includes('type ViewportMode = "mobile" | "tablet" | "desktop"') && chat.includes('mode === "mobile"') && chat.includes('mode === "tablet"')],
  ["Chat desktop retains drag and resize", chat.includes("startDrag") && chat.includes("startResize")],
  ["Chat uses Communications infrastructure", chat.includes("getInternalChatDirectory") && chat.includes("sendInternalMessage")],
  ["Communications uses shared overlay owner", communications.includes("GlobalOverlayPortal")],
  ["Notifications uses shared overlay owner", notifications.includes("GlobalOverlayPortal")],
  ["Notifications has verified unread/feed data", notifications.includes("usePersonalNotificationFeed") && notifications.includes("unread_count")],
  ["Quick Actions remains bounded to Language and Logout", quickActions.includes("language selection and logout") && quickActions.includes("LanguageSwitcher") && quickActions.includes("onSignOut")],
  ["No business action launcher is present in Quick Actions", !/Create Patient|Quick Registration|New Appointment/.test(quickActions)],
  ["Direction contract is explicit on global surfaces", header.includes('dir={isArabic ? "rtl" : "ltr"}') && overlay.includes("dir={dir}")],
  ["Safe-area aware header geometry exists", header.includes("safe-area-inset-top") && geometry.includes("safe-area-inset-left") && geometry.includes("safe-area-inset-right")],
];

for (const [label, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"} — ${label}`);
const failures = checks.filter(([, ok]) => !ok);
if (failures.length) process.exitCode = 1;
else console.log(`GLOBAL EXPERIENCE PRESENTATION CONTRACT AUDIT — ${checks.length}/${checks.length} checks passed`);
