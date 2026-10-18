import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import DoctorProfile from "../components/DoctorProfile";
import Link from "next/link";

export const dynamic = "force-dynamic";

const DepartmentDoctorPage = async ({ params }) => {
  const { deptName } = await params;
  const dept = capitalizeFirstLetter(deptName);
  let doctors = [];

  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/doctors`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.doctors)
        ? data.doctors
        : [];
      doctors = list.filter(
        (doc) => (doc?.department || "").toLowerCase() === String(deptName).toLowerCase()
      );
    }
  } catch (error) {
    console.error("Failed to fetch department doctors:", error);
  }

  return (
    <section className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-deep-sea-blue">
            {dept} Department
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Doctors specializing in {dept.toLowerCase()} consultations
          </p>
        </div>
        <Link
          href="/consultation/doctor"
          className="text-sm font-semibold text-sky-blue hover:underline"
        >
          View All Doctors &rarr;
        </Link>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-gray-200 max-w-xl mx-auto">
          <p className="text-lg font-semibold text-gray-700">
            No doctors found in {dept}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            We are currently adding doctors for this specialty. In the meantime, you can browse all available doctors.
          </p>
          <Link
            href="/consultation/doctor"
            className="mt-6 inline-block bg-sky-blue text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
          >
            Browse All Doctors
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doctor, indx) => (
            <DoctorProfile doc={doctor} key={doctor?._id || indx} />
          ))}
        </div>
      )}
    </section>
  );
};

export default DepartmentDoctorPage;