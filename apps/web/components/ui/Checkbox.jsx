import React, { forwardRef } from "react";
import { Check } from "lucide-react";

export const Checkbox = forwardRef(function Checkbox(
  {
    label,
    description,
    id,
    checked,
    onChange,
    disabled = false,
    className = "",
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer h-4 w-4 appearance-none rounded border border-input bg-card shadow-sm transition-all checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <Check className="pointer-events-none absolute h-3 w-3 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100" />
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={inputId}
              className="text-sm font-medium text-foreground cursor-pointer select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </div>
  );
});

export default Checkbox;
