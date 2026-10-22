import DoctorDirectory from "../components/DoctorDirectory";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { deptName } = await params;
  const decoded = decodeURIComponent(deptName);
  return {
    title: `${capitalizeFirstLetter(decoded)} Doctors & Specialists - Mem Service`,
    description: `Book consultation appointments with verified ${decoded} specialists in Bangladesh.`,
  };
}

export default async function DepartmentDoctorPage({ params }) {
  const { deptName } = await params;
  const decodedDept = decodeURIComponent(deptName);
  const deptTitle = capitalizeFirstLetter(decodedDept);

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
    console.error("Failed to fetch department doctors:", error);
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
            <span>All Departments</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {deptTitle} Specialists
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Doctors and healthcare professionals specializing in {deptTitle.toLowerCase()} care.
          </p>
        </div>

        <Link
          href="/appointment/status"
          className="self-start sm:self-auto px-4 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition"
        >
          Check Booking Status
        </Link>
      </div>

      <DoctorDirectory
        initialDoctors={doctors}
        categories={categories}
        selectedDepartment={decodedDept}
      />
    </section>
  );
}