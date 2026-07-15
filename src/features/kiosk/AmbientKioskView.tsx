"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Stethoscope, UserPlus, Clock, Phone } from "lucide-react";

export function AmbientKioskView() {
  const [mode, setMode] = useState<"idle" | "checkin" | "register" | "queue">("idle");
  const [phone, setPhone] = useState("");
  const [queueNumber, setQueueNumber] = useState<string | null>(null);

  const handleCheckIn = () => {
    if (phone.length >= 8) {
      setQueueNumber("A" + Math.floor(Math.random() * 100).toString().padStart(2, "0"));
      setMode("queue");
    }
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
              <CardTitle className="text-3xl text-white">مرحباً بكم في العيادة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setMode("checkin")} className="w-full h-16 text-lg" size="lg">
                <Clock className="w-6 h-6 ml-2" />
                تسجيل حضور
              </Button>
              <Button onClick={() => setMode("register")} variant="outline" className="w-full h-16 text-lg border-slate-600 text-white hover:bg-slate-700" size="lg">
                <UserPlus className="w-6 h-6 ml-2" />
                تسجيل مريض جديد
              </Button>
            </CardContent>
          </Card>
        )}

        {mode === "checkin" && (
          <Card className="border-slate-700 bg-slate-800/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">تسجيل الحضور</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="أدخل رقم الهاتف" className="pr-10 text-right text-lg h-14" />
              </div>
              <Button onClick={handleCheckIn} className="w-full h-14 text-lg">تأكيد الحضور</Button>
              <Button onClick={() => setMode("idle")} variant="ghost" className="w-full text-slate-400">رجوع</Button>
            </CardContent>
          </Card>
        )}

        {mode === "queue" && queueNumber && (
          <Card className="border-slate-700 bg-slate-800/80 backdrop-blur text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-white">تم تسجيل حضورك بنجاح</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-6xl font-bold text-primary">{queueNumber}</div>
              <Badge variant="secondary" className="text-lg px-4 py-2">في الانتظار</Badge>
              <p className="text-slate-400">سيتم استدعاؤك قريباً</p>
              <Button onClick={() => { setMode("idle"); setPhone(""); setQueueNumber(null); }} className="w-full">تم</Button>
            </CardContent>
          </Card>
        )}

        {mode === "register" && (
          <Card className="border-slate-700 bg-slate-800/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">تسجيل مريض جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="الاسم الأول" className="text-right h-12" />
              <Input placeholder="الاسم الأخير" className="text-right h-12" />
              <Input placeholder="رقم الهاتف" className="text-right h-12" />
              <Button className="w-full h-14 text-lg">تسجيل</Button>
              <Button onClick={() => setMode("idle")} variant="ghost" className="w-full text-slate-400">رجوع</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
