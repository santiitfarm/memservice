import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export const Button = forwardRef(function Button(
  {
    children,
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className = "",
    leftIcon,
    rightIcon,
    ...props
  },
  ref
) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap cursor-pointer";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow active:scale-[0.98] border border-transparent",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs border border-transparent active:scale-[0.98]",
    ghost:
      "text-foreground hover:bg-muted hover:text-foreground border border-transparent active:scale-[0.98]",
    outline:
      "border border-border/80 bg-background text-foreground hover:bg-muted/70 shadow-xs active:scale-[0.98]",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs active:scale-[0.98] border border-transparent",
    accent:
      "bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs active:scale-[0.98] border border-transparent",
    link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
  };

  const sizes = {
    sm: "h-9 px-3.5 text-xs rounded-lg gap-2",
    md: "h-10 px-4 py-2 text-sm rounded-lg gap-2",
    lg: "h-11 px-5 text-sm rounded-xl gap-2.5",
    icon: "h-9 w-9 p-0 rounded-lg",
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0 inline-flex items-center">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="shrink-0 inline-flex items-center">{rightIcon}</span>
      )}
    </button>
  );
});

export default Button;

