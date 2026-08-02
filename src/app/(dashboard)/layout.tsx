// src/app/(dashboard)/layout.tsx
// Package 3.0.2 — Server-side route guard: resolves permissions via permissionEngine.ts
// and redirects (not just hides) if the requested path's required permission is absent.
// Preserves existing auth check and DashboardShell wrapping.

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getRequiredPermission } from "@/core/navigation/navigationRegistry";
import { DashboardShell } from "@/features/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Existing auth check — preserve exactly
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Resolve tenant_id from JWT claims (same logic as server.ts and usePermissions)
  const tenantId =
    (user.app_metadata?.tenant_id as string | undefined) ||
    (user.user_metadata?.tenant_id as string | undefined);

  if (!tenantId) {
    // No tenant context — cannot resolve permissions; safest action is logout
    redirect("/login");
  }

  // 3. Resolve effective permissions via the permission engine
  let userPermissions: string[] = [];
  try {
    userPermissions = await getEffectivePermissions(user.id, tenantId);
  } catch (err) {
    console.error("[layout] permissionEngine failed:", err);
    // Fail-closed: if permission resolution breaks, redirect to login
    redirect("/login");
  }

  // 4. Route guard: check if the current path requires a permission this user lacks
  // We use headers() to read the current pathname in a server component.
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || headersList.get("x-matched-path") || "";

  // Fallback: if the Next.js internal headers aren't present, we cannot guard server-side
  // for this specific request, but the client-side DashboardShell will still hide the nav.
  // We do NOT block rendering in that case — we rely on the client shell for defense-in-depth.
  if (pathname) {
    const required = getRequiredPermission(pathname);

    if (required === undefined) {
      // Route not in registry — unknown route. Allow it (could be a future module).
      // If you want to block unknown routes, change this to redirect("/").
    } else if (required !== null) {
      // This route has a permission gate
      const hasPermission = userPermissions.includes(required);
      if (!hasPermission) {
        // Redirect to dashboard — unauthorized modules must never render
        redirect("/");
      }
    }
    // required === null means "always visible" (e.g. "/") — no check needed
  }

  // 5. Render the shell with the authenticated user
  return (
    <DashboardShell user={{ email: user.email ?? undefined }}>
      {children}
    </DashboardShell>
  );
}
