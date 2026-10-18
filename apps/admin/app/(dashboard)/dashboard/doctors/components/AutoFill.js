import React from "react";

export default function AutoFill({ setValue, classStyle }) {
  // Add this function just before the Form component
  const sampleDoctorData = {
    name: "Dr. John Smith",
    degree: "MBBS, MD",
    contract_number: "123456",
    available_day: "Monday, Wednesday, Friday",
    department: "Cardiology",
    specialty: "Interventional Cardiology",
    experience: 10,
    hospital_name: "City General Hospital",
    bmdc_number: "987654",
    consultation_fee: 1500,
    follow_up_fee: 800,
    doctor_code: "DOC123",
    doctor_info:
      "Specialized in cardiovascular diseases with 10+ years of experience",
  };

  // Inside your Form component, add this function before the return statement
  const autoFillForm = () => {
    Object.keys(sampleDoctorData).forEach((field) => {
      setValue(field, sampleDoctorData[field]);
    });
  };
  return (
    <div className={classStyle}>
      <button
        type="button"
        onClick={autoFillForm}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Auto Fill Form
      </button>
    </div>
  );
}
