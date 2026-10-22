"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Loader2,
} from "lucide-react";

// Check if a date falls on doctor's available days
function checkDoctorAvailability(availableDayStr, dateObj) {
  if (!availableDayStr || !dateObj) return { available: true };
  const str = availableDayStr.toLowerCase().trim();
  if (str.includes("all") || str.includes("every") || str.includes("daily") || str === "") {
    return { available: true };
  }

  const dayIndex = dateObj.getDay();
  const dayNames = [
    { short: "sun", full: "sunday", index: 0 },
    { short: "mon", full: "monday", index: 1 },
    { short: "tue", full: "tuesday", index: 2 },
    { short: "wed", full: "wednesday", index: 3 },
    { short: "thu", full: "thursday", index: 4 },
    { short: "fri", full: "friday", index: 5 },
    { short: "sat", full: "saturday", index: 6 },
  ];
  const current = dayNames[dayIndex];

  if (str.includes(current.short) || str.includes(current.full)) {
    return { available: true };
  }

  if (str.includes("-") || str.includes("to")) {
    const parts = str.split(/[-–—]|to/).map((s) => s.trim().slice(0, 3));
    if (parts.length === 2) {
      const startIdx = dayNames.findIndex((d) => d.short === parts[0]);
      const endIdx = dayNames.findIndex((d) => d.short === parts[1]);
      if (startIdx !== -1 && endIdx !== -1) {
        let cur = startIdx;
        while (true) {
          if (cur === dayIndex) return { available: true };
          if (cur === endIdx) break;
          cur = (cur + 1) % 7;
        }
      }
    }
  }

  return {
    available: false,
    message: `Doctor is available on (${availableDayStr}). The selected date is a ${current.full.toUpperCase()}.`,
  };
}

export default function AppointmentBookingForm({ doctors = [], initialDoctor = null }) {
  const router = useRouter();

  const [selectedDoctorId, setSelectedDoctorId] = useState(
    initialDoctor?._id || (doctors[0]?._id ?? "")
  );

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d._id === selectedDoctorId) || initialDoctor || doctors[0];
  }, [doctors, selectedDoctorId, initialDoctor]);

  // Form states
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState(() => {
    // Tomorrow by default
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return tmrw.toISOString().split("T")[0];
  });
  const [preferredSlot, setPreferredSlot] = useState("morning");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Validate day availability
  const availabilityWarning = useMemo(() => {
    if (!preferredDate || !selectedDoctor?.available_day) return null;
    const [y, m, d] = preferredDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const check = checkDoctorAvailability(selectedDoctor.available_day, dateObj);
    return check.available ? null : check.message;
  }, [preferredDate, selectedDoctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedDoctor?._id) {
      setErrorMsg("Please select a doctor.");
      return;
    }
    if (!patientName.trim()) {
      setErrorMsg("Patient name is required.");
      return;
    }

    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(cleanPhone)) {
      setErrorMsg("Please enter a valid Bangladesh mobile number (e.g., 017XXXXXXXX).");
      return;
    }

    if (!preferredDate) {
      setErrorMsg("Please choose your preferred appointment date.");
      return;
    }

    try {
      setSubmitting(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          patient: {
            name: patientName.trim(),
            phone: cleanPhone,
            age: age ? parseInt(age, 10) : undefined,
            gender,
            email: email.trim() || undefined,
          },
          preferredDate,
          preferredSlot,
          notes: notes.trim(),
          source: "storefront",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit appointment request.");
      }

      const refCode = data.referenceCode || data.appointment?.referenceCode || data.appointment?._id;
      const normalizedPhone = data.appointment?.patient?.phone || cleanPhone;

      // Redirect to appointment status / confirmation page
      router.push(`/appointment/status?id=${encodeURIComponent(refCode)}&phone=${encodeURIComponent(normalizedPhone)}&success=1`);
    } catch (err) {
      setErrorMsg(err.message || "An error occurred while booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Doctor Selection / Summary */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <label className="block text-sm font-bold text-foreground">
          Select Consultant Doctor
        </label>
        <select
          value={selectedDoctorId}
          onChange={(e) => setSelectedDoctorId(e.target.value)}
          className="w-full py-2.5 px-3.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.name} — {doc.department || doc.specialty || "Specialist"} (৳{doc.consultation_fee || 0})
            </option>
          ))}
        </select>

        {selectedDoctor && (
          <div className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0 overflow-hidden relative">
                {selectedDoctor.image ? (
                  <Image
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Stethoscope className="w-6 h-6" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{selectedDoctor.name}</h4>
                <p className="text-xs text-muted-foreground">{selectedDoctor.degree} • {selectedDoctor.department}</p>
                <p className="text-xs text-primary font-medium mt-0.5">
                  Available: {selectedDoctor.available_day || "Everyday"}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Fee</span>
              <span className="text-lg font-extrabold text-primary">
                ৳{Number(selectedDoctor.consultation_fee || 0).toLocaleString("en-BD")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Patient Information */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span>Patient Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Patient Full Name *
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g., Mohammad Rahman"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Mobile Number (Bangladesh) *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Patient Age
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g., 32"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Email Address (Optional - For digital confirmations)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Schedule Selection */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Appointment Schedule</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Preferred Date *
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {availabilityWarning && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{availabilityWarning}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Preferred Slot *
            </label>
            <select
              value={preferredSlot}
              onChange={(e) => setPreferredSlot(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="morning">Morning (10:00 AM - 01:00 PM)</option>
              <option value="afternoon">Afternoon (02:00 PM - 05:00 PM)</option>
              <option value="evening">Evening (06:00 PM - 09:00 PM)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              Symptoms / Reason for Consultation (Optional)
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Briefly describe your symptoms or medical concern..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Confirmation & Submit */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Next Step:</p>
          <p>We will contact you via mobile to confirm doctor serial and timing.</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Request...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Appointment Request</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
