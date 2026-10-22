import Link from "next/link";
import { Stethoscope, ArrowRight, Activity, Heart, Brain, Bone, Baby, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Doctor Consultation Directory - Mem Service",
  description: "Consult with verified specialist doctors across various medical departments in Bangladesh.",
};

// Department icon helper
function getDeptIcon(name = "") {
  const n = name.toLowerCase();
  if (n.includes("cardio") || n.includes("heart")) return Heart;
  if (n.includes("neuro") || n.includes("brain")) return Brain;
  if (n.includes("ortho") || n.includes("bone")) return Bone;
  if (n.includes("pedia") || n.includes("child")) return Baby;
  if (n.includes("general")) return Activity;
  return Stethoscope;
}

export default async function ConsultationPage() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  let departments = [];
  let doctorsCount = 0;

  try {
    const [catRes, docRes] = await Promise.all([
      fetch(`${apiUrl}/api/doccat`, { cache: "no-store" }),
      fetch(`${apiUrl}/api/doctors`, { cache: "no-store" }),
    ]);

    if (catRes.ok) {
      const data = await catRes.json();
      departments = Array.isArray(data) ? data : data?.categories || [];
    }

    if (docRes.ok) {
      const docs = await docRes.json();
      doctorsCount = Array.isArray(docs) ? docs.length : 0;
    }
  } catch (err) {
    console.error("Failed to fetch departments:", err);
  }

  // Fallback defaults if db has no categories yet
  if (!departments || departments.length === 0) {
    departments = [
      { categoryName: "General Medicine", specialties: "Fever, cold, general health issues" },
      { categoryName: "Cardiology", specialties: "Heart disease, hypertension, chest pain" },
      { categoryName: "Orthopedics", specialties: "Bone fracture, joint pain, spine health" },
      { categoryName: "Gynecology", specialties: "Women's health, pregnancy, fertility" },
      { categoryName: "Pediatrics", specialties: "Child care, vaccinations, newborn health" },
      { categoryName: "Dermatology", specialties: "Skin conditions, allergies, hair & nails" },
    ];
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-primary/10 via-background to-background border-b border-border py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Medical Specialists</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Consult with Expert Doctors Online
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Book appointments with leading specialist doctors across Bangladesh. Get trusted medical advice, prescriptions, and follow-ups.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/consultation/doctor"
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition shadow-sm inline-flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Browse All Doctors ({doctorsCount})</span>
            </Link>
            <Link
              href="/appointment/status"
              className="px-6 py-3 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-muted transition inline-flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-primary" />
              <span>Check Appointment Status</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Department Grid */}
      <section className="container mx-auto px-4 md:px-6 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Medical Departments</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Select a specialized department to view qualified consultant doctors.
            </p>
          </div>
          <Link
            href="/consultation/doctor"
            className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>View All Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept, idx) => {
            const name = dept.categoryName || dept.name || "General";
            const slug = encodeURIComponent(name);
            const Icon = getDeptIcon(name);
            const description = dept.specialties || dept.description || "Consult with specialist doctors.";

            return (
              <Link
                key={dept._id || idx}
                href={`/consultation/${slug}`}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>View Specialists</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}