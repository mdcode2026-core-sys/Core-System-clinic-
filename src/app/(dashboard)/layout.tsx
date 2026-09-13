import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getAssignedWorkspace } from "@/core/workspace/currentWorkspace";
import { EntitlementAwareWorkspaceShell } from "@/features/workspace/EntitlementAwareWorkspaceShell";
import { AuthProvider } from "@/core/auth/AuthProvider";
import { DirectionProvider } from "@/components/DirectionProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims?.sub || typeof claims.sub !== "string") {
    redirect("/login");
  }

  const user = {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : undefined,
    user_metadata:
      claims.user_metadata && typeof claims.user_metadata === "object"
        ? (claims.user_metadata as { full_name?: string; name?: string })
        : undefined,
  };

  const assignedWorkspace = await getAssignedWorkspace(user.id);

  return (
    <AuthProvider>
      <DirectionProvider>
        <EntitlementAwareWorkspaceShell user={user} assignedWorkspace={assignedWorkspace}>
          {children}
        </EntitlementAwareWorkspaceShell>
      </DirectionProvider>
    </AuthProvider>
  );
}
