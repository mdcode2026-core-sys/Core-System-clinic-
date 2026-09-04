import { redirect } from "next/navigation";

export default function InventoryPage(){
  redirect("/financial-resources?section=inventory");
}
