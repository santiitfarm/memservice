"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { Languages } from "lucide-react";

export default function LanguageToggle({ compact = false }) {
  const { lang, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold shadow-xs">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-label="Switch to English"
        className={`px-2 py-1 rounded-full transition-all ${
          lang === "en"
            ? "bg-primary text-primary-foreground shadow-xs font-bold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("bn")}
        aria-label="বাংলা ভাষায় পরিবর্তন করুন"
        className={`px-2.5 py-1 rounded-full transition-all ${
          lang === "bn"
            ? "bg-primary text-primary-foreground shadow-xs font-bold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        বাং
      </button>
    </div>
  );
}
