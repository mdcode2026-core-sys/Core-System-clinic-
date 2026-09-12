"use client";

import type { ReactNode } from "react";
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

/**
 * Authenticated global shell header.
 *
 * This component owns only global shell structure. Domain capabilities are
 * injected through slots so the header cannot become an authorization or
 * business-workflow owner.
 */
export function GlobalHeader({
  isArabic,
  mobileSidebarOpen,
  onOpenMobileSidebar,
  brand,
  search,
  controls,
  className,
}: GlobalHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b bg-white/95 px-4 py-2 backdrop-blur",
        className,
      )}
      data-testid="global-header"
    >
      <button
        type="button"
        onClick={onOpenMobileSidebar}
        className="rounded p-2 hover:bg-gray-100 lg:hidden"
        aria-label={isArabic ? "فتح القائمة" : "Open navigation"}
        aria-expanded={mobileSidebarOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      {brand ? <div className="flex shrink-0 items-center">{brand}</div> : null}

      <div className="min-w-0 flex-1">{search}</div>

      {controls ? (
        <div
          className="flex shrink-0 items-center gap-1"
          data-testid="global-header-controls"
        >
          {controls}
        </div>
      ) : null}
    </header>
  );
}
