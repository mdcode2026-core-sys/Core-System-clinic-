"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface CommunicationsHeaderControlProps {
  isArabic: boolean;
}

/**
 * Header gateway into the tenant-wide Communications domain.
 *
 * Communications is a common clinic domain surface. The Header therefore does
 * not hide it behind a communications:read permission. Action-level permissions
 * remain enforced by the Communications domain and server-side authorization.
 */
export function CommunicationsHeaderControl({
  isArabic,
}: CommunicationsHeaderControlProps) {
  return (
    <Link
      href="/communications"
      prefetch
      className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label={isArabic ? "الاتصالات" : "Communications"}
      title={isArabic ? "الاتصالات" : "Communications"}
      data-testid="global-header-communications"
    >
      <MessageSquare className="h-4 w-4" aria-hidden="true" />
      <span className="hidden xl:inline">
        {isArabic ? "الاتصالات" : "Communications"}
      </span>
    </Link>
  );
}
