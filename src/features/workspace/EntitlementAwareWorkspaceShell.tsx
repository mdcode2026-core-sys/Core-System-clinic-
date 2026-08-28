"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { getSidebarNavigation, type NavItem } from "@/core/navigation/navigationRegistry";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useEntitlements } from "@/core/entitlements/useEntitlements";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/shared/utils/cn";
import { useI18n } from "@/core/i18n/I18nProvider";
import { LanguageSwitcher } from "@/core/i18n/LanguageSwitcher";
import { WorkspaceSurfaceNav } from "./WorkspaceSurfaceNav";

interface WorkspaceShellProps { children: React.ReactNode; user: { email?: string } | null; }

export function EntitlementAwareWorkspaceShell({ children, user }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const { hasCapability, isLoading: entitlementsLoading } = useEntitlements();
  const { locale, messages } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    .filter((item) => accessLoading || canSee(item) || (item.children && item.children.length > 0));

  useEffect(() => { setSidebarOpen(false); }, [pathname]);
  useEffect(() => { setSidebarOpen(false); }, [locale]);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/login"); router.refresh(); };
  const closeSidebar = () => setSidebarOpen(false);
  const getLabel = (item: NavItem) => item.label ? item.label[locale] : item.labelKey ? messages.nav[item.labelKey] : item.href;

  const renderItem = (item: NavItem, nested = false) => {
    const children = item.children ?? [];
    const isActive = pathname === item.href || children.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"));
    return (
      <div key={item.href}>
        <Link href={item.href} prefetch onClick={closeSidebar} className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          nested && (isArabic ? "mr-4" : "ml-4"),
          isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        )}>
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{getLabel(item)}</span>
        </Link>
        {children.length > 0 && (
          <div className="mt-1 space-y-0.5 border-l border-gray-200 pl-1 rtl:border-l-0 rtl:border-r rtl:pr-1">
            {children.map((child) => renderItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeSidebar} />}
      <aside className={cn("fixed inset-y-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out", isArabic ? "right-0" : "left-0", sidebarOpen ? "translate-x-0" : isArabic ? "translate-x-full" : "-translate-x-full")}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Link href="/" className="text-xl font-bold text-blue-600" onClick={closeSidebar}>ClinicSaaS™</Link>
            <button type="button" onClick={closeSidebar} className="rounded-md p-1.5 hover:bg-gray-100" aria-label={messages.shell.closeMenu} title={messages.shell.closeMenu}><X className="h-5 w-5" /></button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">{filteredNav.map((item) => renderItem(item))}</nav>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-md p-1.5 hover:bg-gray-100" aria-label={messages.shell.openMenu} title={messages.shell.openMenu}><Menu className="h-5 w-5 text-gray-600" /></button>
            <h1 className="truncate text-lg font-semibold text-gray-900">{messages.shell.workspace}</h1>
          </div>
          <div className="flex min-w-0 flex-1 justify-center px-2"><WorkspaceSurfaceNav /></div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4"><LanguageSwitcher /><span className="hidden max-w-[240px] truncate text-sm text-gray-600 sm:inline">{user?.email}</span><button type="button" onClick={handleSignOut} className="flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">{messages.shell.signOut}</span></button></div>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export default EntitlementAwareWorkspaceShell;
