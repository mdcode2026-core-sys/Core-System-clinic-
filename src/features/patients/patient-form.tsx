"use client";

import { useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { useCreatePatient, useUpdatePatient } from "@/domain/patients/patients.queries";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { X, Save } from "lucide-react";
import type { Patient, PatientInsert, PatientUpdate } from "@/domain/patients/patients.types";

interface PatientFormProps {
  patient?: Patient | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PatientForm({ patient, onClose, onSuccess }: PatientFormProps) {
  const { tenantId } = useAuth();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  const [formData, setFormData] = useState<PatientInsert | PatientUpdate>({
    tenant_id: tenantId || "",
    first_name: patient?.first_name || "",
    last_name: patient?.last_name || "",
    first_name_ar: patient?.first_name_ar || "",
    last_name_ar: patient?.last_name_ar || "",
    date_of_birth: patient?.date_of_birth || "",
    gender: patient?.gender || "male",
    phone_primary: patient?.phone_primary || "",
    phone_secondary: patient?.phone_secondary || "",
    email: patient?.email || "",
    preferred_channel: patient?.preferred_channel || "whatsapp",
    first_visit_date: patient?.first_visit_date || "",
    referral_source: patient?.referral_source || "",
    patient_status: patient?.patient_status || "active",
    notes: patient?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name) newErrors.first_name = "الاسم الأول مطلوب";
    if (!formData.last_name) newErrors.last_name = "الاسم الأخير مطلوب";
    if (!formData.phone_primary) newErrors.phone_primary = "الهاتف الرئيسي مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (patient) {
        await updatePatient.mutateAsync({ id: patient.id, ...formData });
      } else {
        await createPatient.mutateAsync(formData as PatientInsert);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving patient:", error);
    }
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{patient ? "تعديل مريض" : "مريض جديد"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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
            <Button variant="outline" onClick={onClose} type="button">
              إلغاء
            </Button>
            <Button type="submit" disabled={createPatient.isPending || updatePatient.isPending}>
              <Save className="w-4 h-4 ml-2" />
              {createPatient.isPending || updatePatient.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
