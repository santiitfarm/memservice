"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { formatPrice, formatNumber, getUiText } from "@/lib/ui-text";

const LanguageContext = createContext({
  lang: "en",
  setLanguage: () => {},
  t: (key) => key,
  formatPrice: (amt) => `৳${amt}`,
  formatNumber: (n) => String(n),
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children, initialLang = "en" }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    // Read from cookie on client
    const match = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
    if (match && (match[1] === "bn" || match[1] === "en")) {
      setLang(match[1]);
    }
  }, []);

  const switchLanguage = (newLang) => {
    if (newLang !== "en" && newLang !== "bn") return;
    setLang(newLang);
    // Write cookie valid for 1 year
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    // Reload page to re-render server components with new language and font
    window.location.reload();
  };

  const t = (key) => getUiText(key, lang);
  const priceFormatter = (amt) => formatPrice(amt, lang);
  const numberFormatter = (n) => formatNumber(n, lang);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLanguage: switchLanguage,
        t,
        formatPrice: priceFormatter,
        formatNumber: numberFormatter,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
