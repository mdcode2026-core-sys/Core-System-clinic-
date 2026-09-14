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

export function GlobalHeader({ isArabic, mobileSidebarOpen, onOpenMobileSidebar, brand, search, controls, className }: GlobalHeaderProps) {
  const defaultBrand = (
    <Link
      href="/"
      className="cs-interactive inline-flex h-10 max-w-[6.5rem] shrink-0 items-center rounded-lg px-0.5 sm:h-11 sm:max-w-[9.5rem]"
      aria-label={isArabic ? "الرئيسية — ClinicSaaS" : "Home — ClinicSaaS"}
      data-testid="global-header-brand"
    >
      <Image src="/brand/clinicsaas-header.svg" alt="ClinicSaaS™" width={150} height={33} priority className="h-7 w-auto max-w-full sm:h-8" />
    </Link>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full min-w-0 border-b border-[var(--cs-slate-200)] bg-white px-2 py-2 sm:px-3 md:px-4 lg:px-5",
        className,
      )}
      data-testid="global-header"
    >
      <div className="flex min-w-0 w-full flex-wrap items-center gap-1.5 sm:gap-2 md:gap-2.5">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="cs-interactive inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--cs-slate-700)] lg:hidden"
          aria-label={isArabic ? "فتح القائمة" : "Open navigation"}
          aria-expanded={mobileSidebarOpen}
          aria-controls="global-sidebar"
          data-testid="global-header-mobile-nav"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 max-w-[6.5rem] shrink sm:max-w-[9.5rem]">{brand ?? defaultBrand}</div>

        <div className="h-10 w-10 shrink-0 md:min-w-0 md:flex-1 md:max-w-[28rem]" data-testid="global-header-search-slot">
          {search}
        </div>

        {controls ? (
          <nav
            aria-label={isArabic ? "أدوات النظام" : "System tools"}
            className="cs-header-tools order-4 flex min-w-0 basis-full items-center gap-1 overflow-x-auto py-1 md:order-none md:ms-auto md:basis-auto md:overflow-visible md:py-0"
            data-testid="global-header-controls"
          >
            {controls}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
