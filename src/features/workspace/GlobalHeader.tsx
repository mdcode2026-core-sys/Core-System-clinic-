"use client";

import type { ReactNode, RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import styles from "./GlobalSurfacesDesktopGeometry.module.css";

interface GlobalHeaderProps {
  isArabic: boolean;
  mobileSidebarOpen: boolean;
  onOpenMobileSidebar: () => void;
  mobileSidebarTriggerRef?: RefObject<HTMLButtonElement | null>;
  brand?: ReactNode;
  search?: ReactNode;
  controls?: ReactNode;
  className?: string;
}

export function GlobalHeader({
  isArabic,
  mobileSidebarOpen,
  onOpenMobileSidebar,
  mobileSidebarTriggerRef,
  brand,
  search,
  controls,
  className,
}: GlobalHeaderProps) {
  const defaultBrand = (
    <Link
      href="/"
      className="inline-flex min-h-10 max-w-[9.5rem] shrink-0 items-center rounded-lg px-0.5 transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:min-h-11"
      aria-label={isArabic ? "الرئيسية — ClinicSaaS" : "Home — ClinicSaaS"}
      data-testid="global-header-brand"
    >
      <Image
        src="/brand/clinicsaas-header.svg"
        alt="ClinicSaaS™"
        width={150}
        height={33}
        priority
        className="h-7 w-auto max-w-[8rem] sm:h-8 sm:max-w-[9.5rem]"
      />
    </Link>
  );

  return (
    <header
      dir={isArabic ? "rtl" : "ltr"}
      className={cn(
        styles.geometry,
        "sticky top-0 z-30 grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_auto] items-center gap-x-2 gap-y-1 overflow-visible border-b border-slate-200 bg-white px-2 pt-[env(safe-area-inset-top)] pb-2 shadow-[0_1px_8px_rgba(15,23,42,0.04)] sm:px-3 md:grid-cols-[auto_minmax(12rem,1fr)_auto] md:grid-rows-1 md:gap-3 md:px-4 lg:px-5",
        className,
      )}
      data-testid="global-header"
    >
      <div className="flex min-w-0 items-center gap-2" data-testid="global-header-identity">
        <button
          ref={mobileSidebarTriggerRef}
          type="button"
          onClick={onOpenMobileSidebar}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 lg:hidden"
          aria-label={isArabic ? "فتح القائمة" : "Open navigation"}
          aria-expanded={mobileSidebarOpen}
          aria-controls="global-sidebar"
          data-testid="global-header-mobile-nav"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="min-w-0 shrink">{brand ?? defaultBrand}</div>
      </div>

      <div
        className="col-span-2 min-w-0 justify-self-stretch md:col-span-1 md:mx-auto md:w-full md:max-w-[30rem]"
        data-testid="global-header-search-slot"
      >
        {search}
      </div>

      {controls ? (
        <div
          className="col-start-2 row-start-1 flex min-w-0 max-w-full items-center justify-self-end gap-0.5 overflow-visible md:col-start-3 md:row-start-1"
          data-testid="global-header-controls"
          aria-label={isArabic ? "أدوات النظام العامة" : "Global controls"}
        >
          {controls}
        </div>
      ) : null}
    </header>
  );
}