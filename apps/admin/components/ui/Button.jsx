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
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-95 shadow-sm active:scale-[0.99]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
    ghost: "text-foreground hover:bg-muted hover:text-foreground",
    outline: "border border-border bg-transparent text-foreground hover:bg-muted",
    destructive: "bg-destructive text-destructive-foreground hover:opacity-95 shadow-sm active:scale-[0.99]",
    accent: "bg-accent text-accent-foreground hover:opacity-95 shadow-sm active:scale-[0.99]",
    link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs rounded-md gap-1.5",
    md: "h-10 px-4 py-2 text-sm rounded-md gap-2",
    lg: "h-12 px-6 text-base rounded-lg gap-2.5",
    icon: "h-10 w-10 p-0 rounded-md",
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
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

export default Button;
