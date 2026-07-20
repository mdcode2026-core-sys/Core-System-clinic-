"use client";

import { useState } from "react";
import { PatientList } from "@/features/patients/patient-list";
import { PatientForm } from "@/features/patients/patient-form";
import { Button } from "@/shared/components/ui/button";
import { UserPlus } from "lucide-react";

export default function PatientsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">المرضى</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <UserPlus className="w-4 h-4 ml-2" />
          مريض جديد
        </Button>
      </div>

      <PatientList />

      {/* New Patient Form Modal */}
      <PatientForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => setIsFormOpen(false)}
      />
    </div>
  );
}
