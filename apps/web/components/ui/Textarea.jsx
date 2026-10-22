import React, { forwardRef } from "react";

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    id,
    disabled = false,
    required = false,
    rows = 3,
    className = "",
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-foreground uppercase tracking-wider"
        >
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`flex w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? "border-destructive focus-visible:ring-destructive"
            : "border-input hover:border-muted-foreground/50"
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-destructive font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Textarea;
