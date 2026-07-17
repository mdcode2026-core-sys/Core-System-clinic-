"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/core/auth/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Stethoscope } from "lucide-react";
import Link from "next/link";

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await signUp(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/check-email");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md border-slate-700 bg-slate-800/80 backdrop-blur">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Stethoscope className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl text-white">إنشاء حساب جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-white">الاسم الكامل</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="محمد أحمد"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-slate-900 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinic_name" className="text-white">اسم العيادة</Label>
            <Input
              id="clinic_name"
              name="clinic_name"
              type="text"
              placeholder="عيادة النور"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              required
              className="bg-slate-900 border-slate-600 text-white"
            />
          </div>
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
            {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">
            لديك حساب؟ سجل الدخول
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">جاري التحميل...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
