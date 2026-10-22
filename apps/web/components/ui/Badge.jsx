import React from "react";

export function Badge({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const variants = {
    default: "bg-primary/15 text-primary border-primary/30",
    primary: "bg-primary text-primary-foreground border-transparent",
    secondary: "bg-secondary text-secondary-foreground border-transparent",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    destructive: "bg-destructive/15 text-destructive border-destructive/30",
    info: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    outline: "border-border text-foreground bg-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border transition-colors select-none ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
