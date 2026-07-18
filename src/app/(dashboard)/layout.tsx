import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TEST: بدون Supabase
  return (
    <div>
      <p className="text-red-500 text-2xl text-center p-4">TEST LAYOUT</p>
      {children}
    </div>
  );
}
