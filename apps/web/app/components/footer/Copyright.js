"use client";

import Image from "next/image";

export default function Copyright({ site = {}, paymentMethods = [] }) {
  const currentYear = new Date().getFullYear();
  const copyrightText = site?.footer?.copyrightText || "Mem Service. All rights reserved.";
  const showPaymentBadges = site?.footer?.showPaymentBadges !== false;

  // Recognized provider logos or text badges
  const knownLogos = {
    bkash: { name: "bKash", src: "/assets/logo/bkash.png" },
    nagad: { name: "Nagad", src: "/assets/logo/nagad.png" },
  };

  const activeMethods = paymentMethods.length > 0
    ? paymentMethods
    : [{ key: "bkash", name: "bKash" }, { key: "nagad", name: "Nagad" }, { key: "cod", name: "Cash on Delivery" }];

  return (
    <section className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-4 text-xs md:px-6 sm:flex-row">
      <p className="text-center text-white/80 sm:text-left">
        &copy; <span suppressHydrationWarning>{currentYear}</span> {copyrightText}
      </p>

      {showPaymentBadges && (
        <div className="flex items-center flex-wrap gap-2 justify-center">
          <span className="text-[11px] uppercase tracking-wider text-white/60 mr-1">
            We Accept:
          </span>

          {activeMethods.map((pm) => {
            const logo = knownLogos[pm.key];
            if (logo) {
              return (
                <span
                  key={pm.key}
                  className="flex h-7 items-center rounded bg-white px-2.5 shadow-sm"
                  title={pm.name}
                >
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={70}
                    height={24}
                    className="h-4 w-auto object-contain"
                  />
                </span>
              );
            }

            return (
              <span
                key={pm.key}
                className="flex h-7 items-center rounded bg-white/10 px-2.5 text-[11px] font-medium text-white border border-white/20"
              >
                {pm.name || pm.key.toUpperCase()}
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
}
