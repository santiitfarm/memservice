"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export default function DarkModeToggle({ isCollapsed = false, className = "" }) {
  const [theme, setTheme] = useState("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") || "system";
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
      <div className={`h-9 w-full rounded-lg bg-muted/50 animate-pulse ${className}`} />
    );
  }

  if (isCollapsed) {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    return (
      <button
        onClick={() => applyTheme(isDark ? "light" : "dark")}
        aria-label="Toggle theme"
        className={`p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors flex items-center justify-center ${className}`}
      >
        {isDark ? <Moon className="w-5 h-5 text-sky-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme selector"
      className={`flex items-center justify-between p-1 rounded-lg bg-muted border border-border text-muted-foreground ${className}`}
    >
      <button
        type="button"
        onClick={() => applyTheme("light")}
        aria-pressed={theme === "light"}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
          theme === "light"
            ? "bg-card text-foreground shadow-sm"
            : "hover:text-foreground"
        }`}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => applyTheme("system")}
        aria-pressed={theme === "system"}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
          theme === "system"
            ? "bg-card text-foreground shadow-sm"
            : "hover:text-foreground"
        }`}
      >
        <Laptop className="w-3.5 h-3.5" />
        <span>System</span>
      </button>

      <button
        type="button"
        onClick={() => applyTheme("dark")}
        aria-pressed={theme === "dark"}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
          theme === "dark"
            ? "bg-card text-foreground shadow-sm"
            : "hover:text-foreground"
        }`}
      >
        <Moon className="w-3.5 h-3.5 text-sky-400" />
        <span>Dark</span>
      </button>
    </div>
  );
}
