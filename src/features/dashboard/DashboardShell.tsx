"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet";
import { Separator } from "@/shared/components/ui/separator";
import {
  LayoutDashboard, Users, CalendarDays, ListOrdered, FileText,
  BarChart3, Settings, Menu, LogOut, Stethoscope
} from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/patients", label: "المرضى", icon: Users },
  { href: "/agenda", label: "الأجندة", icon: CalendarDays },
  { href: "/queue", label: "الطابور", icon: ListOrdered },
  { href: "/invoices", label: "الفواتير", icon: FileText },
  { href: "/analytics", label: "التحليلات", icon: BarChart3 },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export function DashboardShell({ 
  children, 
  user 
}: { 
  children: React.ReactNode;
  user: { email?: string } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex w-64 flex-col border-l bg-card p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ClinicSaaS™</span>
        </div>
        <nav className="flex-1 space-y-1">
          <NavLinks />
        </nav>
        <Separator className="my-4" />
        <div className="space-y-2">
          <div className="px-3 py-2 text-sm text-muted-foreground truncate">
            {user?.email}
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="lg:hidden flex items-center justify-between border-b p-4 bg-card">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <span className="font-bold">ClinicSaaS™</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-4">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-6">
                  <Stethoscope className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">ClinicSaaS™</span>
                </div>
                <nav className="flex-1 space-y-1">
                  <NavLinks />
                </nav>
                <Separator className="my-4" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  تسجيل الخروج
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
