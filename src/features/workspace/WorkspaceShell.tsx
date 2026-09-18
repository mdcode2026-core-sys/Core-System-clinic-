"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
import { getSidebarNavigation, type NavItem } from "@/core/navigation/navigationRegistry";
import { usePermissions } from "@/core/permissions/usePermissions";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/shared/utils/cn";
import { useI18n } from "@/core/i18n/I18nProvider";
import { GlobalSearch } from "@/core/search/GlobalSearch";
import { GlobalHeader } from "./GlobalHeader";
import { CommunicationsHeaderControl } from "./CommunicationsHeaderControl";
import { GlobalChatHeaderControl } from "./GlobalChatHeaderControl";
import { NotificationsHeaderControl } from "./NotificationsHeaderControl";
import { QuickActionsHeaderControl } from "./QuickActionsHeaderControl";

interface WorkspaceShellProps {
  children: React.ReactNode;
  user: { email?: string } | null;
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { locale, messages, workspace } = useI18n();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const mobileSidebarTriggerRef = useRef<HTMLButtonElement | null>(null);
  const supabase = createClient();
  const isArabic = locale === "ar";

  const canSee = (item: NavItem) =>
    item.requiredPermission === null || hasPermission(item.requiredPermission);

  const filterChildren = (item: NavItem): NavItem => ({
    ...item,
    children: item.children?.filter(canSee).map(filterChildren),
  });

  const filteredNav = getSidebarNavigation()
    .map(filterChildren)
    .filter((item) => canSee(item) || (item.children && item.children.length > 0));

  const getLabel = (item: NavItem) =>
    item.label ? item.label[locale] : item.labelKey ? messages.nav[item.labelKey] : item.href;

  const isPathActive = (item: NavItem): boolean =>
    pathname === item.href.split("?")[0] || (item.children?.some(isPathActive) ?? false);

  const groupContainsPath = (item: NavItem): boolean =>
    item.children?.some((child) =>
      pathname === child.href.split("?")[0] ||
      pathname.startsWith(`${child.href.split("?")[0]}/`) ||
      groupContainsPath(child),
    ) ?? false;

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
    window.setTimeout(() => mobileSidebarTriggerRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeMobileSidebar();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileSidebarOpen, closeMobileSidebar]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const renderItem = (item: NavItem, nested = false): React.ReactNode => {
    const children = item.children ?? [];
    const expandable = children.length > 0;
    const active = isPathActive(item);
    const open = openGroups[item.href] ?? groupContainsPath(item);
    const Icon = item.icon;
    const toggle = () => setOpenGroups((value) => ({ ...value, [item.href]: !open }));

    return (
      <div key={`${item.href}-${nested ? "nested" : "root"}`}>
        <div className={cn("flex min-h-10 items-center rounded-lg text-sm font-medium transition-colors", nested && "ms-4", active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900")}>
          {expandable ? (
            <button type="button" onClick={toggle} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-start" aria-expanded={open}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{getLabel(item)}</span>
            </button>
          ) : (
            <Link href={item.href} prefetch onClick={closeMobileSidebar} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-start" aria-current={active ? "page" : undefined}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{getLabel(item)}</span>
            </Link>
          )}
          {expandable ? (
            <button type="button" onClick={toggle} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={open ? workspace.collapse : workspace.expand} aria-expanded={open}>
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {expandable && open ? <div className="mt-1 space-y-0.5 border-s border-gray-200 ps-1">{children.map((child) => renderItem(child, true))}</div> : null}
      </div>
    );
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gray-50" data-testid="workspace-shell">
      {mobileSidebarOpen ? <button type="button" className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMobileSidebar} aria-label={isArabic ? "إغلاق القائمة" : "Close navigation"} data-testid="global-sidebar-overlay" /> : null}

      <aside id="global-sidebar" className={cn("fixed inset-y-0 start-0 z-50 flex w-72 max-w-[calc(100vw-1rem)] flex-col border-e border-slate-200 bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-lg transition-transform duration-200 ease-out lg:translate-x-0", mobileSidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full")} aria-label={isArabic ? "القائمة الجانبية" : "Sidebar navigation"} data-testid="global-sidebar">
        <div className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 sm:min-h-16 sm:px-5">
          <Link href="/" className="min-w-0 truncate text-base font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" onClick={closeMobileSidebar}>ClinicSaaS™</Link>
          <button type="button" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden" onClick={closeMobileSidebar} aria-label={workspace.closeSidebar} data-testid="global-sidebar-close"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4" aria-label={isArabic ? "تنقل النظام" : "System navigation"}><div className="space-y-1">{filteredNav.map((item) => renderItem(item))}</div></nav>
      </aside>

      <main className="min-h-screen min-w-0 max-w-full overflow-x-hidden lg:ps-72">
        <GlobalHeader
          isArabic={isArabic}
          mobileSidebarOpen={mobileSidebarOpen}
          onOpenMobileSidebar={() => {
            setMobileSidebarOpen(true);
            window.setTimeout(() => document.querySelector<HTMLButtonElement>('[data-testid="global-sidebar-close"]')?.focus(), 0);
          }}
          mobileSidebarTriggerRef={mobileSidebarTriggerRef}
          search={<GlobalSearch />}
          controls={<><CommunicationsHeaderControl isArabic={isArabic} /><GlobalChatHeaderControl isArabic={isArabic} /><NotificationsHeaderControl isArabic={isArabic} /><QuickActionsHeaderControl isArabic={isArabic} onSignOut={handleSignOut} /></>}
        />
        <div className="min-w-0 max-w-full p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6">{children}</div>
      </main>
    </div>
  );
}
