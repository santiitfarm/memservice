"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Calendar, Clock, ArrowRight, ShieldCheck } from "lucide-react";

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
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 shadow-inner">
        {initials}
      </div>
    );
  }

  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 relative rounded-2xl overflow-hidden shrink-0 bg-muted border border-border">
      <Image
        alt={name || "Doctor"}
        src={image}
        fill
        sizes="(max-width: 768px) 80px, 96px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function DoctorProfile({ doc }) {
  if (!doc) return null;

  return (
    <div className="flex flex-col justify-between border border-border bg-card rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200">
      <div>
        {/* Header: Photo + Info */}
        <div className="flex gap-4 items-start">
          <DoctorAvatar image={doc.image} name={doc.name} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {doc.department || "General"}
              </span>
              <span className="flex items-center gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            </div>

            <Link href={`/doctors/${doc._id}`} className="block group mt-1">
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                {doc.name || "Doctor"}
              </h3>
            </Link>

            <p className="text-xs text-muted-foreground truncate">{doc.degree || "MBBS"}</p>
            {doc.specialty && (
              <p className="text-xs text-foreground/80 font-medium truncate mt-0.5">
                {doc.specialty}
              </p>
            )}
          </div>
        </div>

        {/* Chamber / Hospital */}
        {doc.hospital_name && (
          <p className="text-xs text-muted-foreground mt-3 line-clamp-1">
            Chamber: <span className="text-foreground">{doc.hospital_name}</span>
          </p>
        )}

        {/* Schedule & Experience */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium text-foreground">
              {doc.available_day || "Everyday"}
            </span>
          </span>
          <span className="text-muted-foreground">
            Exp: <strong className="text-foreground">{doc.experience || 0}+ yrs</strong>
          </span>
        </div>
      </div>

      {/* Footer: Fee & Action */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
            Consultation Fee
          </span>
          <span className="text-base font-bold text-primary">
            ৳{Number(doc.consultation_fee || 0).toLocaleString("en-BD")}
          </span>
        </div>

        <Link
          href={`/visit/checkout?doctor_id=${doc._id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
        >
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}