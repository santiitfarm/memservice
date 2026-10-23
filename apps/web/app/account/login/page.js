"use client";

import { Suspense } from "react";
import AuthPortal from "../_components/AuthPortal";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center py-16 text-center text-xs text-muted-foreground">
          Loading login portal...
        </div>
      }
    >
      <AuthPortal initialMode="login" />
    </Suspense>
  );
}
