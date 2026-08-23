"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { navigationRegistry } from "@/core/navigation/navigationRegistry";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();
  const isArabic = locale === "ar";

  const filteredNav = navigationRegistry.filter(
    (item) => item.requiredPermission === null || hasPermission(item.requiredPermission)
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isArabic ? "right-0" : "left-0",
          sidebarOpen
            ? "translate-x-0"
            : isArabic
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Link href="/" className="text-xl font-bold text-blue-600">
              ClinicSaaS™
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              aria-label={messages.shell.closeMenu}
              title={messages.shell.closeMenu}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{isArabic ? item.labelAr : item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              aria-label={messages.shell.openMenu}
              title={messages.shell.openMenu}
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
