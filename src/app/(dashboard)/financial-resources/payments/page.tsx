import { redirect } from "next/navigation";

export default function FinancialResourcesPaymentsPage() {
  redirect("/financial-resources?section=payments");
}
