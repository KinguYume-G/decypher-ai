"use client";

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { OpportunityCard } from '@/components/dashboard/OpportunityCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useOpportunities } from '@/hooks/useOpportunities';

export default function Page() {
  return <InsightsExperience />;
}

function InsightsExperience() {
  const { opportunities, loading } = useOpportunities({ limit: 9 });
  const averageScore = opportunities.length
    ? opportunities.reduce((sum, item) => sum + item.score_total, 0) / opportunities.length
    : 0;

  return (
    <AppShell>
      <main className="w-full px-5 py-6 md:px-margin-desktop md:py-8">
        <div className="mx-auto max-w-[1400px] space-y-8">
          <section className="glass-panel rounded-xl p-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <BarChart3 size={24} />
                </div>
                <Badge tone="secondary">Insights</Badge>
                <h1 className="mt-3 font-display-xl text-3xl font-black text-on-surface md:text-4xl">
                  Market signal summary
                </h1>
                <p className="mt-3 max-w-2xl text-on-surface-variant">
                  This page is intentionally lighter than the old terminal view. It summarizes the signal quality
                  coming out of your real opportunity pipeline.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MiniStat label="Tracked signals" value={opportunities.length.toString()} />
                <MiniStat label="Avg score" value={averageScore ? averageScore.toFixed(1) : "-"} />
              </div>
            </div>
          </section>

          {loading ? (
            <div className="glass-panel flex min-h-[260px] items-center justify-center rounded-xl">
              <LoadingSpinner />
            </div>
          ) : opportunities.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          ) : (
            <div className="glass-panel flex min-h-[260px] flex-col items-center justify-center rounded-xl p-8 text-center">
              <h2 className="font-headline-md text-xl text-on-surface">No market signals yet</h2>
              <p className="mt-2 max-w-md text-sm text-on-surface-variant">
                Run a task first. Insights should reflect your collected data, not decorative placeholder metrics.
              </p>
              <Link href="/tasks" className="mt-5 text-sm font-semibold text-primary hover:underline">
                Create a task
              </Link>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-5 py-4 text-center">
      <div className="font-label-sm text-[10px] uppercase tracking-widest text-outline">{label}</div>
      <div className="mt-1 font-headline-md text-2xl text-on-surface">{value}</div>
    </div>
  );
}
