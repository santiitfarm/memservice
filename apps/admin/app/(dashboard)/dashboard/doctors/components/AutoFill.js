import React from "react";
import Button from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

export default function AutoFill({ setValue, classStyle = "" }) {
  const sampleDoctorData = {
    name: "Dr. Farhana Yasmin",
    degree: "MBBS, FCPS (Medicine), MD (Cardiology)",
    contract_number: "01711223344",
    available_day: "Saturday, Monday, Wednesday",
    department: "Cardiology",
    specialty: "Clinical & Interventional Cardiology",
    experience: 12,
    hospital_name: "Dhaka Medical College & Hospital",
    bmdc_number: "A-54321",
    consultation_fee: 1200,
    follow_up_fee: 600,
    doctor_code: "DOC-CARD-01",
    doctor_info:
      "Senior Consultant Cardiologist specializing in preventive heart care, hypertension management, and echocardiography.",
  };

  const autoFillForm = () => {
    Object.keys(sampleDoctorData).forEach((field) => {
      setValue(field, sampleDoctorData[field], { shouldValidate: true, shouldDirty: true });
    });
  };

  return (
    <div className={classStyle}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={autoFillForm}
        className="gap-1.5 border-dashed border-primary/40 text-primary hover:bg-primary/10"
        title="Auto-fill form with realistic doctor credentials"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Auto Fill Sample</span>
      </Button>
    </div>
  );
}
