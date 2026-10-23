"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { User, Lock, Phone, ArrowRight, ShieldCheck, UserPlus, LogIn } from "lucide-react";
import ResetPasswordModal from "./ResetPasswordModal";

export default function AuthPortal({ initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const router = useRouter();

  // Login form state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const cleanPhone = loginPhone.trim();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const checkRes = await fetch(`${apiUrl}/api/customerProfile/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          password: loginPassword,
        }),
      });

      const checkData = await checkRes.json().catch(() => ({}));

      if (!checkRes.ok) {
        setLoginLoading(false);
        setLoginError(
          checkData.error ||
          checkData.message ||
          "Invalid phone number or password. Please verify your credentials."
        );
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        phone: cleanPhone,
        password: loginPassword,
      });

      setLoginLoading(false);
      if (!result?.error) {
        toast.success("Welcome back! Signed in successfully.");
        router.refresh();
      } else {
        setLoginError("Unable to sign in. Please verify your credentials.");
      }
    } catch (err) {
      setLoginLoading(false);
      setLoginError("Network connection error. Please try again.");
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    const digits = regPhone.replace(/\D/g, "");
    const bdPhone = digits.startsWith("8801") && digits.length === 13 ? digits.slice(2) : digits;
    if (!/^01[3-9]\d{8}$/.test(bdPhone)) {
      toast.error("Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).");
      return;
    }

    if (regPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setRegLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/customerProfile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          phone: bdPhone,
          password: regPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      setRegLoading(false);

      if (!res.ok) {
        toast.error(data.message || data.error || "Failed to register. Please check your details.");
        return;
      }

      toast.success("Account created successfully! Please sign in.");
      setLoginPhone(bdPhone);
      setMode("login");
    } catch (err) {
      setRegLoading(false);
      toast.error("An error occurred during registration. Please try again.");
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Customer Account Portal
          </h1>
          <p className="text-xs text-muted-foreground">
            Sign in to track orders, upload prescriptions, and manage delivery addresses.
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-muted rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setLoginError("");
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "login"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setLoginError("");
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "register"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* LOGIN FORM */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="01712345678"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loginLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Md. Mustafizur Rahman"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Mobile Number (Bangladesh)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="01712345678"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Password (Min. 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {regLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-border/60 text-center">
          <p className="text-[11px] text-muted-foreground">
            By signing in, you agree to Mem Service&#39;s{" "}
            <Link href="/terms-and-conditions" className="text-primary hover:underline">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      <ResetPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
}
