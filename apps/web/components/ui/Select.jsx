import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    id,
    disabled = false,
    required = false,
    options = [],
    children,
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

      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          className={`flex h-10 w-full appearance-none rounded-md border bg-card px-3 py-2 pr-9 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? "border-destructive focus-visible:ring-destructive"
              : "border-input hover:border-muted-foreground/50"
          } ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="absolute right-3 top-3 h-4 w-4 pointer-events-none text-muted-foreground" />
      </div>

      {error ? (
        <p className="text-xs text-destructive font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;
