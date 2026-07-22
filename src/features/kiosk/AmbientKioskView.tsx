"use client";

// src/features/kiosk/AmbientKioskView.tsx
// Phase 4 — Queue Management Module
// Self-service kiosk for patient check-in

import { useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { findPatientByPhone, checkInPatient } from "@/domain/queue/queue.actions";
import { createPatientFromObject } from "@/domain/patients/patients.actions";
import {
  Stethoscope,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface AmbientKioskViewProps {
  tenantId?: string;
}

export function AmbientKioskView({ tenantId: propTenantId }: AmbientKioskViewProps) {
  const { tenantId: authTenantId } = useAuth();
  const tenantId = propTenantId || authTenantId;

  const [mode, setMode] = useState<"idle" | "checkin" | "register" | "queue" | "error">("idle");
  const [phone, setPhone] = useState("");
  const [patientName, setPatientName] = useState("");
  const [queueNumber, setQueueNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="border-slate-700 bg-slate-800/80 backdrop-blur text-center">
          <CardContent className="p-8">
            <p className="text-slate-400">جاري التحميل...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCheckIn = async () => {
    if (phone.length < 8) {
      setErrorMessage("الرجاء إدخال رقم هاتف صحيح");
      setMode("error");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const patient = await findPatientByPhone(phone, tenantId);
      if (patient) {
        const session = await checkInPatient({
          patient_id: patient.id,
        });
        setQueueNumber("A" + session.id.slice(-2).toUpperCase());
        setMode("queue");
      } else {
        setMode("register");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "فشل البحث عن المريض");
      setMode("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAndCheckIn = async () => {
    if (!patientName.trim() || phone.length < 8) {
      setErrorMessage("الرجاء إكمال جميع البيانات");
      setMode("error");
      return;
    }
    setIsSubmitting(true);

    try {
      const newPatient = await createPatientFromObject({
        tenant_id: tenantId,
        first_name: patientName,
        last_name: "",
        phone_primary: phone,
        patient_status: "active",
      });

      if (newPatient.error) {
        throw new Error(newPatient.error);
      }

      if (newPatient.data) {
        const session = await checkInPatient({
          patient_id: newPatient.data.id,
        });
        setQueueNumber("A" + session.id.slice(-2).toUpperCase());
        setMode("queue");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "فشل التسجيل");
      setMode("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetKiosk = () => {
    setMode("idle");
    setPhone("");
    setPatientName("");
    setQueueNumber(null);
    setErrorMessage("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {mode === "idle" && (
          <Card className="border-slate-700 bg-slate-800/80 backdrop-blur">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Stethoscope className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl text-white">مرحبا بكم في العيادة</CardTitle>
              <p className="text-slate-400 mt-2">يرجى تسجيل حضورك</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setMode("checkin")} className="w-full h-16 text-lg" size="lg">
                <Clock className="w-6 h-6 ml-2" />تسجيل حضور
              </Button>
            </CardContent>
          </Card>
        )}

        {mode === "checkin" && (
          <Card className="border-slate-700 bg-slate-800/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">تسجيل الحضور</CardTitle>
              <p className="text-slate-400">أدخل رقم هاتفك للبحث</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="مثال: 0501234567" className="pr-10 text-right text-lg h-14" type="tel" maxLength={10} />
              </div>
              <Button onClick={handleCheckIn} className="w-full h-14 text-lg" disabled={isSubmitting}>
                {isSubmitting ? "جاري البحث..." : "بحث"}
              </Button>
              <Button onClick={resetKiosk} variant="ghost" className="w-full text-slate-400">رجوع</Button>
            </CardContent>
          </Card>
        )}

        {mode === "register" && (
          <Card className="border-slate-700 bg-slate-800/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">تسجيل مريض جديد</CardTitle>
              <p className="text-slate-400">أكمل بياناتك للتسجيل</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الهاتف" className="pr-10 text-right h-12" type="tel" maxLength={10} />
              </div>
              <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="الاسم الكامل" className="text-right h-12" />
              <Button onClick={handleRegisterAndCheckIn} className="w-full h-14 text-lg" disabled={isSubmitting}>
                {isSubmitting ? "جاري التسجيل..." : "تسجيل و تأكيد الحضور"}
              </Button>
              <Button onClick={() => setMode("checkin")} variant="ghost" className="w-full text-slate-400">رجوع</Button>
            </CardContent>
          </Card>
        )}

        {mode === "queue" && queueNumber && (
          <Card className="border-slate-700 bg-slate-800/80 backdrop-blur text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-white">تم التسجيل بنجاح</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-slate-400 mb-2">رقمك في الانتظار</p>
                <div className="text-6xl font-bold text-primary">{queueNumber}</div>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">في الانتظار</Badge>
              <p className="text-slate-400">سيتم استدعاؤك قريباً</p>
              <Button onClick={resetKiosk} className="w-full h-12 text-lg">تم</Button>
            </CardContent>
          </Card>
        )}

        {mode === "error" && (
          <Card className="border-red-700 bg-slate-800/80 backdrop-blur text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl text-white">حدث خطأ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400">{errorMessage || "الرجاء المحاولة مرة أخرى"}</p>
              <Button onClick={resetKiosk} className="w-full">
                <ArrowRight className="w-4 h-4 ml-2" />المحاولة مرة أخرى
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
