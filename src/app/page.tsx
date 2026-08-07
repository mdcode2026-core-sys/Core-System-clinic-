// src/app/page.tsx
// DEPRECATED — redirect only. Will be deleted after confirming zero external references.

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
