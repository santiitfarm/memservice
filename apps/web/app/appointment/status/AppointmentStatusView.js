"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Phone,
  Building,
  AlertCircle,
  Copy,
  Check,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function AppointmentStatusView({ initialId = "", initialPhone = "", initialSuccess = false }) {
  const [appId, setAppId] = useState(initialId);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [copied, setCopied] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchAppointment = async (idToFetch, phoneToFetch) => {
    if (!idToFetch || !phoneToFetch) {
      setErrorMsg("Please enter both the Appointment Reference Code and Phone Number.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(
        `${apiUrl}/api/appointments/${encodeURIComponent(idToFetch.trim())}?phone=${encodeURIComponent(phoneToFetch.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Appointment not found for the given details.");
      }

      setAppointment(data.appointment || null);
      setHasSearched(true);
    } catch (err) {
      setErrorMsg(err.message || "Could not retrieve appointment record.");
      setAppointment(null);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId && initialPhone) {
      fetchAppointment(initialId, initialPhone);
    }
  }, [initialId, initialPhone]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAppointment(appId, phone);
  };

  const handleCopy = (text) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const status = appointment?.status || "requested";

  const statusBadge = {
    requested: { label: "Requested / Pending Confirmation", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
    confirmed: { label: "Confirmed by Clinic", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
    rescheduled: { label: "Rescheduled", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" },
    completed: { label: "Completed", bg: "bg-primary/10 text-primary border-primary/30" },
    cancelled: { label: "Cancelled", bg: "bg-destructive/10 text-destructive border-destructive/30" },
  }[status] || { label: status, bg: "bg-muted text-muted-foreground border-border" };

  return (
    <div className="space-y-6">
      {/* Success Banner if redirected from booking */}
      {initialSuccess && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <h4 className="font-bold text-base text-emerald-900 dark:text-emerald-200">
              Appointment Request Submitted!
            </h4>
            <p className="mt-1">
              Your request has been received. Our clinical coordinators will verify the doctor&apos;s serial and contact your mobile number.
            </p>
          </div>
        </div>
      )}

      {/* Lookup Search Form */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <span>Lookup Appointment Status</span>
        </h3>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-xs font-semibold text-foreground/80 mb-1">
              Appointment Reference / ID
            </label>
            <input
              type="text"
              required
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="e.g. APT-261022-1234 or MongoDB ID"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-foreground/80 mb-1">
              Mobile Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Lookup</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Appointment Details Card */}
      {appointment && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Appointment Reference Code
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-mono font-bold text-foreground">
                  {appointment.referenceCode || appointment._id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(appointment.referenceCode || appointment._id)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
                  title="Copy Reference Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded-full border text-xs font-bold ${statusBadge.bg}`}>
              {statusBadge.label}
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-3 gap-2 py-2">
            <div className={`text-center p-3 rounded-xl border ${
              ["requested", "confirmed", "completed"].includes(status)
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted/40 border-border text-muted-foreground"
            }`}>
              <div className="text-xs font-bold">1. Requested</div>
              <div className="text-[10px] mt-0.5">Submitted</div>
            </div>

            <div className={`text-center p-3 rounded-xl border ${
              ["confirmed", "completed"].includes(status)
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted/40 border-border text-muted-foreground"
            }`}>
              <div className="text-xs font-bold">2. Confirmed</div>
              <div className="text-[10px] mt-0.5">Serial Assigned</div>
            </div>

            <div className={`text-center p-3 rounded-xl border ${
              status === "completed"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-muted/40 border-border text-muted-foreground"
            }`}>
              <div className="text-xs font-bold">3. Consulted</div>
              <div className="text-[10px] mt-0.5">Completed</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Doctor Card */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Doctor Details
              </span>
              <h4 className="font-bold text-sm text-foreground">
                {appointment.doctor?.name || "Specialist Doctor"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {appointment.doctor?.specialty || appointment.doctor?.department}
              </p>
              {appointment.doctor?.hospital_name && (
                <p className="text-xs text-foreground/80 flex items-center gap-1.5 pt-1">
                  <Building className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{appointment.doctor.hospital_name}</span>
                </p>
              )}
            </div>

            {/* Patient & Date Card */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Schedule & Patient
              </span>
              <div className="flex items-center gap-2 text-xs text-foreground font-semibold">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{new Date(appointment.preferredDate).toDateString()}</span>
                <span className="text-muted-foreground uppercase">({appointment.preferredSlot})</span>
              </div>
              <div className="text-xs text-muted-foreground pt-1 space-y-0.5">
                <p>Patient: <strong className="text-foreground">{appointment.patient?.name}</strong></p>
                <p>Phone: <strong className="text-foreground">{appointment.patient?.phone}</strong></p>
              </div>
            </div>
          </div>

          {/* Fee snapshot */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground block">Consultation Fee</span>
              <span className="text-lg font-extrabold text-primary">
                ৳{Number(appointment.feeSnapshot?.consultation || 0).toLocaleString("en-BD")}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">Payable at clinic chamber</span>
          </div>

          {/* Action links */}
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/consultation"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Browse other medical departments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
