"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function DoctorAvatar({ image, name }) {
  const [hasError, setHasError] = useState(false);

  const cleanName = (name || "Doctor").replace(/^Dr\.?\s*/i, "").trim();
  const initials =
    cleanName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DR";

  if (!image || hasError) {
    return (
      <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-bold text-xl md:text-2xl shrink-0 shadow-inner">
        {initials}
      </div>
    );
  }

  return (
    <div className="w-24 h-24 md:w-28 md:h-28 relative rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
      <Image
        alt={name || "Doctor"}
        src={image}
        fill
        sizes="(max-width: 768px) 96px, 112px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

const DoctorProfile = ({ doc }) => {
  if (!doc) return null;

  return (
    <Link
      href={`/doctors/${doc._id}`}
      className="flex flex-col sm:flex-row gap-4 border border-gray-200 hover:border-sky-blue bg-white shadow-sm hover:shadow-md p-4 rounded-xl transition-all duration-200 min-h-[180px]"
    >
      <DoctorAvatar image={doc.image} name={doc.name} />

      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-[#184363] text-lg truncate">
              {doc.name || "Doctor"}
            </h2>
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${
                doc.status === "active" ? "bg-green-500" : "bg-gray-400"
              }`}
              title={doc.status === "active" ? "Active" : "Inactive"}
            />
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.degree || "MBBS"}</p>
        </div>

        <div className="my-2 space-y-1">
          {doc.specialty && (
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Specialty</span>
              <p className="text-xs font-medium text-gray-800 truncate">{doc.specialty}</p>
            </div>
          )}
          {doc.hospital_name && (
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Working In</span>
              <p className="text-xs font-medium text-gray-700 truncate">{doc.hospital_name}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          <span className="text-gray-500">
            Exp: <strong className="text-gray-800">{doc.experience || 0}+ Years</strong>
          </span>
          <span className="text-sky-blue font-semibold">
            {doc.consultation_fee ? `৳${doc.consultation_fee}` : "Free"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default DoctorProfile;