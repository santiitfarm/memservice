"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import DarkMood from "@/app/(dashboard)/dashboard/components/ui/DarkMood";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/auth/staff/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to process request. Please try again.");
      } else {
        setMessage(
          data.message ||
            "If an active staff account exists for this email, a password reset link has been sent."
        );
      }
    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background text-foreground relative">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <DarkMood isCollapsed={false} className="w-48" />
      </div>

      <div className="max-w-md w-full rounded-2xl border border-border bg-card shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Forgot Password
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Enter your staff email address to receive a secure reset link.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3 text-left">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-foreground font-medium leading-relaxed">
                {message}
              </p>
            </div>
            <Link
              href="/admin-login"
              className="inline-flex items-center text-xs font-semibold text-primary hover:underline pt-2"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Staff Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@memservice.local"
              leftAddon={<Mail className="w-4 h-4" />}
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="md"
            >
              Send Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/admin-login"
                className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

