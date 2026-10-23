"use client";

import { Suspense } from "react";
import AuthPortal from "../_components/AuthPortal";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center py-16 text-center text-xs text-muted-foreground">
          Loading registration portal...
        </div>
      }
    >
      <AuthPortal initialMode="register" />
    </Suspense>
  );
}
