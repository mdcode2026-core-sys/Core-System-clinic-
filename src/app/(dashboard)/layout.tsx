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
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <WorkspaceShell user={user}>
      {children}
    </WorkspaceShell>
  );
}