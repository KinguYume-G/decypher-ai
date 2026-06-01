import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">
          {label}
        </span>
      )}
      <input
        className={cn(
          "w-full rounded-lg border border-outline-variant/30 bg-surface-container-low/50 px-md py-sm font-body-md text-body-md text-on-surface placeholder-on-surface-variant/50 outline-none transition-all",
          "focus:border-secondary focus:ring-2 focus:ring-secondary/20",
          error && "border-error focus:ring-error/20",
          className
        )}
        {...props}
      />
      {error && (
        <p className="font-label-sm text-label-sm text-error">{error}</p>
      )}
    </label>
  );
}
