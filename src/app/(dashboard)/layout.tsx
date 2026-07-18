import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { DashboardShell } from "@/features/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // TEST: إضافة نص بسيط للتحقق
  return (
    <div>
      <p className="text-red-500 text-2xl text-center p-4">LAYOUT WORKS - User: {user.email}</p>
      <DashboardShell user={user}>{children}</DashboardShell>
    </div>
  );
}
