"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { createPatient, updatePatient } from "@/domain/patients/patients.actions";
import type { Patient } from "@/domain/patients/patients.types";

interface PatientFormProps {
  patient?: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PatientForm({ patient, isOpen, onClose, onSuccess }: PatientFormProps) {
  const { tenantId } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: patient?.first_name || "",
    last_name: patient?.last_name || "",
    first_name_ar: patient?.first_name_ar || "",
    last_name_ar: patient?.last_name_ar || "",
    phone_primary: patient?.phone_primary || "",
    phone_secondary: patient?.phone_secondary || "",
    email: patient?.email || "",
    date_of_birth: patient?.date_of_birth || "",
    gender: patient?.gender || "",
    preferred_channel: patient?.preferred_channel || "whatsapp",
    referral_source: patient?.referral_source || "",
    patient_status: patient?.patient_status || "active",
    notes: patient?.notes || "",
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name.trim()) newErrors.first_name = "الاسم الأول مطلوب";
    if (!formData.last_name.trim()) newErrors.last_name = "الاسم الأخير مطلوب";
    if (!formData.phone_primary.trim()) newErrors.phone_primary = "الهاتف الرئيسي مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    if (!tenantId) {
      setServerError("خطأ: لم يتم التعرف على العيادة");
      return;
    }

    const form = new FormData();
    form.append("tenant_id", tenantId);
    form.append("first_name", formData.first_name);
    form.append("last_name", formData.last_name);
    form.append("first_name_ar", formData.first_name_ar);
    form.append("last_name_ar", formData.last_name_ar);
    form.append("phone_primary", formData.phone_primary);
    form.append("phone_secondary", formData.phone_secondary);
    form.append("email", formData.email);
    form.append("date_of_birth", formData.date_of_birth);
    form.append("gender", formData.gender);
    form.append("preferred_channel", formData.preferred_channel);
    form.append("referral_source", formData.referral_source);
    form.append("patient_status", formData.patient_status);
    form.append("notes", formData.notes);

    startTransition(async () => {
      try {
        let result;
        if (patient) {
          form.append("id", patient.id);
          result = await updatePatient(form);
        } else {
          result = await createPatient(form);
        }

        if (result.error) {
          setServerError(result.error);
        } else {
          onSuccess?.();
          onClose();
        }
      } catch (err) {
        setServerError("حدث خطأ غير متوقع");
      }
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{patient ? "تعديل مريض" : "مريض جديد"}</DialogTitle>
          <DialogDescription>
            {patient ? "تعديل بيانات المريض الحالي" : "إضافة مريض جديد إلى النظام"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">الاسم الأول *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                placeholder="محمد"
                className={errors.first_name ? "border-destructive" : ""}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">الاسم الأخير *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                placeholder="العلي"
                className={errors.last_name ? "border-destructive" : ""}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name_ar">الاسم الأول (عربي)</Label>
              <Input
                id="first_name_ar"
                value={formData.first_name_ar}
                onChange={(e) => handleChange("first_name_ar", e.target.value)}
                placeholder="محمد"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name_ar">الاسم الأخير (عربي)</Label>
              <Input
                id="last_name_ar"
                value={formData.last_name_ar}
                onChange={(e) => handleChange("last_name_ar", e.target.value)}
                placeholder="العلي"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_primary">الهاتف الرئيسي *</Label>
              <Input
                id="phone_primary"
                value={formData.phone_primary}
                onChange={(e) => handleChange("phone_primary", e.target.value)}
                placeholder="0501234567"
                className={errors.phone_primary ? "border-destructive" : ""}
              />
              {errors.phone_primary && (
                <p className="text-sm text-destructive">{errors.phone_primary}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_secondary">الهاتف الثانوي</Label>
              <Input
                id="phone_secondary"
                value={formData.phone_secondary}
                onChange={(e) => handleChange("phone_secondary", e.target.value)}
                placeholder="0501234567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="patient@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => handleChange("date_of_birth", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">الجنس</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الجنس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                  <SelectItem value="other">آخر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_channel">القناة المفضلة</Label>
              <Select
                value={formData.preferred_channel}
                onValueChange={(value) => handleChange("preferred_channel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القناة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">واتساب</SelectItem>
                  <SelectItem value="sms">رسائل نصية</SelectItem>
                  <SelectItem value="email">بريد</SelectItem>
                  <SelectItem value="phone">هاتف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="referral_source">مصدر الإحالة</Label>
              <Input
                id="referral_source"
                value={formData.referral_source}
                onChange={(e) => handleChange("referral_source", e.target.value)}
                placeholder="مثال: فيسبوك، توصية صديق..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patient_status">الحالة</Label>
              <Select
                value={formData.patient_status}
                onValueChange={(value) => handleChange("patient_status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                  <SelectItem value="blocked">محظور</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="أي ملاحظات إضافية..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} type="button" disabled={isPending}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
