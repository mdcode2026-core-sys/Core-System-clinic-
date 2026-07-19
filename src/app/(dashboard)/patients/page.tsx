"use client";

import { useState } from "react";
import { PatientList } from "@/features/patients/patient-list";
import { Button } from "@/shared/components/ui/button";
import { UserPlus } from "lucide-react";

export default function PatientsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">المرضى</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <UserPlus className="w-4 h-4 ml-2" />
            مريض جديد
          </Button>
        )}
      </div>

      {showForm ? (
        <div className="p-8 text-center text-muted-foreground border rounded-lg">
          <p>نموذج إضافة مريض جديد — قيد التطوير</p>
          <Button variant="outline" onClick={() => setShowForm(false)} className="mt-4">
            إلغاء
          </Button>
        </div>
      ) : (
        <PatientList
          onEdit={(patientId) => {
            console.log("تعديل مريض:", patientId);
            // سيتم إضافة نموذج التعديل لاحقاً
          }}
          onAdd={() => setShowForm(true)}
        />
      )}
    </div>
  );
}
