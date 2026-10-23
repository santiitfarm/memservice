"use client";

import React from "react";
import Button from "@/components/ui/Button";
import { Edit2 } from "lucide-react";

export default function EditButton({ category, onClick }) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => onClick?.(category)}
      className="h-8 px-2.5 text-xs font-medium gap-1"
    >
      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
      <span>Edit</span>
    </Button>
  );
}
