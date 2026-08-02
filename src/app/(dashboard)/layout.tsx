// src/app/(dashboard)/layout.tsx
// Package 3.0.2 — Server-side auth check only.
// Route guard moved to client-side DashboardShell to avoid unreliable
// pathname reading in Server Components on Vercel.

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { DashboardShell } from "@/features/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Auth check only
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
