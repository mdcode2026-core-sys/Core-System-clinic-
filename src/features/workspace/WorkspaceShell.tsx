// src/features/workspace/WorkspaceShell.tsx
// Workspace Architecture — Shell Chrome (Layer 1 + Sidebar)
// Renamed from DashboardShell.tsx per §19 (Legacy Files / Compatibility Rule).
// Sidebar (navigationRegistry.ts-driven) treated as pre-existing shell chrome,
// NOT a Widget, NOT part of Layer 2/3. Per Phase-0 finding: navigationRegistry.ts
// is not listed in §4 under any layer; it lives inside the shell.

"use client";

import { useAuth } from "@/lib/supabase/useAuth";
import { navigationRegistry } from "@/core/navigation/navigationRegistry";
import { usePermissions } from "@/core/permissions/usePermissions";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface WorkspaceShellProps {
  children: React.ReactNode;
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const { user, signOut } = useAuth();
  const { hasPermission } = usePermissions();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNav = navigationRegistry.filter((item) =>
    hasPermission(item.requiredPermission)
  );

  return (
    <div className="flex h-screen w-full bg-gray-50" dir="rtl">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — shell chrome, NOT a Widget */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              ClinicSaaS™
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              aria-label="إغلاق القائمة"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav items */}
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
                  {item.icon}
                  <span>{item.labelAr}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Global Header — Layer 1 per §4 */}
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              aria-label="فتح القائمة"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              مساحة العمل
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:inline">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </header>

        {/* Content — Layer 2/3 widgets render here */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default WorkspaceShell;
