// src/features/dashboard/DashboardShell.tsx
// Package 3.0.2 — Dynamic Navigation: replaces static navItems with permission-filtered
// version driven by usePermissions(). RTL and responsive behavior preserved.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet";
import { Separator } from "@/shared/components/ui/separator";
import { Menu, LogOut, Stethoscope } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";
import { useRouter } from "next/navigation";
import { navigationRegistry, type NavItem } from "@/core/navigation/navigationRegistry";
import { usePermissions } from "@/core/permissions/usePermissions";
import type { Permission } from "@/core/permissions/types";

interface DashboardShellProps {
  children: React.ReactNode;
  user: { email?: string } | null;
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { hasPermission, isLoading: permsLoading } = usePermissions();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  /**
   * Filter navigation items based on effective permissions.
   * Dashboard ("/") is always visible (requiredPermission === null).
   * All other items require their specific permission.
   */
  const visibleNavItems: NavItem[] = navigationRegistry.filter((item) => {
    if (item.requiredPermission === null) return true;
    // While permissions are loading, show nothing except Dashboard to prevent flash
    if (permsLoading) return item.requiredPermission === null;
    return hasPermission(item.requiredPermission as Permission);
  });

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.labelAr}</span>
          </Link>
        );
      })}
      <Separator className="my-4" />
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span>تسجيل الخروج</span>
      </Button>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row" dir="rtl">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
        <div className="flex items-center gap-2 font-bold text-primary">
          <Stethoscope className="h-5 w-5" />
          <span className="text-sm">ClinicSaaS™</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">فتح القائمة</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-4" dir="rtl">
            <div className="mb-6 flex items-center gap-2 font-bold text-primary">
              <Stethoscope className="h-5 w-5" />
              <span>ClinicSaaS™</span>
            </div>
            <nav className="flex flex-col gap-1">
              <NavLinks onNavigate={() => { /* Sheet auto-closes on navigation in shadcn */ }} />
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-l bg-background md:block">
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 flex items-center gap-2 font-bold text-primary">
            <Stethoscope className="h-6 w-6" />
            <span>ClinicSaaS™</span>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            <NavLinks />
          </nav>
          {user?.email && (
            <div className="mt-auto border-t pt-4">
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
