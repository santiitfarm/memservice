import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ShieldCheck,
  Building,
  GraduationCap,
  Award,
  ArrowRight,
  ArrowLeft,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { doctorId } = await params;
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/api/doctors/${doctorId}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.doctor) {
        return {
          title: `Dr. ${data.doctor.name} - ${data.doctor.specialty || data.doctor.department} - Mem Service`,
          description: `Book appointment with Dr. ${data.doctor.name}, ${data.doctor.degree} at ${data.doctor.hospital_name || "Mem Service"}.`,
        };
      }
    }
  } catch (e) {}

  return {
    title: "Doctor Profile - Mem Service",
    description: "Doctor consultation and appointment booking at Mem Service.",
  };
}

export default async function DoctorDetailsPage({ params }) {
  const { doctorId } = await params;
  let doctor = null;

  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/doctors/${doctorId}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      doctor = data?.doctor || null;
    }
  } catch (err) {
    console.error("Failed to fetch doctor:", err);
  }

  if (!doctor) {
    return (
      <section className="container mx-auto px-4 md:px-6 py-16 text-center max-w-xl">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Doctor Profile Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2">
          The requested specialist doctor could not be found or is no longer listed in our directory.
        </p>
        <Link
          href="/consultation/doctor"
          className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Doctors</span>
        </Link>
      </section>
    );
  }

  const cleanName = (doctor?.name || "Doctor").replace(/^Dr\.?\s*/i, "").trim();
  const initials =
    cleanName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DR";

  const consultationFee = Number(doctor.consultation_fee || 0);
  const followUpFee = Number(doctor.follow_up_fee || Math.max(0, consultationFee - 200));

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href="/consultation/doctor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Doctors Directory</span>
          </Link>
        </div>

        {/* Doctor Header Card */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Doctor Avatar / Photo */}
            <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-36 h-36 sm:w-44 sm:h-44 relative rounded-2xl overflow-hidden bg-muted border-2 border-primary/20 shadow-sm shrink-0">
                {doctor?.image ? (
                  <Image
                    src={doctor.image}
                    alt={doctor.name || "Doctor"}
                    fill
                    sizes="(max-width: 768px) 144px, 176px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary font-extrabold text-4xl flex items-center justify-center">
                    {initials}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {doctor.department || "Specialist"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Consultant</span>
                </span>
              </div>
            </div>

            {/* Doctor Info & Stats */}
            <div className="lg:col-span-8 flex flex-col justify-between h-full space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {doctor.name?.startsWith("Dr.") ? doctor.name : `Dr. ${doctor.name}`}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{doctor.degree || "MBBS"}</p>

                {doctor.specialty && (
                  <p className="text-sm font-semibold text-primary mt-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>Specialty: {doctor.specialty}</span>
                  </p>
                )}

                {doctor.hospital_name && (
                  <p className="text-xs sm:text-sm text-foreground/80 mt-1 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>Chamber / Hospital: <strong>{doctor.hospital_name}</strong></span>
                  </p>
                )}
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-border">
                <div className="p-3 rounded-xl bg-muted/50 border border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Experience
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {doctor.experience || 0}+ Years
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-muted/50 border border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Available Days
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-foreground truncate block">
                    {doctor.available_day || "Everyday"}
                  </span>
                </div>

                {doctor.bmdc_number && (
                  <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-muted/50 border border-border/60">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                      BMDC Reg No
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-foreground font-mono">
                      {doctor.bmdc_number}
                    </span>
                  </div>
                )}
              </div>

              {/* Fee & Action Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div>
                  <span className="text-xs text-muted-foreground font-medium block">
                    First Consultation Fee
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-primary">
                      ৳{consultationFee.toLocaleString("en-BD")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (Follow-up: ৳{followUpFee.toLocaleString("en-BD")})
                    </span>
                  </div>
                </div>

                <Link
                  href={`/visit/checkout?doctor_id=${doctor._id}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition shadow-sm inline-flex items-center justify-center gap-2 shrink-0"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Chamber Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-foreground">About the Doctor</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {doctor.about ||
                `Dr. ${doctor.name} is a renowned specialist in ${doctor.department || "medical consultations"} with over ${doctor.experience || 0} years of clinical experience. Consultations provide dedicated one-on-one evaluations, prescription recommendations, and follow-up guidance.`}
            </p>

            <h4 className="text-sm font-bold text-foreground pt-3">Consultation Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-foreground/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Verified medical credentials</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Digital prescription support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Medicine home delivery option</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Discounted follow-up within 14 days</span>
              </div>
            </div>
          </div>

          {/* Quick Booking Summary Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground mb-3">Appointment Booking</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose your preferred date and slot. Our patient care representative will confirm your serial and appointment time.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-muted/60 text-xs text-muted-foreground space-y-1.5">
                <div className="flex justify-between">
                  <span>Visiting Days:</span>
                  <strong className="text-foreground">{doctor.available_day || "Sat - Thu"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Available Slot:</span>
                  <strong className="text-foreground">Morning & Evening</strong>
                </div>
              </div>
            </div>

            <Link
              href={`/visit/checkout?doctor_id=${doctor._id}`}
              className="mt-6 w-full py-3 rounded-xl bg-primary text-primary-foreground text-center font-bold text-sm hover:bg-primary/90 transition shadow-sm block"
            >
              Book Appointment Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
