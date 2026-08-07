// src/app/page.tsx
// DEPRECATED — this file will be deleted once Package 3.1.1 cleanup is confirmed.
// For now, preserves the redirect so existing bookmarks do not break.
// TODO(Session 11 cleanup): remove this file after confirming no external references.

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
