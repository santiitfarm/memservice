"use client";

import React, { useState } from "react";
import UpdatePasswordModal from "./UpdatePasswordModal";
import { KeyRound, ShieldAlert } from "lucide-react";

export default function AccountSetting({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6 shadow-xs">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            Security &amp; Account Settings
          </h2>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-foreground">
              Account Password
            </h3>
            <p className="text-xs text-muted-foreground">
              Ensure your account is using a strong password of at least 8 characters.
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity self-start sm:self-center"
            onClick={() => setIsModalOpen(true)}
          >
            Update Password
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-destructive">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Deactivate or Delete Account</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Permanently close your account and remove stored personal data under DGDA privacy rules.
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground bg-muted/30 cursor-not-allowed self-start sm:self-center"
            disabled
            title="Contact support to request permanent account closure"
          >
            Contact Support
          </button>
        </div>
      </div>

      <UpdatePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        setIsModalOpen={setIsModalOpen}
        id={user?._id || user?.id}
      />
    </div>
  );
}
