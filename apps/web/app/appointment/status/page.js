import AppointmentStatusView from "./AppointmentStatusView";
import Link from "next/link";
import { ArrowLeft, Stethoscope } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Check Appointment Status - Mem Service",
  description: "Check the status of your doctor consultation booking at Mem Service.",
};

export default async function AppointmentStatusPage({ searchParams }) {
  const params = await searchParams;
  const initialId = params?.id || params?.ref || "";
  const initialPhone = params?.phone || "";
  const initialSuccess = params?.success === "1" || params?.success === "true";

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/consultation/doctor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Doctors Directory</span>
          </Link>
          <Link
            href="/visit/checkout"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>New Appointment</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Appointment Status & Verification
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track your doctor appointment confirmation, serial number, and consultation schedule.
          </p>
        </div>

        <AppointmentStatusView
          initialId={initialId}
          initialPhone={initialPhone}
          initialSuccess={initialSuccess}
        />
      </div>
    </div>
  );
}
