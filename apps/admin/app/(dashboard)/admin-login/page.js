import DashboardLoginForm from "./LoginForm";
import DarkMood from "@/app/(dashboard)/dashboard/components/ui/DarkMood";
import { Shield, Activity, Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background text-foreground">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-5 right-5 z-20">
        <DarkMood isCollapsed={false} className="shadow-md" />
      </div>

      <div className="w-full max-w-4xl grid lg:grid-cols-2 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Left: Brand Panel */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-primary/10 border-r border-border relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-md font-bold">
                M
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Mem Service
              </span>
            </div>
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Management & Operations Portal
            </p>
          </div>

          <div className="relative z-10 space-y-6 my-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground leading-snug">
              Secure administration for healthcare commerce & consultations.
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-card border border-border text-primary shadow-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <span>Role-based access control with granular staff ranks</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-card border border-border text-emerald-500 shadow-xs">
                  <Activity className="w-4 h-4" />
                </div>
                <span>Live orders, courier booking & inventory audit tracking</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="p-1.5 rounded-md bg-card border border-border text-amber-500 shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <span>Encrypted credentials store & tamper-proof server pricing</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-muted-foreground border-t border-border/80 pt-4">
            &copy; {new Date().getFullYear()} Mem Service BD. All rights reserved.
          </div>
        </div>

        {/* Right: Login Form Card */}
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Sign In
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your staff credentials to access your administrative dashboard.
            </p>
          </div>

          <DashboardLoginForm />
        </div>
      </div>
    </div>
  );
}
