import Link from "next/link";
import { cookies } from "next/headers";

export default async function InvoicesLayout({ children }: { children: React.ReactNode }) {
  const raw = (await cookies()).get("core-system-locale")?.value;
  const ar = raw === "ar";
  return <div className="space-y-4">
    <nav aria-label={ar ? "الفواتير والمالية" : "Billing"} className="flex flex-wrap gap-2 px-6 pt-4" dir={ar ? "rtl" : "ltr"}>
      <Link href="/invoices" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">{ar ? "الفواتير والمدفوعات" : "Billing & Invoices"}</Link>
      <Link href="/invoices/financial" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">{ar ? "الخطط المالية والأقساط والتأمين" : "Financial Plans & Insurance"}</Link>
    </nav>
    {children}
  </div>;
}
