import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <label className="block space-y-2">
      {label ? (
        <span className="font-label-sm text-xs uppercase tracking-widest text-primary-fixed-dim">
          {label}
        </span>
      ) : null}
      <input
        className={cn(
          "h-11 w-full rounded-lg border border-white/10 bg-surface-container-lowest px-3 text-sm text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary/30",
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </label>
  );
}
