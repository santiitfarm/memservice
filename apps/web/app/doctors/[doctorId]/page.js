// "use client"

import DoctorInfo from "@/app/components/doctors/DoctorInfo";
import { Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// import DoctorExperience from '@/app/components/doctors/DoctorExperience';
// import DoctorExperience from '@/app/components/doctors/DoctorExperience';
// import DoctorInfo from '@/app/components/doctors/DoctorInfo';

const DoctorDetailsPage = async ({ params }) => {
  const { doctorId } = await params;
  let doctor = null;

  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(
      `${apiUrl}/api/doctors/${doctorId}`,
      { cache: "no-store" }
    );
    if (response.ok) {
      const data = await response.json();
      doctor = data?.doctor || null;
    }
  } catch (err) {
    console.error("Failed to fetch doctor:", err);
  }

  if (!doctor) {
    return (
      <section className="container mx-auto px-4 md:px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-deep-sea-blue">Doctor Not Found</h2>
        <p className="text-gray-500 mt-2">The requested doctor profile could not be found or is no longer available.</p>
        <Link href="/consultation/doctor" className="mt-6 inline-block bg-sky-blue text-white px-6 py-2.5 rounded-lg font-medium hover:bg-sky-600">
          Back to Doctors List
        </Link>
      </section>
    );
  }

  const date = doctor?.createdAt ? new Date(doctor.createdAt) : new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);

  const initials = (doctor?.name || "DR")
    .replace(/^Dr\.?\s*/i, "")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="container mx-auto px-2 md:px-6 py-6">
      <div className="border rounded-xl shadow-md px-4 p-5">
        <div className="grid grid-cols-12 items-center justify-between">
          <div className="col-span-12 md:col-span-8">
            <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
              <div className="p-1 border-2 rounded-md border-blue-500 shrink-0 self-start">
                {doctor?.image ? (
                  <Image
                    src={doctor.image}
                    width={500}
                    height={500}
                    alt={doctor.name || "Doctor"}
                    className="rounded-lg object-cover w-[10.5rem] h-[13.5rem]"
                  />
                ) : (
                  <div className="rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-3xl w-[10.5rem] h-[13.5rem] border border-sky-200">
                    {initials}
                  </div>
                )}
              </div>
              <div className="py-2 space-y-1 my-auto">
                <h1 className="text-[#212529] font-bold text-2xl">
                  {doctor?.name}
                </h1>
                <h1 className="text-[#6b7280] text-[.89rem]">
                  {doctor?.degree}
                </h1>
                <p>
                  <span className="relative mr-4 inline-block rounded-l bg-blue-600 pl-1.5 pr-0 text-white before:absolute before:left-full before:top-0 before:h-0 before:w-0 before:border-b-[15px] before:border-l-[16px] before:border-solid before:border-b-transparent before:border-l-blue-600 before:rounded-tr before:content-[''] after:absolute after:bottom-0 after:left-full after:h-0 after:w-0 after:border-l-[16px] after:border-t-[15px] after:border-solid after:border-l-blue-600 after:rounded-br after:border-t-transparent after:content-[''] text-sm leading-4 py-1">
                    {doctor?.specialty}
                  </span>
                </p>
                <p className=" font-semibold">{doctor?.department}</p>
                <p>
                  <span className="text-[#6b7280] text-[.89rem]">
                    Working at
                  </span>{" "}
                  <span className="font-semibold">{doctor?.hospital_name}</span>
                </p>

                <div className="hidden lg:flex lg:flex-row lg:gap-6 lg:items-center justify-start text-[.89rem] pt-2">
                  <div>
                    <p className="text-[#6b7280]">Total Experience</p>
                    <p className="font-bold text-[.95rem]">
                      {doctor?.experience}+ Years
                    </p>
                  </div>
                  {/* Vertical Dotted Border  */}
                  <div className="border-l-2 border-dotted h-7 border-gray-500"></div>
                  <div>
                    <p className="text-[#6b7280]">BMDC Number</p>
                    <p className="font-bold text-[.95rem]">
                      {doctor?.bmdc_number}
                    </p>
                  </div>
                  {/* Vertical Dotted Border  */}
                  <div className="border-l-2 border-dotted h-7 border-gray-500"></div>
                  <div>
                    <p className="text-[#6b7280]">Joined Doctime</p>
                    <p className="font-bold text-[.95rem]">{formattedDate}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:hidden flex flex-row gap-2 md:gap-3 items-center justify-start text-xs mt-3 ">
              <div>
                <p className="text-[#6b7280]">Total Experience</p>
                <p className="font-bold text-[.95rem]">
                  {doctor?.experience}+ Years
                </p>
              </div>
              {/* Vertical Dotted Border  */}
              <div className="border-l-2 border-dotted h-7 border-gray-500"></div>
              <div>
                <p className="text-[#6b7280]">BMDC Number</p>
                <p className="font-bold text-[.95rem]">{doctor?.bmdc_number}</p>
              </div>
              {/* Vertical Dotted Border  */}
              <div className="border-l-2 border-dotted h-7 border-gray-500"></div>
              <div>
                <p className="text-[#6b7280]">Joined Doctime</p>
                <p className="font-bold text-[.95rem]">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* consultation section */}
          <div className="col-span-4 md:flex flex-col items-center justify-start hidden">
            <h2 className="text-lg font-semibold text-gray-800">
              Consultation Fee
            </h2>

            <div className="mt-4 flex items-center space-x-2">
              <span className="text-gray-400 line-through text-base">
                ৳{doctor?.consultation_fee}
              </span>
              <span className="text-blue-500 text-3xl font-bold">Free</span>
              {/* <span className="text-blue-500 text-3xl font-bold">৳{doctor?.consultation_fee}</span> */}
              <span className="text-gray-500 text-sm">(Inc. VAT)</span>
            </div>

            <Link
              href={`https://wa.me/${doctor?.contract_number}`}
              target="_blank"
            >
              <button className="mt-6 px-10 py-3 bg-[#34C300] text-white font-medium rounded-lg shadow  flex items-center space-x-2">
                <span>
                  {" "}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.9782 10.2791H12.6677L4.98277 17.6494H13.6723C14.0841 17.6753 14.4895 17.5376 14.8003 17.2661C15.1111 16.9947 15.3022 16.6116 15.3321 16.2V7.45252C15.3022 7.04095 15.1111 6.65779 14.8003 6.38637C14.4895 6.11494 14.0841 5.9772 13.6723 6.00309H11.8432L9.9782 10.2791ZM4.56687 17.6494L6.95736 12.1675H4.2679L6.95602 6.00309H3.65978C3.24795 5.9772 2.84255 6.11494 2.53173 6.38637C2.22091 6.65779 2.02982 7.04095 2 7.45252V16.2C2.02982 16.6116 2.22091 16.9947 2.53173 17.2661C2.84255 17.5376 3.24795 17.6753 3.65978 17.6494H4.56687ZM16.4434 9.43984L20.2499 7.14707C20.409 7.0402 20.5927 6.97552 20.7836 6.95912C20.9745 6.94272 21.1665 6.97513 21.3415 7.0533C21.5165 7.13148 21.6687 7.25285 21.7839 7.40602C21.8991 7.55919 21.9735 7.73913 22 7.92893V15.7217C21.9736 15.9115 21.8993 16.0916 21.7842 16.2449C21.6691 16.3982 21.5169 16.5197 21.3419 16.598C21.1669 16.6762 20.9748 16.7087 20.7838 16.6924C20.5928 16.676 20.4091 16.6114 20.2499 16.5045L16.4434 14.2136V9.43984Z"
                      fill="white"
                    ></path>
                  </svg>{" "}
                </span>
                <span>See Doctor Now</span>
              </button>
            </Link>

            {/* <Link href={`/visit/checkout?doctor_id=${doctor._id}`} className="mt-6 px-10 py-3 bg-[#34C300] text-white font-medium rounded-lg shadow  flex items-center space-x-2">
                            <span> <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M9.9782 10.2791H12.6677L4.98277 17.6494H13.6723C14.0841 17.6753 14.4895 17.5376 14.8003 17.2661C15.1111 16.9947 15.3022 16.6116 15.3321 16.2V7.45252C15.3022 7.04095 15.1111 6.65779 14.8003 6.38637C14.4895 6.11494 14.0841 5.9772 13.6723 6.00309H11.8432L9.9782 10.2791ZM4.56687 17.6494L6.95736 12.1675H4.2679L6.95602 6.00309H3.65978C3.24795 5.9772 2.84255 6.11494 2.53173 6.38637C2.22091 6.65779 2.02982 7.04095 2 7.45252V16.2C2.02982 16.6116 2.22091 16.9947 2.53173 17.2661C2.84255 17.5376 3.24795 17.6753 3.65978 17.6494H4.56687ZM16.4434 9.43984L20.2499 7.14707C20.409 7.0402 20.5927 6.97552 20.7836 6.95912C20.9745 6.94272 21.1665 6.97513 21.3415 7.0533C21.5165 7.13148 21.6687 7.25285 21.7839 7.40602C21.8991 7.55919 21.9735 7.73913 22 7.92893V15.7217C21.9736 15.9115 21.8993 16.0916 21.7842 16.2449C21.6691 16.3982 21.5169 16.5197 21.3419 16.598C21.1669 16.6762 20.9748 16.7087 20.7838 16.6924C20.5928 16.676 20.4091 16.6114 20.2499 16.5045L16.4434 14.2136V9.43984Z" fill="white"></path></svg> </span>
                            <span >See Doctor Now</span>
                        </Link> */}
          </div>
        </div>
        <div className="flex gap-6 text-[.89rem] mt-3">
          {/* <button className="text-[#6b7280] flex items-center gap-1 pb-3 border-b-2 border-[#4285f4] -mb-5">
            <Info /> Info
          </button> */}
          {/* <button onClick={() => handelOpen("info")} className='text-[#6b7280] flex items-center gap-1 pb-4 border-b-2 border-transparent hover:border-[#4285f4] -mb-6'><Info /> Info</button> */}
          {/* <button onClick={() => handelOpen("experience")} className='text-[#6b7280] flex items-center gap-1 pb-4 border-b-2 border-transparent hover:border-[#4285f4] -mb-6'><BriefcaseBusiness /> Experience</button> */}
          {/* <DoctorMoreInfoButton Icon={<Info />} name={Info} /> */}
          {/* <DoctorMoreInfoButton name={Info}><Info /></DoctorMoreInfoButton> */}
        </div>
      </div>
      <div>
        {/* {isOpen?.info && (
                    <DoctorInfo doctor={doctor} />
                )} */}
        <DoctorInfo doctor={doctor} />
      </div>
      {/* <div className='mt-10'>
                {isOpen?.experience && (
                    <DoctorExperience />
                )}
            </div> */}
    </section>
  );
};

export default DoctorDetailsPage;
