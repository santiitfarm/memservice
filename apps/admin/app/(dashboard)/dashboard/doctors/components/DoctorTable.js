import { FullscreenIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const DoctorTable = ({ doctors }) => {
  return (
    <div className="overflow-y-auto h-[80vh]">
      <table className="min-w-full bg-white dark:bg-gray-900 dark:text-gray-400">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Degree
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Specialty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Consultation fee
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Availability
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {doctors.map((doctor) => (
            <tr key={doctor?.doc_id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <Image
                  src={doctor?.image}
                  width={50}
                  height={50}
                  alt={doctor?.name}
                  className="h-12 w-12 object-cover rounded-md"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{doctor?.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{doctor?.degree}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {doctor?.department}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {doctor?.specialty}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ৳{doctor?.consultation_fee}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">Available</td>

              <td className="px-6 py-4 whitespace-nowrap text-center">
                <Link
                  href={`/dashboard/doctors/${doctor._id}`}
                  className="flex items-center gap-2"
                >
                  <FullscreenIcon className="w-5 h-5 text-blue-600 cursor-pointer" />
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorTable;
