import AppointmentBookingForm from "./components/AppointmentBookingForm";
import Link from "next/link";
import { ArrowLeft, Stethoscope, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book Doctor Appointment - Mem Service",
  description: "Request an appointment with specialist doctors in Bangladesh.",
};

export default async function DoctorVisitCheckoutPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const doctor_id = resolvedParams?.doctor_id;

  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  let doctors = [];
  let initialDoctor = null;

  try {
    const res = await fetch(`${apiUrl}/api/doctors`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      doctors = Array.isArray(data) ? data : data?.doctors || [];
    }

    if (doctor_id) {
      initialDoctor = doctors.find((d) => d._id === doctor_id) || null;
      if (!initialDoctor) {
        const docRes = await fetch(`${apiUrl}/api/doctors/${doctor_id}`, { cache: "no-store" });
        if (docRes.ok) {
          const docData = await docRes.json();
          initialDoctor = docData?.doctor || null;
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch doctors for booking:", err);
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/consultation/doctor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Doctors List</span>
          </Link>
          <Link
            href="/appointment/status"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Lookup Existing Booking &rarr;
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Consultation Request</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Doctor Appointment Request
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Fill in the patient details to request your doctor consultation appointment. No advance payment required.
          </p>
        </div>

        {/* Main Booking Form */}
        <AppointmentBookingForm doctors={doctors} initialDoctor={initialDoctor} />
      </div>
    </div>
  );
}
