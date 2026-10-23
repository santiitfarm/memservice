"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import DarkMood from "@/app/(dashboard)/dashboard/components/ui/DarkMood";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token || !email) {
      setError("Missing or invalid password reset link. Please request a new one.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/auth/staff/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to reset password. Link may have expired.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin-login");
        }, 2000);
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-xs leading-relaxed">
          Invalid or expired password reset link. Please request a new reset link.
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Request New Link
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="text-center space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3 text-left">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-foreground font-medium leading-relaxed">
              Password has been successfully updated! Redirecting to login...
            </p>
          </div>
          <Link
            href="/admin-login"
            className="inline-flex items-center justify-center font-medium h-9 px-4 text-xs rounded-md bg-primary text-primary-foreground hover:opacity-95 shadow-sm transition-colors"
          >
            Go to Login Now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Account Email
            </label>
            <p className="text-xs font-medium text-foreground bg-muted/60 border border-border px-3 py-2 rounded-lg">
              {email}
            </p>
          </div>

          <Input
            id="newPassword"
            label="New Password"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            leftAddon={<Lock className="w-4 h-4" />}
          />

          <Input
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            leftAddon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full mt-2"
            size="md"
          >
            Reset Password
          </Button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background text-foreground relative">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-5 right-5 z-20">
        <DarkMood isCollapsed={false} className="shadow-md" />
      </div>

      <div className="max-w-md w-full rounded-2xl border border-border bg-card shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Set New Password
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Choose a strong password with at least 8 characters.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-6 text-xs text-muted-foreground">
              Loading reset parameters...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

