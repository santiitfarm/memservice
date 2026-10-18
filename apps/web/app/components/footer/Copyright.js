"use client";
import Image from "next/image";
import { SITE } from "./siteInfo";

const payments = [
  { name: "bKash", src: "/assets/logo/bkash.png" },
  { name: "Nagad", src: "/assets/logo/nagad.png" },
];

function Copyright() {
  // Evaluated in the browser on every render, so it never goes stale on a statically built page.
  const year = new Date().getFullYear();

  return (
    <section className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-5 text-sm md:px-6 sm:flex-row">
      <p className="text-center text-white/80 sm:text-left">
        &copy; <span suppressHydrationWarning>{year}</span> {SITE.name}. All
        rights reserved.
      </p>
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wide text-white/60">
          We accept
        </span>
        {payments.map((p) => (
          <span
            key={p.name}
            className="flex h-8 items-center rounded bg-white px-3"
          >
            <Image
              src={p.src}
              alt={p.name}
              width={80}
              height={28}
              className="h-5 w-auto object-contain"
            />
          </span>
        ))}
        <span className="flex h-8 items-center rounded bg-white/10 px-3 text-xs font-medium text-white">
          Cash on Delivery
        </span>
      </div>
    </section>
  );
}

export default Copyright;
