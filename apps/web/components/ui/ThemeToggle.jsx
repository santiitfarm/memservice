"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export default function ThemeToggle({ className = "", compact = false }) {
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
    return <div className={`h-8 w-8 rounded-full bg-muted/60 animate-pulse ${className}`} />;
  }

  if (compact) {
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
        className={`p-2 rounded-full border border-border bg-card text-foreground hover:bg-muted transition-colors flex items-center justify-center shadow-sm ${className}`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-sky-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme selector"
      className={`inline-flex items-center gap-1 p-1 rounded-full bg-muted/80 border border-border text-muted-foreground ${className}`}
    >
      <button
        type="button"
        onClick={() => applyTheme("light")}
        aria-label="Light theme"
        aria-pressed={theme === "light"}
        className={`p-1.5 rounded-full transition-all ${
          theme === "light"
            ? "bg-card text-amber-500 shadow-sm"
            : "hover:text-foreground"
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => applyTheme("system")}
        aria-label="System theme"
        aria-pressed={theme === "system"}
        className={`p-1.5 rounded-full transition-all ${
          theme === "system"
            ? "bg-card text-foreground shadow-sm"
            : "hover:text-foreground"
        }`}
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => applyTheme("dark")}
        aria-label="Dark theme"
        aria-pressed={theme === "dark"}
        className={`p-1.5 rounded-full transition-all ${
          theme === "dark"
            ? "bg-card text-sky-400 shadow-sm"
            : "hover:text-foreground"
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
