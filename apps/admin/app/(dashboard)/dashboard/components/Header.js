"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  KeyRound,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { logout } from "@/app/actions";
import Badge from "@/components/ui/Badge";

export default function Header({ setIsCollapsed, isCollapsed }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close profile dropdown on outside click or ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const handleSignOut = async () => {
    setProfileOpen(false);
    const res = await logout();
    if (res?.success) {
      router.refresh();
      router.push("/admin-login");
    }
  };

  // Compute page title from pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard Overview";
    const segments = pathname.replace("/dashboard/", "").split("/");
    const main = segments[0] || "Dashboard";
    return main.charAt(0).toUpperCase() + main.slice(1);
  };

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            {getPageTitle()}
          </h1>
          <span className="hidden sm:inline text-[11px] text-muted-foreground">
            Memservice Healthcare Admin
          </span>
        </div>
      </div>

      {/* Center: Global Search Placeholder */}
      <div className="hidden lg:flex items-center w-72 max-w-xs relative">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Quick search..."
          aria-label="Global search"
          className="w-full h-9 pl-9 pr-4 rounded-full border border-border bg-muted/40 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-all"
        />
      </div>

      {/* Right: Notifications & Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Icon (Visual placeholder) */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </button>

        {/* Profile Menu Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-haspopup="true"
            aria-expanded={profileOpen}
            className="flex items-center gap-2.5 p-1 rounded-full sm:rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-xs text-primary-foreground select-none shadow-sm">
              {initials}
            </div>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                {user?.name || "Staff User"}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize">
                {user?.role || "Staff"}
              </span>
            </div>

            <ChevronDown className="hidden md:block w-4 h-4 text-muted-foreground" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl p-2 z-50 animate-in fade-in-80 zoom-in-95 duration-150"
            >
              {/* User Bio Header */}
              <div className="px-3 py-2.5 border-b border-border/80 mb-1">
                <p className="text-sm font-bold text-foreground truncate">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || "admin@memservice.local"}
                </p>
                <div className="mt-2">
                  <Badge variant="success" size="sm" className="capitalize">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    {user?.role || "Staff"}
                  </Badge>
                </div>
              </div>

              {/* Menu Links */}
              <div className="space-y-0.5 py-1">
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground opacity-60 cursor-not-allowed"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile (Phase 4)</span>
                </button>

                <button
                  type="button"
                  disabled
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground opacity-60 cursor-not-allowed"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
              </div>

              {/* Logout Action */}
              <div className="border-t border-border/80 pt-1 mt-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
