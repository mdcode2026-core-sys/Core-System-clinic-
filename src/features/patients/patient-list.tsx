"use client";

import { useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { usePatients, useDeletePatient } from "@/domain/patients/patients.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Search, Pencil, Trash2, Phone, Mail, Eye } from "lucide-react";
import { PatientForm } from "./patient-form";
import { PatientDetail } from "./patient-detail";
import type { Patient } from "@/domain/patients/patients.types";

interface PatientListProps {
  onAdd?: () => void;
}

export function PatientList({ onAdd }: PatientListProps) {
  const { tenantId } = useAuth();
  const { data: patients, isLoading } = usePatients(tenantId);
  const deletePatient = useDeletePatient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailPatientId, setDetailPatientId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredPatients = patients?.filter((patient) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return (
      fullName.includes(query) ||
      patient.phone_primary.includes(query) ||
      (patient.email && patient.email.toLowerCase().includes(query))
    );
  });

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

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  };

  const handleViewDetail = (patientId: string) => {
    setDetailPatientId(patientId);
    setIsDetailOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    if (confirm("هل أنت متأكد من حذف هذا المريض؟")) {
      deletePatient.mutate({ id: patient.id, tenantId: patient.tenant_id });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          جاري التحميل...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="البحث بالاسم أو الهاتف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 h-12 text-base"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">قائمة المرضى ({filteredPatients?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {(!filteredPatients || filteredPatients.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد مرضى مطابقين للبحث
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {/* Info Section */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-lg">
                        {patient.first_name[0]}{patient.last_name[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0" />
                          {patient.phone_primary}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0">
                    <div className="sm:hidden">
                      {getStatusBadge(patient.patient_status)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0"
                        onClick={() => handleViewDetail(patient.id)}
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0"
                        onClick={() => handleEdit(patient)}
                      >
                        <Pencil className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(patient)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Form Modal */}
      <PatientForm
        patient={selectedPatient}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedPatient(null);
        }}
        onSuccess={() => {
          setIsFormOpen(false);
          setSelectedPatient(null);
        }}
      />

      {/* Patient Detail Modal */}
      <PatientDetail
        patientId={detailPatientId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailPatientId(null);
        }}
      />
    </div>
  );
}
