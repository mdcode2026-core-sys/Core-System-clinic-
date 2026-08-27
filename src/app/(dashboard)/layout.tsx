import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { EntitlementAwareWorkspaceShell } from "@/features/workspace/EntitlementAwareWorkspaceShell";
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
        <EntitlementAwareWorkspaceShell user={user}>
          {children}
        </EntitlementAwareWorkspaceShell>
      </DirectionProvider>
    </AuthProvider>
  );
}
