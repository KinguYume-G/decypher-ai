import { cn, compactScore } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  value: number;
  tone?: "primary" | "secondary" | "tertiary";
}

export function ScoreBar({ label, value, tone = "primary" }: ScoreBarProps) {
  const tones = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    tertiary: "bg-tertiary",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-on-surface-variant">{label}</span>
        <span className="font-label-sm text-on-surface">{compactScore(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn("h-full rounded-full", tones[tone])}
          style={{ width: `${Math.max(0, Math.min(value * 10, 100))}%` }}
        />
      </div>
    </div>
  );
}
