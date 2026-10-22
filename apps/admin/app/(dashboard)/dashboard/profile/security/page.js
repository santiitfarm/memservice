"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { signOut } from "next-auth/react";
import {
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Save,
  Laptop,
  Smartphone,
  Globe,
  LogOut,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import {
  useChangePasswordMutation,
  useFetchSessionsQuery,
  useRevokeSessionMutation,
  useSignOutEverywhereMutation,
} from "@/store/slices/profileApi";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmSignoutAll, setConfirmSignoutAll] = useState(false);

  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const { data: sessionData, isLoading: isLoadingSessions, refetch: refetchSessions, isFetching: isRefetching } = useFetchSessionsQuery();
  const [revokeSession, { isLoading: isRevoking }] = useRevokeSessionMutation();
  const [signOutEverywhere, { isLoading: isSigningOutAll }] = useSignOutEverywhereMutation();

  const sessions = sessionData?.sessions || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      toast.success(res?.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to update password");
    }
  };

  const handleRevoke = async (jti) => {
    try {
      await revokeSession(jti).unwrap();
      toast.success("Session revoked successfully");
      refetchSessions();
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to revoke session");
    }
  };

  const handleSignOutEverywhere = async () => {
    try {
      await signOutEverywhere().unwrap();
      toast.success("Signed out of all devices. Redirecting to login...");
      setTimeout(() => {
        signOut({ callbackUrl: "/admin-login" });
      }, 1000);
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to sign out everywhere");
    }
  };

  const parseDevice = (ua = "") => {
    if (!ua) return "Unknown Device";
    if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) return "Mobile Device";
    if (ua.includes("Windows")) return "Windows PC";
    if (ua.includes("Macintosh")) return "MacBook / iMac";
    if (ua.includes("Linux")) return "Linux Device";
    return "Desktop Browser";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/profile"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Lock className="w-7 h-7 text-primary" />
            Security & Session Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your password, credentials, and active staff sessions across devices.
          </p>
        </div>
      </div>

      {/* Change Password Card */}
      <Card>
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-base font-bold text-foreground">
            Change Password
          </CardTitle>
          <CardDescription className="text-xs">
            Verify your current password before setting a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              helperText="Must be at least 8 characters long."
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="p-3 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Password Guidelines:
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>Minimum 8 characters</li>
                <li>Combine letters, numbers, and symbols</li>
                <li>Do not reuse previous or simple passwords</li>
              </ul>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button type="submit" isLoading={isChangingPassword} className="gap-2">
                <Save className="w-4 h-4" /> Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Database-Backed Active Sessions Card */}
      <Card>
        <CardHeader className="border-b border-border py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Laptop className="w-5 h-5 text-primary" /> Active Staff Sessions
            </CardTitle>
            <CardDescription className="text-xs">
              Database-backed sessions currently authorized to access admin routes with your account.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchSessions()}
            disabled={isRefetching}
            className="gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {isLoadingSessions ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions tracked.</p>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {sessions.map((s) => (
                <div
                  key={s.jti}
                  className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                    s.isRevoked ? "bg-muted/20 opacity-60" : "bg-card hover:bg-muted/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground mt-0.5">
                      {parseDevice(s.userAgent).includes("Mobile") ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Laptop className="w-4 h-4" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">
                          {parseDevice(s.userAgent)}
                        </span>
                        {s.isCurrent && (
                          <Badge variant="success" className="text-[10px] py-0 px-1.5">
                            Current Device
                          </Badge>
                        )}
                        {s.isRevoked && (
                          <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                            Revoked
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>IP: {s.ip || "Unknown"}</span>
                        <span>•</span>
                        <span>Last seen: {new Date(s.lastSeenAt || s.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {!s.isRevoked && !s.isCurrent && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevoke(s.jti)}
                      disabled={isRevoking}
                      className="gap-1 text-xs h-8"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sign Out Everywhere Action */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Revoke all sessions across every browser
              </p>
              <p className="text-[11px] text-muted-foreground">
                Instantly signs you out of all desktop and mobile devices.
              </p>
            </div>

            {!confirmSignoutAll ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmSignoutAll(true)}
                className="gap-1.5 shrink-0"
              >
                <LogOut className="w-4 h-4" /> Sign out everywhere
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmSignoutAll(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleSignOutEverywhere}
                  isLoading={isSigningOutAll}
                  className="gap-1.5"
                >
                  Confirm Sign Out Everywhere
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
