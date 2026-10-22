"use client";

import React, { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  CalendarDays,
  RotateCcw,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import {
  useFetchAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
} from "@/store/slices/appointmentsApi";

const STATUS_TABS = [
  { id: "", label: "All Appointments" },
  { id: "requested", label: "Requested" },
  { id: "confirmed", label: "Confirmed" },
  { id: "rescheduled", label: "Rescheduled" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function AppointmentsAdminPage() {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rescheduleModalApp, setRescheduleModalApp] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useFetchAppointmentsQuery({
    status: selectedStatus || undefined,
    search: searchTerm || undefined,
    limit: 50,
  });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateAppointmentStatusMutation();

  const appointments = data?.appointments || [];

  const handleUpdateStatus = async (appId, newStatus, doctorNotes = "") => {
    try {
      await updateStatus({
        id: appId,
        status: newStatus,
        doctorNotes,
      }).unwrap();
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to update appointment");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">Confirmed</Badge>;
      case "rescheduled":
        return <Badge variant="purple">Rescheduled</Badge>;
      case "completed":
        return <Badge variant="info">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "requested":
      default:
        return <Badge variant="warning">Requested</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-primary" />
            Doctor Appointments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage patient video consultations, clinic appointments, confirmation calls, and rescheduling.
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
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search patient name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
          />
        </div>
      </div>

      {/* Appointments Table */}
      <Card>
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-base font-bold text-foreground">
            Scheduled Appointments ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <Skeleton className="h-10 w-1/4" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Failed to load appointments: {error?.data?.message || error?.message || "Unknown error"}
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={CalendarDays}
                title="No appointments found"
                description={
                  searchTerm
                    ? `No appointments matched "${searchTerm}".`
                    : "There are currently no doctor appointment bookings in this filter."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Patient Info</th>
                    <th className="py-3 px-4">Doctor & Specialty</th>
                    <th className="py-3 px-4">Date & Time Slot</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Consultation Fee</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {appointments.map((app) => {
                    const appDate = app.appointmentDate
                      ? new Date(app.appointmentDate).toDateString()
                      : "—";
                    return (
                      <tr key={app._id} className="hover:bg-muted/30 transition-colors">
                        {/* Patient Info */}
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-bold text-foreground text-sm">
                              {app.patient?.name}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              <span className="font-mono">{app.patient?.phone}</span>
                            </div>
                            {app.patient?.age && (
                              <div className="text-[11px] text-muted-foreground">
                                Age: {app.patient.age} • Gender: {app.patient.gender || "—"}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Doctor */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Image
                              src={app.doctor?.image || "/placeholder.png"}
                              alt={app.doctor?.name || "Doctor"}
                              width={36}
                              height={36}
                              className="rounded-full object-cover bg-muted h-9 w-9 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-foreground text-sm">
                                Dr. {app.doctor?.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {app.doctor?.specialty || app.doctor?.department || "General"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Date & Slot */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-foreground flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                              <span>{appDate}</span>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{app.preferredSlot || "Flexible"}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {getStatusBadge(app.status)}
                        </td>

                        {/* Fee */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-foreground text-sm">
                            ৳{app.consultationFee ?? app.doctor?.consultation_fee ?? 0}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {app.status === "requested" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(app._id, "confirmed")}
                                disabled={isUpdating}
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Confirm
                              </Button>
                            )}

                            {app.status !== "completed" && app.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRescheduleModalApp(app)}
                                disabled={isUpdating}
                                className="h-7 text-xs gap-1"
                              >
                                <Clock className="w-3 h-3" /> Reschedule
                              </Button>
                            )}

                            {app.status === "confirmed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(app._id, "completed")}
                                disabled={isUpdating}
                                className="h-7 text-xs text-primary border-primary/30 gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Complete
                              </Button>
                            )}

                            {app.status !== "cancelled" && app.status !== "completed" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateStatus(app._id, "cancelled", "Cancelled by clinic admin")}
                                disabled={isUpdating}
                                className="h-7 text-xs text-destructive hover:text-destructive"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reschedule Modal */}
      {rescheduleModalApp && (
        <RescheduleModal
          isOpen={Boolean(rescheduleModalApp)}
          onClose={() => setRescheduleModalApp(null)}
          appointment={rescheduleModalApp}
          onRescheduled={() => {
            setRescheduleModalApp(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function RescheduleModal({ isOpen, onClose, appointment, onRescheduled }) {
  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("Evening (6:00 PM - 9:00 PM)");
  const [notes, setNotes] = useState("");
  const [updateStatus, { isLoading }] = useUpdateAppointmentStatusMutation();

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!newDate) {
      toast.error("Please select a new appointment date.");
      return;
    }

    try {
      await updateStatus({
        id: appointment._id,
        status: "rescheduled",
        rescheduledDate: newDate,
        rescheduledSlot: newSlot,
        doctorNotes: notes.trim(),
      }).unwrap();

      toast.success("Appointment rescheduled successfully!");
      onRescheduled();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to reschedule");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Appointment"
      description={`Patient: ${appointment?.patient?.name} • Dr. ${appointment?.doctor?.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleReschedule} className="space-y-4">
        <Input
          label="New Appointment Date"
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          required
        />
        <Select
          label="Time Slot"
          value={newSlot}
          onChange={(e) => setNewSlot(e.target.value)}
        >
          <option value="Morning (9:00 AM - 1:00 PM)">Morning (9:00 AM - 1:00 PM)</option>
          <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
          <option value="Evening (6:00 PM - 9:00 PM)">Evening (6:00 PM - 9:00 PM)</option>
        </Select>
        <Input
          label="Reason / Notes for Patient (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Doctor emergency call, rescheduled per patient request"
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Confirm Reschedule
          </Button>
        </div>
      </form>
    </Modal>
  );
}
