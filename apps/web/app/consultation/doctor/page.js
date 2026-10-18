import DoctorProfile from "../components/DoctorProfile";

export const dynamic = "force-dynamic";

const DoctorPage = async () => {
  let doctors = [];
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/doctors`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      doctors = Array.isArray(data)
        ? data
        : Array.isArray(data?.doctors)
        ? data.doctors
        : [];
    }
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
  }

  return (
    <section className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-deep-sea-blue">
          Consult with Expert Doctors
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Select a verified specialist for quality medical consultation and advice.
        </p>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-gray-200 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-sky-blue rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ⚕
          </div>
          <h3 className="text-lg font-semibold text-gray-800">No Doctors Available Yet</h3>
          <p className="text-sm text-gray-500 mt-2">
            We are onboarding specialists in this department. Please check back shortly.
          </p>
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

export default DoctorPage;