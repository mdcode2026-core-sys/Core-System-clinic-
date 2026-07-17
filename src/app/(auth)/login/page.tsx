"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/core/auth/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Stethoscope } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(redirectPath);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md border-slate-700 bg-slate-800/80 backdrop-blur">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Stethoscope className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl text-white">تسجيل الدخول</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">البريد الإلكتروني</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@clinic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-900 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">كلمة المرور</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-900 border-slate-600 text-white"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري الدخول..." : "دخول"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/register" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">
            ليس لديك حساب؟ سجل الآن
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">جاري التحميل...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
