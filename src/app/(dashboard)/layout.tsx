import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { WorkspaceShell } from "@/features/workspace/WorkspaceShell";
import { AuthProvider } from "@/core/auth/AuthProvider";
import { DirectionProvider } from "@/components/DirectionProvider";

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
    <AuthProvider>
      <DirectionProvider>
        <WorkspaceShell user={user}>
          {children}
        </WorkspaceShell>
      </DirectionProvider>
    </AuthProvider>
  );
}
