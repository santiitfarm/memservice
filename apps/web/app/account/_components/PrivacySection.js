"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Shield, Download, Trash2, AlertCircle, CheckCircle2, Loader2, Clock } from "lucide-react";

export default function PrivacySection() {
  const { data: session } = useSession();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteNotes, setDeleteNotes] = useState("");

  const fetchRequests = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/me/data-requests`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRequest = async (type, notes = "") => {
    if (!session?.accessToken) return;
    try {
      setActionLoading(type);
      setMsg({ type: "", text: "" });
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/me/data-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ type, notes }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit request.");
      }

      setMsg({
        type: "success",
        text: data.message || `Your data ${type} request has been submitted.`,
      });
      setShowDeleteConfirm(false);
      fetchRequests();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Request failed." });
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-8 space-y-5">
      <div className="flex items-center gap-2.5 pb-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Privacy & Data Control</h2>
          <p className="text-xs text-muted-foreground">
            Manage your personal data portability and account privacy rights.
          </p>
        </div>
      </div>

      {msg.text && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
            msg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export Data */}
        <div className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Download className="w-4 h-4 text-primary" />
              <span>Download My Data</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Request a comprehensive archive containing your order history, profile details, and address book.
            </p>
          </div>
          <button
            type="button"
            disabled={actionLoading === "export"}
            onClick={() => handleRequest("export")}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {actionLoading === "export" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Request Data Export</span>
          </button>
        </div>

        {/* Delete Account */}
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-destructive flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Submit a formal account deletion request. In accordance with privacy regulations, customer records are scrubbed.
            </p>
          </div>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 px-4 py-2 rounded-xl border border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-semibold transition inline-flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Request Account Deletion</span>
            </button>
          ) : (
            <div className="mt-3 p-3 rounded-lg bg-card border border-destructive/30 space-y-2 text-xs">
              <p className="font-semibold text-destructive">Are you sure you want to delete your account?</p>
              <input
                type="text"
                value={deleteNotes}
                onChange={(e) => setDeleteNotes(e.target.value)}
                placeholder="Reason for deletion (optional)"
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 rounded-md border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading === "delete"}
                  onClick={() => handleRequest("delete", deleteNotes)}
                  className="px-3 py-1 rounded-md bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90"
                >
                  {actionLoading === "delete" ? "Submitting..." : "Confirm Deletion"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing Requests List */}
      {requests.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Recent Privacy Requests
          </h4>
          <div className="space-y-2">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold uppercase text-foreground mr-2">
                    {req.type === "export" ? "Data Export" : "Account Deletion"}
                  </span>
                  <span className="text-muted-foreground">
                    Requested on {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    req.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
