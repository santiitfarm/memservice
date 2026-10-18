"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaFileMedical } from "react-icons/fa";
import { FaBriefcaseMedical, FaUserDoctor } from "react-icons/fa6";
import { MdPeopleAlt } from "react-icons/md";
import AnalyticCard from "./components/AnalyticCard";
import DoctorsFilters from "./components/DoctorsFilters";
import DoctorTable from "./components/DoctorTable";
import { useFetchdoctorsQuery } from "@/store/slices/doctorApi";
import Loading from "../components/Loading";

const DoctorsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [specialty, setSpecialty] = useState("All");
  const { data: doctors, isLoading } = useFetchdoctorsQuery();
  //   console.log(data);
  const analytics = {
    total_doctor: doctors?.length,
    category: [...new Set(doctors?.map((doc) => doc.department))].length,
    total_consultation: doctors?.reduce(
      (acc, doc) => acc + doc.consultation_fee,
      0
    ),
    patient: 10,
  };

  //   const doctors = [
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. John Smith",
  //       degree: "MD",
  //       department: "Cardiology",
  //       specialty: "MBBS, BCS (Health)",
  //       experience: 15,
  //       hospital_name: "City Heart Center",
  //       doc_id: "doc01",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Emily Johnson",
  //       degree: "MBBS, MS",
  //       department: "Orthopedics",
  //       specialty: "MBBS, BCS (Health)",
  //       experience: 12,
  //       hospital_name: "Bone & Joint Hospital",
  //       doc_id: "doc02",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Michael Brown",
  //       degree: "MD, DM",
  //       department: "Neurology",
  //       specialty: "MBBS, BCS (Health)",
  //       experience: 10,
  //       hospital_name: "NeuroCare Institute",
  //       doc_id: "doc03",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Sarah Davis",
  //       degree: "MBBS, MD",
  //       department: "Pediatrics",
  //       specialty: "Neonatal Care",
  //       experience: 8,
  //       hospital_name: "Children's Specialty Clinic",
  //       doc_id: "doc04",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. William Wilson",
  //       degree: "MD",
  //       department: "Oncology",
  //       specialty: "MBBS, BCS (Health)",
  //       experience: 20,
  //       hospital_name: "Cancer Care Center",
  //       doc_id: "doc05",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Jessica Martinez",
  //       degree: "MD, MS",
  //       department: "Dermatology",
  //       specialty: "Cosmetic Dermatology",
  //       experience: 7,
  //       hospital_name: "Skin & Hair Clinic",
  //       doc_id: "doc06",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. David Anderson",
  //       degree: "MBBS, MS",
  //       department: "Surgery",
  //       specialty: "Laparoscopic Surgery",
  //       experience: 14,
  //       hospital_name: "General Hospital",
  //       doc_id: "doc07",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Lisa Moore",
  //       degree: "MD, DM",
  //       department: "Endocrinology",
  //       specialty: "Diabetes Management",
  //       experience: 11,
  //       hospital_name: "Hormone Health Center",
  //       doc_id: "doc08",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. James Taylor",
  //       degree: "MBBS, MD",
  //       department: "Pulmonology",
  //       specialty: "Asthma and COPD Management",
  //       experience: 9,
  //       hospital_name: "Lung Care Clinic",
  //       doc_id: "doc09",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Laura White",
  //       degree: "MD",
  //       department: "Psychiatry",
  //       specialty: "Child and Adolescent Psychiatry",
  //       experience: 13,
  //       hospital_name: "Mental Wellness Center",
  //       doc_id: "doc010",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Robert Clark",
  //       degree: "MBBS, MD",
  //       department: "Gastroenterology",
  //       specialty: "Liver Disease Management",
  //       experience: 17,
  //       hospital_name: "Digestive Health Hospital",
  //       doc_id: "doc011",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Karen Harris",
  //       degree: "MD, MS",
  //       department: "Gynecology",
  //       specialty: "Infertility Treatment",
  //       experience: 16,
  //       hospital_name: "Women's Health Hospital",
  //       doc_id: "doc012",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Charles Lewis",
  //       degree: "MD",
  //       department: "Radiology",
  //       specialty: "Interventional Radiology",
  //       experience: 12,
  //       hospital_name: "Advanced Imaging Center",
  //       doc_id: "doc013",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Susan Walker",
  //       degree: "MBBS, MD",
  //       department: "Hematology",
  //       specialty: "Blood Clotting Disorders",
  //       experience: 6,
  //       hospital_name: "Blood & Clot Clinic",
  //       doc_id: "doc014",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Thomas Hall",
  //       degree: "MBBS, MS",
  //       department: "Urology",
  //       specialty: "Kidney Stone Treatment",
  //       experience: 18,
  //       hospital_name: "Renal Health Center",
  //       doc_id: "doc015",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Patricia Allen",
  //       degree: "MD",
  //       department: "Nephrology",
  //       specialty: "Dialysis and Transplant Care",
  //       experience: 15,
  //       hospital_name: "Kidney Care Clinic",
  //       doc_id: "doc016",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Christopher Young",
  //       degree: "MD",
  //       department: "Rheumatology",
  //       specialty: "Rheumatoid Arthritis Management",
  //       experience: 8,
  //       hospital_name: "Joint Health Center",
  //       doc_id: "doc017",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Amanda Hernandez",
  //       degree: "MBBS, MS",
  //       department: "Ophthalmology",
  //       specialty: "Cataract Surgery",
  //       experience: 10,
  //       hospital_name: "Vision Care Hospital",
  //       doc_id: "doc018",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Daniel King",
  //       degree: "MD, DM",
  //       department: "Allergy and Immunology",
  //       specialty: "Food Allergy Treatment",
  //       experience: 9,
  //       hospital_name: "ImmunoHealth Clinic",
  //       doc_id: "doc019",
  //       consultation_fee: 110,
  //     },
  //     {
  //       image:
  //         "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //       name: "Dr. Barbara Wright",
  //       degree: "MD, MS",
  //       department: "Emergency Medicine",
  //       specialty: "Trauma and Critical Care",
  //       experience: 19,
  //       hospital_name: "City Emergency Hospital",
  //       doc_id: "doc020",
  //       consultation_fee: 110,
  //     },
  //   ];
  if (isLoading) {
    return <Loading />;
  }

  const filteredProduct = doctors.filter((doctor) => {
    const searchMatch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.bmdc_number.toString().includes(searchTerm.toLowerCase()) ||
      doctor.hospital_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.doctor_code
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doctor.contract_number
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const departmentMatch =
      departmentFilter === "All" || doctor.department === departmentFilter;
    const specialtyMatch =
      specialty === "All" || doctor.specialty === specialty;

    return searchMatch && departmentMatch && specialtyMatch;
  });

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex justify-between  xs:gap-2 items-center">
        <h1 className="text-3xl xs:text-2xl font-bold dark:text-gray-400">
          Doctors Dashboard
        </h1>
        <Link
          href="/dashboard/doctors/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Users /> Add Doctor
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticCard
          title="Total Doctors"
          value={analytics.total_doctor}
          icon={<FaUserDoctor />}
          color="bg-blue-500"
        />
        <AnalyticCard
          title="Category"
          value={analytics.category}
          icon={<FaBriefcaseMedical />}
          color="bg-green-500"
        />
        <AnalyticCard
          title="Total Consultation"
          value={analytics.total_consultation}
          icon={<FaFileMedical />}
          color="bg-yellow-500"
        />
        <AnalyticCard
          title="Patient"
          value={analytics.patient}
          icon={<MdPeopleAlt />}
          color="bg-purple-500"
        />
      </div>

      <DoctorsFilters
        doctors={doctors}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        specialty={specialty}
        setSpecialty={setSpecialty}
      />

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 w-full">
        {doctors?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 text-xl font-bold">
              No products found.
            </p>
          </div>
        ) : (
          <DoctorTable doctors={filteredProduct} />
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;
