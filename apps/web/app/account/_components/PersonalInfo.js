"use client";

import { Edit2, X, Check, LogOut, User, Mail, Phone, MapPin } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function PersonalInfo({ user }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: user?._id || user?.id,
    name: user?.customer_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    address: user?.address || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const userId = user?._id || user?.id;
      const token = session?.accessToken;

      const res = await fetch(`${apiUrl}/api/customerProfile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Profile information updated successfully!");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error("Could not update profile information");
      }
    } catch (err) {
      toast.error("Network error while saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6 shadow-xs">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            Personal Information
          </h2>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              disabled={!isEditing}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card disabled:bg-muted/40 text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled={!isEditing}
              onChange={handleInputChange}
              placeholder="e.g. yourname@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card disabled:bg-muted/40 text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:cursor-not-allowed"
            />
          </div>

          {/* Phone (Immutable) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>Registered Phone (Verified)</span>
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-muted/40 text-muted-foreground text-xs font-mono font-medium cursor-not-allowed"
            />
          </div>

          {/* Delivery Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Default Delivery Address</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              disabled={!isEditing}
              onChange={handleInputChange}
              placeholder="e.g. House #12, Road #4, Dhanmondi, Dhaka"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-card disabled:bg-muted/40 text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save Profile"}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-primary" />
              <span>Edit Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
