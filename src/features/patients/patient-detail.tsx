"use client";

import { useState } from "react";
import { usePatientById, usePatientHistory } from "@/domain/patients/patients.queries";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  ArrowLeft,
  Edit,
  History,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { PatientForm } from "./patient-form";
import type { Patient } from "@/domain/patients/patients.types";

interface PatientDetailProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientDetail({ patientId, isOpen, onClose }: PatientDetailProps) {
  const { data: patient, isLoading: patientLoading } = usePatientById(patientId);
  const { data: history, isLoading: historyLoading } = usePatientHistory(patientId);
  const [showEditForm, setShowEditForm] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      archived: "outline",
      blocked: "destructive",
    };
    const labels: Record<string, string> = {
      active: "نشط",
      inactive: "غير نشط",
      archived: "مؤرشف",
      blocked: "محظور",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  const getGenderLabel = (gender?: string) => {
    const labels: Record<string, string> = {
      male: "ذكر",
      female: "أنثى",
      other: "آخر",
    };
    return labels[gender || ""] || "—";
  };

  const getChannelLabel = (channel?: string) => {
    const labels: Record<string, string> = {
      whatsapp: "واتساب",
      sms: "رسائل نصية",
      email: "بريد",
      phone: "هاتف",
    };
    return labels[channel || ""] || "—";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("ar-SA");
    } catch {
      return dateStr;
    }
  };

  if (showEditForm && patient) {
    return (
      <PatientForm
        patient={patient}
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={() => {
          setShowEditForm(false);
        }}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            تفاصيل المريض
          </DialogTitle>
          <DialogDescription>
            عرض بيانات المريض وتاريخه
          </DialogDescription>
        </DialogHeader>

        {patientLoading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : !patient ? (
          <div className="text-center py-8 text-muted-foreground">لم يتم العثور على المريض</div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xl font-bold">
                        {patient.first_name[0]}{patient.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      {patient.first_name_ar && patient.last_name_ar && (
                        <p className="text-muted-foreground text-sm">
                          {patient.first_name_ar} {patient.last_name_ar}
                        </p>
                      )}
                      <div className="mt-2">{getStatusBadge(patient.patient_status)}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  معلومات التواصل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">الهاتف الرئيسي:</span>
                    <span className="text-sm font-medium">{patient.phone_primary}</span>
                  </div>
                  {patient.phone_secondary && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">الهاتف الثانوي:</span>
                      <span className="text-sm font-medium">{patient.phone_secondary}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">البريد:</span>
                      <span className="text-sm font-medium">{patient.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">القناة المفضلة:</span>
                    <span className="text-sm font-medium">{getChannelLabel(patient.preferred_channel)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  البيانات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">تاريخ الميلاد:</span>
                    <span className="text-sm font-medium">{formatDate(patient.date_of_birth)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">الجنس:</span>
                    <span className="text-sm font-medium">{getGenderLabel(patient.gender)}</span>
                  </div>
                  {patient.referral_source && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">مصدر الإحالة:</span>
                      <span className="text-sm font-medium">{patient.referral_source}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">تاريخ التسجيل:</span>
                    <span className="text-sm font-medium">{formatDate(patient.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {patient.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    ملاحظات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Patient History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="w-4 h-4" />
                  تاريخ المريض
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="text-center py-4 text-muted-foreground">جاري التحميل...</div>
                ) : !history ? (
                  <div className="text-center py-4 text-muted-foreground">لا يوجد تاريخ مسجل</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <div className="text-lg font-bold">{history.total_visits || 0}</div>
                      <div className="text-xs text-muted-foreground">عدد الزيارات</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <div className="text-lg font-bold">{formatDate(history.last_visit_date)}</div>
                      <div className="text-xs text-muted-foreground">آخر زيارة</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <FileText className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <div className="text-lg font-bold">{history.preferred_procedure || "—"}</div>
                      <div className="text-xs text-muted-foreground">الإجراء المفضل</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <div className="text-lg font-bold">{history.retention_risk || "—"}</div>
                      <div className="text-xs text-muted-foreground">مخاطر الاحتفاظ</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
