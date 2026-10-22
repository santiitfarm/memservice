"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  Shield,
  Palette,
  KeyRound,
  Save,
  RotateCcw,
  Upload,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import {
  useFetchProfileQuery,
  useUpdateProfileMutation,
} from "@/store/slices/profileApi";

export default function ProfilePage() {
  const { data, isLoading, refetch, isFetching } = useFetchProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [theme, setTheme] = useState("system");

  const user = data?.user;

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
      setTheme(user.theme || "system");
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        avatar: avatar.trim(),
        theme,
      }).unwrap();
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err?.data?.error || err?.message || "Failed to update profile");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <User className="w-7 h-7 text-primary" />
            Staff Profile & Preferences
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your personal staff details, avatar, and dashboard appearance theme.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RotateCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/dashboard/profile/security">
            <Button size="sm" variant="outline" className="gap-1.5">
              <KeyRound className="w-4 h-4" /> Change Password
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Avatar & Role Summary */}
        <Card className="text-center p-6 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-primary/20 shadow-sm">
            {avatar ? (
              <Image
                src={avatar}
                alt="Avatar"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                {firstName ? firstName[0]?.toUpperCase() : "U"}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-foreground text-base">
              {firstName} {lastName}
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {user?.email || "—"}
            </p>
            <div className="mt-2">
              <Badge variant="primary" className="capitalize text-xs">
                <Shield className="w-3 h-3 mr-1 inline" /> {user?.role || "Staff"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Right: Profile Details Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="border-b border-border py-4">
              <CardTitle className="text-base font-bold text-foreground">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    <Input
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Address (Read-only)"
                      value={user?.email || ""}
                      disabled
                      helperText="Contact super-admin to change email."
                    />
                    <Input
                      label="Mobile Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01700000000"
                      required
                    />
                  </div>

                  <Input
                    label="Avatar Image URL"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../avatar.jpg"
                    helperText="Paste direct image link or upload in Media library."
                  />

                  <Select
                    label="Dashboard Theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="system">System Default</option>
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                  </Select>

                  <div className="flex justify-end pt-3 border-t border-border">
                    <Button type="submit" isLoading={isSaving} className="gap-2">
                      <Save className="w-4 h-4" /> Save Profile
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
