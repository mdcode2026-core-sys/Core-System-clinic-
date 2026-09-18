"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { getSidebarNavigation, type NavItem } from "@/core/navigation/navigationRegistry";
import type { BusinessWorkspaceKey } from "@/core/workspace/currentWorkspace";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useEntitlements } from "@/core/entitlements/useEntitlements";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/shared/utils/cn";
import { useI18n } from "@/core/i18n/I18nProvider";
import { GlobalSearch } from "@/core/search/GlobalSearch";
import { GlobalHeader } from "./GlobalHeader";
import { CommunicationsHeaderControl } from "./CommunicationsHeaderControl";
import { GlobalChatHeaderControl } from "./GlobalChatHeaderControl";
import { NotificationsHeaderControl } from "./NotificationsHeaderControl";
import { QuickActionsHeaderControl } from "./QuickActionsHeaderControl";
import styles from "./GlobalSurfacesDesktopGeometry.module.css";

interface WorkspaceShellProps {
  children: React.ReactNode;
  user: { email?: string; user_metadata?: { full_name?: string; name?: string } } | null;
  assignedWorkspace: BusinessWorkspaceKey | null;
}

const WORKSPACE_LABELS: Record<BusinessWorkspaceKey, { ar: string; en: string }> = {
  administration: { ar: "مساحة الإدارة", en: "Administration Workspace" },
  operation: { ar: "مساحة التشغيل", en: "Operational Workspace" },
  clinical: { ar: "المساحة الطبية", en: "Clinical Workspace" },
};

export function EntitlementAwareWorkspaceShell({ children, user, assignedWorkspace }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const { hasCapability, isLoading: entitlementsLoading } = useEntitlements();
  const { locale, messages } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const mobileSidebarTriggerRef = useRef<HTMLButtonElement | null>(null);
  const supabase = createClient();
  const isArabic = locale === "ar";
  const accessLoading = permissionsLoading || entitlementsLoading;

  const canSee = (item: NavItem) =>
    (item.requiredPermission === null || hasPermission(item.requiredPermission)) &&
    (!item.capabilityKey || hasCapability(item.capabilityKey));

  const filterChildren = (item: NavItem): NavItem => ({
    ...item,
    children: item.children?.filter(canSee).map(filterChildren),
  });

  const filteredNav = getSidebarNavigation()
    .map(filterChildren)
    .map((item) =>
      item.href === "/workspace" && assignedWorkspace
        ? { ...item, href: `/${assignedWorkspace}`, label: WORKSPACE_LABELS[assignedWorkspace], labelKey: null }
        : item,
    )
    .filter((item) => accessLoading || canSee(item) || (item.children && item.children.length > 0));

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    window.setTimeout(() => mobileSidebarTriggerRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeSidebar();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen, closeSidebar]);
  const getLabel = (item: NavItem) =>
    item.label ? item.label[locale] : item.labelKey ? messages.nav[item.labelKey] : item.href;
  const pathMatches = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const isPathActive = (item: NavItem): boolean =>
    pathMatches(item.href) || (item.children?.some(isPathActive) ?? false);
  const groupContainsPath = (item: NavItem): boolean =>
    item.children?.some((child) => pathMatches(child.href) || groupContainsPath(child)) ?? false;

  const renderItem = (item: NavItem, nested = false): React.ReactNode => {
    const children = item.children ?? [];
    const isGroup = item.navigationOnly === true && children.length > 0;
    const active = isPathActive(item);
    const open = openGroups[item.href] ?? groupContainsPath(item);
    const Icon = item.icon;

    if (isGroup) {
      const toggle = () => setOpenGroups((value) => ({ ...value, [item.href]: !open }));
      return (
        <div key={item.href}>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={`sidebar-group-${item.href.replace(/[^a-zA-Z0-9_-]/g, "-")}`}
            className={cn(
              "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm font-medium transition-colors",
              nested && "ps-4",
              active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{getLabel(item)}</span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} aria-hidden="true" />
          </button>
          {open && (
            <div
              id={`sidebar-group-${item.href.replace(/[^a-zA-Z0-9_-]/g, "-")}`}
              className="mt-1 space-y-0.5 border-s border-gray-200 ps-1 rtl:border-s-0 rtl:border-e rtl:pe-1"
            >
              {children.map((child) => renderItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item.href}>
        <Link
          href={item.href}
          prefetch
          onClick={closeSidebar}
          aria-current={pathMatches(item.href) ? "page" : undefined}
          className={cn(
            "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            nested && "ps-4",
            active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="min-w-0 truncate">{getLabel(item)}</span>
        </Link>
        {children.length > 0 && (
          <div className="mt-1 space-y-0.5 border-s border-gray-200 ps-1 rtl:border-s-0 rtl:border-e rtl:pe-1">
            {children.map((child) => renderItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="flex h-[100dvh] w-full min-w-0 overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-label={isArabic ? "إغلاق القائمة" : "Close navigation"}
        />
      )}
      <aside
        id="global-sidebar"
        className={cn(
          styles.sidebar,
          "fixed inset-y-0 z-50 w-64 max-w-[85vw] -translate-x-full bg-white shadow-lg transition-transform duration-200 ease-in-out rtl:translate-x-full",
          sidebarOpen && "translate-x-0 rtl:translate-x-0",
        )}
      >
        <div className="flex h-full min-w-0 flex-col">
          <div className="flex items-center justify-between gap-2 border-b px-4 py-3 sm:px-6 sm:py-4">
            <Link href="/" className="min-w-0 truncate text-xl font-bold text-blue-600" onClick={closeSidebar}>
              ClinicSaaS™
            </Link>
            <button
              type="button"
              onClick={closeSidebar}
              className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-md p-1.5 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label={messages.shell.closeMenu}
              title={messages.shell.closeMenu}
              data-testid="global-sidebar-close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav aria-label={isArabic ? "التنقل الرئيسي" : "Primary navigation"} className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {filteredNav.map((item) => renderItem(item))}
          </nav>
        </div>
      </aside>

      <div className={cn(styles.content, "flex min-w-0 flex-1 flex-col overflow-hidden")}>
        <GlobalHeader
          isArabic={isArabic}
          mobileSidebarOpen={sidebarOpen}
          onOpenMobileSidebar={() => {
            setSidebarOpen(true);
            window.setTimeout(() => document.querySelector<HTMLButtonElement>('[data-testid="global-sidebar-close"]')?.focus(), 0);
          }}
          mobileSidebarTriggerRef={mobileSidebarTriggerRef}
          search={<GlobalSearch />}
          controls={
            <>
              <CommunicationsHeaderControl isArabic={isArabic} />
              <GlobalChatHeaderControl isArabic={isArabic} />
              <NotificationsHeaderControl isArabic={isArabic} />
              <QuickActionsHeaderControl isArabic={isArabic} onSignOut={handleSignOut} />
            </>
          }
        />
        <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export default EntitlementAwareWorkspaceShell;