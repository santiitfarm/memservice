import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

export default function RegisterLayout({ children }) {
  const session = auth();

  if (session.user) {
    redirect("/account");
  }
  return <>{children}</>;
}
