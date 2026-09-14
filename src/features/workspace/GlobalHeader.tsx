"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import styles from "./GlobalSurfacesDesktopGeometry.module.css";

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
    <Link href="/" className="inline-flex h-10 max-w-[9.5rem] shrink-0 items-center rounded-xl px-0.5 transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:h-11" aria-label={isArabic ? "الرئيسية — ClinicSaaS" : "Home — ClinicSaaS"} data-testid="global-header-brand">
      <Image src="/brand/clinicsaas-header.svg" alt="ClinicSaaS™" width={150} height={33} priority className="h-8 w-auto max-w-[9.5rem] sm:h-9" />
    </Link>
  );

  return (
    <header className={cn(styles.header, "sticky top-0 z-30 flex min-h-14 w-full min-w-0 items-center gap-1 overflow-visible border-b border-slate-200/90 bg-white/95 px-1.5 py-1.5 shadow-[0_1px_8px_rgba(15,23,42,0.04)] backdrop-blur sm:min-h-16 sm:gap-2 sm:px-3 sm:py-2 md:gap-2.5 md:px-4 lg:px-5", className)} data-testid="global-header">
      <button type="button" onClick={onOpenMobileSidebar} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:h-10 sm:w-10 sm:rounded-xl lg:hidden" aria-label={isArabic ? "فتح القائمة" : "Open navigation"} aria-expanded={mobileSidebarOpen} aria-controls="global-sidebar" data-testid="global-header-mobile-nav">
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="flex min-w-0 shrink-0 items-center">{brand ?? defaultBrand}</div>
      <div className="h-10 w-10 shrink-0 md:w-[min(26vw,24rem)] lg:w-[28rem]" data-testid="global-header-search-slot">{search}</div>
      {controls ? <div className="ms-auto flex shrink-0 items-center gap-0 rounded-xl border border-slate-200/80 bg-slate-50/70 p-0 sm:gap-0.5 sm:p-0.5" data-testid="global-header-controls">{controls}</div> : null}
    </header>
  );
}
