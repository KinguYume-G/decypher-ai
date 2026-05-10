import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  tone?: "primary" | "secondary" | "success" | "warning" | "danger" | "muted";
  className?: string;
}

export function Badge({ children, tone = "muted", className }: BadgeProps) {
  const tones = {
    primary: "border-primary/20 bg-primary/10 text-primary",
    secondary: "border-secondary/20 bg-secondary/10 text-secondary",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    warning: "border-tertiary/20 bg-tertiary/10 text-tertiary",
    danger: "border-error/20 bg-error/10 text-error",
    muted: "border-white/10 bg-white/5 text-on-surface-variant",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-label-sm text-[10px] uppercase tracking-widest",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
