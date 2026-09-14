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
      className="cs-interactive inline-flex h-10 max-w-[8.25rem] shrink-0 items-center rounded-lg px-0.5 transition-opacity hover:opacity-85 sm:h-11 sm:max-w-[9.5rem]"
      aria-label={isArabic ? "الرئيسية — ClinicSaaS" : "Home — ClinicSaaS"}
      data-testid="global-header-brand"
    >
      <Image src="/brand/clinicsaas-header.svg" alt="ClinicSaaS™" width={150} height={33} priority className="h-7 w-auto max-w-[8.25rem] sm:h-8 sm:max-w-[9.5rem]" />
    </Link>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-14 w-full min-w-0 items-center gap-1 overflow-visible border-b border-[var(--cs-slate-200)] bg-white px-2 py-2 sm:min-h-16 sm:gap-2 sm:px-3 md:gap-2.5 md:px-4 lg:px-5",
        className,
      )}
      data-testid="global-header"
    >
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        className="cs-interactive inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--cs-slate-700)] transition-colors hover:bg-[var(--cs-slate-100)] hover:text-[var(--cs-ink-950)] lg:hidden"
        aria-label={isArabic ? "فتح القائمة" : "Open navigation"}
        aria-expanded={mobileSidebarOpen}
        aria-controls="global-sidebar"
        data-testid="global-header-mobile-nav"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="min-w-0 shrink items-center overflow-hidden">{brand ?? defaultBrand}</div>

      <div className="h-10 min-w-0 shrink-0 md:w-[min(30vw,24rem)] lg:w-[28rem]" data-testid="global-header-search-slot">
        {search}
      </div>

      {controls ? (
        <div className="ms-auto flex min-w-0 shrink items-center justify-end gap-0.5 sm:gap-1" data-testid="global-header-controls">
          {controls}
        </div>
      ) : null}
    </header>
  );
}
