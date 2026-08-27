import Link from "next/link";
import { cookies } from "next/headers";

export default async function InventoryLayout({ children }: { children: React.ReactNode }) {
  const raw = (await cookies()).get("core-system-locale")?.value;
  const ar = raw === "ar";
  return <div className="space-y-4">
    <nav aria-label={ar ? "المخزون والمشتريات" : "Inventory"} className="flex flex-wrap gap-2 px-4 pt-4 sm:px-6 lg:px-8" dir={ar ? "rtl" : "ltr"}>
      <Link href="/inventory" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">{ar ? "المخزون" : "Inventory"}</Link>
      <Link href="/inventory/purchasing" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">{ar ? "الموردون والمشتريات" : "Suppliers & Purchasing"}</Link>
    </nav>
    {children}
  </div>;
}
