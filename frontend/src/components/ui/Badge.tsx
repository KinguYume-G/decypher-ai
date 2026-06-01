import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  tone?: "primary" | "secondary" | "success" | "warning" | "danger" | "muted";
  className?: string;
}

export function Badge({ children, tone = "muted", className }: BadgeProps) {
  const tones = {
    // Selected / AI-driven → purple fill (secondary-fixed)
    primary:   "bg-secondary-fixed text-on-secondary-fixed",
    secondary: "bg-secondary-fixed text-on-secondary-fixed",
    // Success / data → cyan fill (tertiary-fixed)
    success:   "bg-tertiary-fixed text-on-tertiary-fixed",
    // Warning → soft amber border
    warning:   "border border-outline-variant/50 bg-surface-container text-on-surface-variant",
    // Danger → error tint
    danger:    "border border-outline-variant/30 bg-error-container text-on-error-container",
    // Default keyword chip → ghost border
    muted:     "border border-outline-variant/30 text-on-surface-variant",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded font-label-sm text-label-sm uppercase px-xs py-[2px]",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
