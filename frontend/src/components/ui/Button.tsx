import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    // Purple → Cyan gradient, white text
    primary:
      "accent-gradient-bg text-on-primary shadow-lg shadow-secondary/20 hover:opacity-90 active:scale-95",
    // Ghost with outline border
    secondary:
      "bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors active:scale-95",
    // Minimal ghost
    ghost:
      "border border-outline-variant/30 bg-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors",
    // Error state
    danger:
      "border border-outline-variant/30 bg-error-container text-on-error-container hover:opacity-90",
  };

  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 font-label-md text-label-md transition-all disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Working..." : children}
    </button>
  );
}
