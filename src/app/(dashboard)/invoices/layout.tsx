import Link from "next/link";

export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">
    <nav aria-label="Billing" className="flex flex-wrap gap-2 px-6 pt-4">
      <Link href="/invoices" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">Billing & Invoices</Link>
      <Link href="/invoices/financial" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">Financial Plans & Insurance</Link>
    </nav>
    {children}
  </div>;
}
