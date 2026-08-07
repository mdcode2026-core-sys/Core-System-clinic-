// src/app/(dashboard)/layout.tsx
// Workspace Architecture — Dashboard layout
// Server-side authentication guard.
// Passes authenticated user to WorkspaceShell.

import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { WorkspaceShell } from "@/features/workspace/WorkspaceShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <WorkspaceShell user={user}>
      {children}
    </WorkspaceShell>
  );
}