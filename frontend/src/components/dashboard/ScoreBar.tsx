interface ScoreBarProps {
  label: string;
  value: number; // 0–10
  tone?: "primary" | "secondary" | "tertiary";
}

export function ScoreBar({ label, value, tone = "primary" }: ScoreBarProps) {
  const pct = Math.round((value / 10) * 100);

  const fillClass =
    tone === "tertiary"
      ? "bg-on-tertiary-container"
      : "bg-secondary";

  const glowClass =
    tone === "tertiary"
      ? "shadow-[0_0_6px_rgba(0,144,169,0.4)]"
      : "shadow-[0_0_6px_rgba(113,42,226,0.4)]";

  return (
    <div className="space-y-xs">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
          {label}
        </span>
        <span className="font-label-md text-label-md text-on-surface font-bold">
          {value.toFixed(1)}
        </span>
      </div>
      <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${fillClass} ${glowClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
