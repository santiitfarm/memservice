import React from "react";
import { FolderOpen } from "lucide-react";
import Button from "./Button";

export function EmptyState({
  icon: Icon = FolderOpen,
  title = "No items found",
  description = "Get started by creating your first entry or adjust your search filters.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center animate-in fade-in-50 ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="text-base font-bold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} variant="primary" size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
