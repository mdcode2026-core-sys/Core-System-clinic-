"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X, ChevronDown } from "lucide-react";
import { navigationRegistry, type NavItem } from "@/core/navigation/navigationRegistry";
import { usePermissions } from "@/core/permissions/usePermissions";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/shared/utils/cn";
import { useI18n } from "@/core/i18n/I18nProvider";
import { LanguageSwitcher } from "@/core/i18n/LanguageSwitcher";

interface WorkspaceShellProps {
  children: React.ReactNode;
  user: { email?: string } | null;
}

export function WorkspaceShell({ children, user }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { locale, messages } = useI18n();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [financialOpen, setFinancialOpen] = useState(false);
  const supabase = createClient();
  const isArabic = locale === "ar";

  const canSee = (item: NavItem) =>
    item.requiredPermission === null || hasPermission(item.requiredPermission);

  const filteredNav = navigationRegistry
    .map((item) => ({
      ...item,
      children: item.children?.filter(canSee),
    }))
    .filter(
      (item) =>
        canSee(item) || (item.children && item.children.length > 0),
    );

  useEffect(() => {
    const financialPaths = [
      "/financial-resources",
      "/invoices",
      "/payments",
      "/financial-plans",
      "/installments",
      "/insurance",
      "/inventory",
      "/consumption",
      "/suppliers",
      "/purchasing",
      "/receiving",
    ];
    if (
      financialPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      )
    ) {
      setFinancialOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [locale]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getLabel = (item: NavItem) =>
    item.label
      ? item.label[locale]
      : item.labelKey
        ? messages.nav[item.labelKey]
        : item.href;

  const renderItem = (item: NavItem, nested = false): React.ReactNode => {
    const children = item.children ?? [];
    const expandable = item.href === "/financial-resources";
    const active =
      pathname === item.href ||
      children.some(
        (child) =>
          pathname === child.href || pathname.startsWith(`${child.href}/`),
      );

    const closeOnMobile = () => setMobileSidebarOpen(false);
    const Icon = item.icon;

    return (
      <div key={item.href}>
        <div
          className={cn(
            "flex items-center rounded-lg text-sm font-medium transition-colors",
            nested && (isArabic ? "mr-4" : "ml-4"),
            active
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          )}
        >
          {expandable ? (
            <button
              type="button"
              onClick={() => setFinancialOpen((value) => !value)}
              className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-start"
              aria-expanded={financialOpen}
              aria-controls="financial-resources-nav"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{getLabel(item)}</span>
            </button>
          ) : (
            <Link
              href={item.href}
              prefetch
              onClick={closeOnMobile}
              className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{getLabel(item)}</span>
            </Link>
          )}
          {expandable && (
            <ChevronDown
              className={cn(
                "mx-3 h-4 w-4 shrink-0 transition-transform",
                financialOpen && "rotate-180",
              )}
              aria-hidden="true"
            />
          )}
        </div>

        {children.length > 0 && (!expandable || financialOpen) && (
          <div
            id={expandable ? "financial-resources-nav" : undefined}
            className="mt-1 space-y-0.5 border-l border-gray-200 pl-1 rtl:border-l-0 rtl:border-r rtl:pr-1"
          >
            {children.map((child) => renderItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 z-50 w-72 bg-white shadow-lg transition-transform duration-200 ease-in-out lg:translate-x-0",
          isArabic ? "right-0" : "left-0",
          mobileSidebarOpen
            ? "translate-x-0"
            : isArabic
              ? "translate-x-full"
              : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Link
              href="/"
              className="text-xl font-bold text-blue-600"
              onClick={() => setMobileSidebarOpen(false)}
            >
              ClinicSaaS™
            </Link>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-md p-1.5 hover:bg-gray-100 lg:hidden"
              aria-label={messages.shell.closeMenu}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {filteredNav.map((item) => renderItem(item))}
          </nav>
        </div>
      </aside>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          isArabic ? "lg:mr-72" : "lg:ml-72",
        )}
      >
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-md p-1.5 hover:bg-gray-100 lg:hidden"
              aria-label={messages.shell.openMenu}
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="truncate text-lg font-semibold text-gray-900">
              {messages.shell.workspace}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            <span className="hidden max-w-[240px] truncate text-sm text-gray-600 sm:inline">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{messages.shell.signOut}</span>
            </button>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default WorkspaceShell;
