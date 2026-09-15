"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface GlobalHeaderProps {
  isArabic: boolean;
  mobileSidebarOpen: boolean;
  onOpenMobileSidebar: () => void;
  brand?: ReactNode;
  search?: ReactNode;
  controls?: ReactNode;
  className?: string;
}

function DefaultBrand({ isArabic, compact = false }: { isArabic: boolean; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("cs-interactive inline-flex shrink-0 items-center rounded-lg", compact ? "h-10 max-w-[7rem]" : "h-11 max-w-[10rem]")}
      aria-label={isArabic ? "الرئيسية — ClinicSaaS" : "Home — ClinicSaaS"}
      data-testid="global-header-brand"
    >
      <Image
        src="/brand/clinicsaas-header.svg"
        alt="ClinicSaaS™"
        width={150}
        height={33}
        priority
        className={cn("h-auto w-auto max-w-full", compact ? "max-h-7" : "max-h-8")}
      />
    </Link>
  );
}

export function GlobalHeader({ isArabic, mobileSidebarOpen, onOpenMobileSidebar, brand, search, controls, className }: GlobalHeaderProps) {
  const renderedBrand = brand ?? <DefaultBrand isArabic={isArabic} />;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full min-w-0 border-b border-[var(--cs-slate-200)] bg-white",
        className,
      )}
      data-testid="global-header"
    >
      {/* Mobile: deliberately separate composition — navigation/identity/tools first, search second. */}
      <div className="flex min-w-0 flex-col gap-2 px-2.5 py-2 sm:hidden">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="cs-interactive inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--cs-slate-700)]"
            aria-label={isArabic ? "فتح القائمة" : "Open navigation"}
            aria-expanded={mobileSidebarOpen}
            aria-controls="global-sidebar"
            data-testid="global-header-mobile-nav"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">{brand ?? <DefaultBrand isArabic={isArabic} compact />}</div>
          <nav aria-label={isArabic ? "أدوات النظام" : "System tools"} className="flex shrink-0 items-center gap-0.5" data-testid="global-header-mobile-controls">
            {controls}
          </nav>
        </div>
        <div className="min-w-0" data-testid="global-header-mobile-search">{search}</div>
      </div>

      {/* Tablet: deliberate two-zone composition with search and tools given their own row. */}
      <div className="hidden min-w-0 flex-col gap-2 px-3 py-2 sm:flex lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="cs-interactive inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--cs-slate-700)]"
            aria-label={isArabic ? "فتح القائمة" : "Open navigation"}
            aria-expanded={mobileSidebarOpen}
            aria-controls="global-sidebar"
            data-testid="global-header-tablet-nav"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">{brand ?? <DefaultBrand isArabic={isArabic} />}</div>
          <div className="min-w-0 w-[min(52vw,28rem)]" data-testid="global-header-tablet-search">{search}</div>
        </div>
        <nav aria-label={isArabic ? "أدوات النظام" : "System tools"} className="flex min-w-0 items-center justify-end gap-1 overflow-x-auto py-0.5" data-testid="global-header-tablet-controls">
          {controls}
        </nav>
      </div>

      {/* Desktop: single-row composition with explicit independent zones. */}
      <div className="hidden min-w-0 items-center gap-3 px-5 py-2.5 lg:flex">
        <div className="min-w-0 shrink-0">{renderedBrand}</div>
        <div className="min-w-[16rem] max-w-[34rem] flex-1" data-testid="global-header-desktop-search">{search}</div>
        <nav aria-label={isArabic ? "أدوات النظام" : "System tools"} className="flex shrink-0 items-center gap-1" data-testid="global-header-desktop-controls">
          {controls}
        </nav>
      </div>
    </header>
  );
}
