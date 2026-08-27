import Link from "next/link";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">
    <nav aria-label="Inventory" className="flex flex-wrap gap-2 px-4 pt-4 sm:px-6 lg:px-8">
      <Link href="/inventory" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">Inventory</Link>
      <Link href="/inventory/purchasing" className="rounded-md border px-3 py-2 text-sm hover:bg-muted">Suppliers & Purchasing</Link>
    </nav>
    {children}
  </div>;
}
