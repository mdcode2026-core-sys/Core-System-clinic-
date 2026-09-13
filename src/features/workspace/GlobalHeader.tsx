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

export function GlobalHeader({
  isArabic,
  mobileSidebarOpen,
  onOpenMobileSidebar,
  brand,
  search,
  controls,
  className,
}: GlobalHeaderProps) {
  const defaultBrand = (
    <Link
      href="/"
      className="inline-flex h-10 shrink-0 items-center rounded-lg px-1 transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label={isArabic ? "الرئيسية — ClinicSaaS" : "Home — ClinicSaaS"}
      data-testid="global-header-brand"
    >
      <Image
        src="/brand/clinicsaas-header.svg"
        alt="ClinicSaaS™"
        width={150}
        height={33}
        priority
        className="h-8 w-auto max-w-[9.5rem]"
      />
    </Link>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-14 items-center gap-2 border-b bg-white/95 px-3 py-2 backdrop-blur md:gap-3 md:px-4",
        className,
      )}
      data-testid="global-header"
    >
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
        aria-label={isArabic ? "فتح القائمة" : "Open navigation"}
        aria-expanded={mobileSidebarOpen}
        aria-controls="global-sidebar"
        data-testid="global-header-mobile-nav"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex min-w-0 shrink-0 items-center">{brand ?? defaultBrand}</div>

      <div className="min-w-0 flex-1">{search}</div>

      {controls ? (
        <div
          className="flex shrink-0 items-center gap-0.5 md:gap-1"
          data-testid="global-header-controls"
        >
          {controls}
        </div>
      ) : null}
    </header>
  );
}
