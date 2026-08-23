"use client";

import { useState } from "react";
import { usePatientById, usePatientHistory } from "@/domain/patients/patients.queries";
import { usePermissions } from "@/core/permissions/usePermissions";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { User, Phone, Mail, Calendar, MapPin, FileText, ArrowLeft, Edit, History, TrendingUp, AlertTriangle, LogIn } from "lucide-react";
import { checkInPatient } from "@/domain/queue/queue.actions";
import { PatientForm } from "./patient-form";
import { MedicalFilesPanel } from "@/features/medical-files/ui/MedicalFilesPanel";
import type { Patient } from "@/domain/patients/patients.types";

interface PatientDetailProps { patientId: string | null; isOpen: boolean; onClose: () => void; onBookAppointment?: (patientId: string) => void; }

export function PatientDetail({ patientId, isOpen, onClose, onBookAppointment }: PatientDetailProps) {
  const { data: patient, isLoading: patientLoading } = usePatientById(patientId);
  const { data: history, isLoading: historyLoading } = usePatientHistory(patientId);
  const { hasPermission, isLoading: permsLoading } = usePermissions();
  const [showEditForm, setShowEditForm] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState("");

  const getStatusBadge = (status: string) => { const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = { active: "default", inactive: "secondary", archived: "outline", blocked: "destructive" }; const labels: Record<string, string> = { active: "نشط", inactive: "غير نشط", archived: "مؤرشف", blocked: "محظور" }; return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>; };
  const getGenderLabel = (gender?: string) => ({ male: "ذكر", female: "أنثى", other: "آخر" } as Record<string, string>)[gender || ""] || "—";
  const getChannelLabel = (channel?: string) => ({ whatsapp: "واتساب", sms: "رسائل نصية", email: "بريد", phone: "هاتف" } as Record<string, string>)[channel || ""] || "—";
  const formatDate = (dateStr?: string) => { if (!dateStr) return "—"; try { return new Date(dateStr).toLocaleDateString("ar-SA"); } catch { return dateStr; } };

  async function handleCheckIn() { if (!patient) return; setIsCheckingIn(true); setCheckInError(""); try { await checkInPatient({ patient_id: patient.id }); onClose(); } catch (err: any) { setCheckInError(err.message || "فشل تسجيل الحضور"); } finally { setIsCheckingIn(false); } }
  function handleBookAppointment() { if (!patient || !onBookAppointment) return; onBookAppointment(patient.id); onClose(); }

  if (showEditForm && patient) return <PatientForm patient={patient} isOpen={showEditForm} onClose={() => setShowEditForm(false)} onSuccess={() => setShowEditForm(false)} />;

  return <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>تفاصيل المريض</DialogTitle>
        <DialogDescription>عرض بيانات المريض وتاريخه وملفاته الطبية</DialogDescription>
      </DialogHeader>
      {patientLoading ? <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div> : !patient ? <div className="text-center py-8 text-muted-foreground">لم يتم العثور على المريض</div> : <div className="space-y-6">
        <Card><CardContent className="pt-6"><div className="flex items-start justify-between"><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-primary text-xl font-bold">{patient.first_name[0]}{patient.last_name[0]}</span></div><div><h3 className="text-xl font-semibold">{patient.first_name} {patient.last_name}</h3>{patient.first_name_ar && patient.last_name_ar && <p className="text-muted-foreground text-sm">{patient.first_name_ar} {patient.last_name_ar}</p>}<div className="mt-2">{getStatusBadge(patient.patient_status)}</div></div></div><div className="flex items-center gap-2">{!permsLoading && hasPermission("agenda:create") && onBookAppointment && <Button variant="outline" size="sm" onClick={handleBookAppointment}><Calendar className="w-4 h-4 ml-2" />حجز موعد</Button>}{!permsLoading && hasPermission("sessions:create") && <Button variant="default" size="sm" onClick={handleCheckIn} disabled={isCheckingIn}><LogIn className="w-4 h-4 ml-2" />{isCheckingIn ? "جاري..." : "تسجيل في الطابور"}</Button>}{!permsLoading && hasPermission("patients:update") && <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}><Edit className="w-4 h-4 ml-2" />تعديل</Button>}</div></div></CardContent></Card>
        {checkInError && <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">{checkInError}</div>}
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Phone className="w-4 h-4" />معلومات التواصل</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">الهاتف الرئيسي:</span><span className="text-sm font-medium">{patient.phone_primary}</span></div>{patient.phone_secondary && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">الهاتف الثانوي:</span><span className="text-sm font-medium">{patient.phone_secondary}</span></div>}{patient.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">البريد:</span><span className="text-sm font-medium">{patient.email}</span></div>}<div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">القناة المفضلة:</span><span className="text-sm font-medium">{getChannelLabel(patient.preferred_channel)}</span></div></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" />البيانات الشخصية</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">تاريخ الميلاد:</span><span className="text-sm font-medium">{formatDate(patient.date_of_birth)}</span></div><div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">الجنس:</span><span className="text-sm font-medium">{getGenderLabel(patient.gender)}</span></div>{patient.referral_source && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">مصدر الإحالة:</span><span className="text-sm font-medium">{patient.referral_source}</span></div>}<div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">تاريخ التسجيل:</span><span className="text-sm font-medium">{formatDate(patient.created_at)}</span></div></div></CardContent></Card>
        {patient.notes && <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" />ملاحظات</CardTitle></CardHeader><CardContent><p className="text-sm whitespace-pre-wrap">{patient.notes}</p></CardContent></Card>}
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4" />تاريخ المريض</CardTitle></CardHeader><CardContent>{historyLoading ? <div className="text-center py-4 text-muted-foreground">جاري التحميل...</div> : !history ? <div className="text-center py-4 text-muted-foreground">لا يوجد تاريخ مسجل</div> : <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><div className="text-center p-3 rounded-lg bg-muted"><TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" /><div className="text-lg font-bold">{history.total_visits || 0}</div><div className="text-xs text-muted-foreground">عدد الزيارات</div></div><div className="text-center p-3 rounded-lg bg-muted"><Calendar className="w-5 h-5 mx-auto mb-1 text-primary" /><div className="text-lg font-bold">{formatDate(history.last_visit_date)}</div><div className="text-xs text-muted-foreground">آخر زيارة</div></div><div className="text-center p-3 rounded-lg bg-muted"><FileText className="w-5 h-5 mx-auto mb-1 text-primary" /><div className="text-lg font-bold">{history.preferred_procedure || "—"}</div><div className="text-xs text-muted-foreground">الإجراء المفضل</div></div><div className="text-center p-3 rounded-lg bg-muted"><AlertTriangle className="w-5 h-5 mx-auto mb-1 text-primary" /><div className="text-lg font-bold">{history.retention_risk || "—"}</div><div className="text-xs text-muted-foreground">مخاطر الاحتفاظ</div></div></div>}</CardContent></Card>
        <MedicalFilesPanel patientId={patient.id} />
      </div>}
    </DialogContent>
  </Dialog>;
}
