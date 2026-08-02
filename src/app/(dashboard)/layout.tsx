// src/app/(dashboard)/layout.tsx
// Package 3.0.2 — Auth check + DashboardShell wrap.
// Server-side permission guard is now handled by middleware.ts at project root.

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { DashboardShell } from "@/features/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  return (
    <DashboardShell user={{ email: user.email ?? undefined }}>
      {children}
    </DashboardShell>
  );
}
