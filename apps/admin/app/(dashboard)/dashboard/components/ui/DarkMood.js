"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export default function DarkModeToggle({ isCollapsed = false, className = "" }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") || "light";
    setTheme(stored);
  }, []);

  const applyTheme = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);

    const isDark =
      nextTheme === "dark" ||
      (nextTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div className={`h-9 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`} />
    );
  }

  // Collapsed Sidebar View (Single compact toggle button)
  if (isCollapsed) {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    return (
      <button
        type="button"
        onClick={() => applyTheme(isDark ? "light" : "dark")}
        aria-label="Toggle theme"
        title={`Current: ${theme.toUpperCase()} • Click to switch`}
        className={`w-10 h-10 mx-auto rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-200 flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 shadow-sm ${className}`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-sky-400 transition-transform duration-200 hover:-rotate-12" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 hover:rotate-45" />
        )}
      </button>
    );
  }

  // Expanded View: Segmented Pill Switcher
  return (
    <div
      role="group"
      aria-label="Theme selector"
      className={`inline-flex items-center gap-1 p-1 rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md transition-all duration-200 ${className}`}
    >
      {/* Light Option */}
      <button
        type="button"
        onClick={() => applyTheme("light")}
        aria-label="Light theme"
        aria-pressed={theme === "light"}
        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium transition-all duration-200 select-none cursor-pointer ${
          theme === "light"
            ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] font-semibold"
            : "text-slate-500 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60"
        }`}
      >
        <Sun
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            theme === "light" ? "text-amber-500 scale-110" : "text-slate-400 dark:text-slate-500"
          }`}
        />
        <span>Light</span>
      </button>

      {/* System Option */}
      <button
        type="button"
        onClick={() => applyTheme("system")}
        aria-label="System preference"
        aria-pressed={theme === "system"}
        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium transition-all duration-200 select-none cursor-pointer ${
          theme === "system"
            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] font-semibold"
            : "text-slate-500 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60"
        }`}
      >
        <Laptop
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            theme === "system" ? "text-blue-500 dark:text-blue-400 scale-110" : "text-slate-400 dark:text-slate-500"
          }`}
        />
        <span>System</span>
      </button>

      {/* Dark Option */}
      <button
        type="button"
        onClick={() => applyTheme("dark")}
        aria-label="Dark theme"
        aria-pressed={theme === "dark"}
        className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-medium transition-all duration-200 select-none cursor-pointer ${
          theme === "dark"
            ? "bg-slate-800 text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] font-semibold"
            : "text-slate-500 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60"
        }`}
      >
        <Moon
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            theme === "dark" ? "text-sky-400 scale-110" : "text-slate-400 dark:text-slate-500"
          }`}
        />
        <span>Dark</span>
      </button>
    </div>
  );
}
