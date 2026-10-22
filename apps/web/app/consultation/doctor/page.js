import DoctorDirectory from "../components/DoctorDirectory";
import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Specialist Doctors Directory - Mem Service",
  description: "Browse verified doctors across all specialties in Bangladesh and book appointments online.",
};

export default async function DoctorPage() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  let doctors = [];
  let categories = [];

  try {
    const [docRes, catRes] = await Promise.all([
      fetch(`${apiUrl}/api/doctors`, { cache: "no-store" }),
      fetch(`${apiUrl}/api/doccat`, { cache: "no-store" }),
    ]);

    if (docRes.ok) {
      const data = await docRes.json();
      doctors = Array.isArray(data) ? data : data?.doctors || [];
    }

    if (catRes.ok) {
      const catData = await catRes.json();
      categories = Array.isArray(catData) ? catData : catData?.categories || [];
    }
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
  }

  return (
    <section className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/consultation"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Departments</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Consult with Expert Doctors
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Browse verified medical specialists and book your consultation appointment.
          </p>
        </div>

        <Link
          href="/appointment/status"
          className="self-start sm:self-auto px-4 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition inline-flex items-center gap-1.5"
        >
          <UserCheck className="w-4 h-4 text-primary" />
          <span>Check Booking Status</span>
        </Link>
      </div>

      <DoctorDirectory
        initialDoctors={doctors}
        categories={categories}
        selectedDepartment="all"
      />
    </section>
  );
}