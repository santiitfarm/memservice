"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { login } from "@/app/actions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function DashboardLoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);

    try {
      await login(formData);
      router.push("/dashboard");
    } catch (err) {
      setLoading(false);
      setError("Invalid email or password");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/15 text-destructive border border-destructive/20 text-xs font-medium animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Email Address"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="admin@memservice.local"
        leftAddon={<Mail className="w-4 h-4" />}
      />

      <div className="space-y-1">
        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          leftAddon={<Lock className="w-4 h-4" />}
        />
        <div className="flex justify-end pt-1">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-primary hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={loading}
        className="w-full mt-2"
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Sign In to Dashboard
      </Button>
    </form>
  );
}
