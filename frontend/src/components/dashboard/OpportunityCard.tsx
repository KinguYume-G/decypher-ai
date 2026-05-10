import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { compactScore, formatDate } from "@/lib/utils";
import type { Opportunity } from "@/types";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const scoreTone =
    opportunity.score_total >= 8 ? "primary" : opportunity.score_total >= 6 ? "secondary" : "warning";

  return (
    <article className="glass-card flex h-full flex-col rounded-xl p-5 transition-colors hover:border-primary/30">
      <div className="mb-4 flex items-start justify-between gap-3">
        <Badge tone={scoreTone}>{compactScore(opportunity.score_total)} confidence</Badge>
        <span className="text-xs text-outline">{formatDate(opportunity.created_at)}</span>
      </div>

      <h3 className="font-headline-md text-lg text-on-surface">{opportunity.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-on-surface-variant">
        {opportunity.why_it_matters}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {opportunity.keywords_matched.slice(0, 4).map((keyword) => (
          <Badge key={keyword} tone="muted">
            {keyword}
          </Badge>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/5 pt-4 text-center">
        <Metric label="Trend" value={opportunity.score_trend} />
        <Metric label="Feasible" value={opportunity.score_feasibility} />
        <Metric label="Market" value={opportunity.score_commercial} />
      </div>

      <Link
        href={`/chat?opportunityId=${opportunity.id}`}
        className="mt-5 inline-flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
      >
        <span className="inline-flex items-center gap-2">
          <Sparkles size={16} />
          Deep dive
        </span>
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-label-sm text-[10px] uppercase text-outline">{label}</div>
      <div className="mt-1 text-sm font-bold text-on-surface">{value.toFixed(1)}</div>
    </div>
  );
}
