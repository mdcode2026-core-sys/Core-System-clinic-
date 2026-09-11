"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { usePermissions } from "@/core/permissions/usePermissions";

interface CommunicationsHeaderControlProps {
  isArabic: boolean;
}

/**
 * Header gateway into the authoritative Communications domain.
 *
 * This adapter owns no communication data, unread state, authorization rules,
 * or messaging behavior. Visibility comes from the existing effective
 * permission model and the destination remains the domain-owned route.
 */
export function CommunicationsHeaderControl({
  isArabic,
}: CommunicationsHeaderControlProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission("communications:read")) return null;

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
