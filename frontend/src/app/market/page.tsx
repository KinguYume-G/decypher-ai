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

  return (
    <AppShell>
      <div className="flex-1 p-margin-desktop w-full max-w-[1600px] mx-auto space-y-8">
        {/* Content from Stitch */}
        
{/* Header section with AI Velocity */}
<section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
<div>
<div className="flex items-center gap-3 mb-2">
<span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-label-sm border border-primary/20 uppercase tracking-widest">Live Engine</span>
<span className="ai-pulse text-on-surface-variant font-body-md text-sm pl-4">System Processing Markets...</span>
</div>
<h1 className="font-display-xl text-headline-lg cyber-gradient-text uppercase">Emerging Tech &amp; Market Shifts</h1>
<p className="text-on-surface-variant max-w-2xl mt-2 font-body-md text-body-md">Advanced vector-based sentiment analysis and macro-trend velocity scoring for hyper-growth opportunities.</p>
</div>
<div className="glass-card px-6 py-4 rounded-xl flex items-center gap-8 glow-purple">
<div className="text-center">
<div className="text-outline text-label-sm font-label-sm mb-1 uppercase">Global Velocity</div>
<div className="font-headline-md text-primary">+42.8%</div>
</div>
<div className="h-10 w-px bg-white/10"></div>
<div className="text-center">
<div className="text-outline text-label-sm font-label-sm mb-1 uppercase">Alpha Sentiment</div>
<div className="font-headline-md text-secondary">BULLISH</div>
</div>
</div>
</section>
{/* Bento Grid of Macro Trends */}
<section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
{/* Large Feature: AI Chip Infrastructure */}
<div className="md:col-span-8 glass-card rounded-2xl overflow-hidden flex flex-col group">
<div className="relative h-48 overflow-hidden">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" data-alt="A highly detailed cinematic macro shot of a futuristic crystalline microprocessor circuit board glowing with neon violet and electric blue pulses of light. The atmosphere is dense and high-tech, with sharp geometric refractions and a deep midnight blue background that feels expensive and sophisticated. The style is hyper-modern cyberpunk, focusing on computational complexity and power." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4-_ujpKF0tciD9mf4NtXC7D5YkBkKvtfAb7VXVcHg1wByZwlfcmIO6RTVLE2C4PWyIjUtV4q_F3iD7-WCeJfjZUeqsSECeRi1WaGFUWdZpA5kcOKB4GpKDHSAfCMXE1LYLVICgCe3RjtqqBhTvg0UkfI0vjP0JsfBK1ad6CI3iei5ctlY4m_Gj0phMpCBXNis0uevswBWvwczbPkv17rP0Pydtg5mqrbl1hU5NC_FH54YBu_ghOc_ovuRre6GqERtd9sf0NkQX50"/>
<div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
<div className="absolute bottom-4 left-6">
<span className="font-label-sm text-[10px] bg-secondary-container/30 text-secondary border border-secondary/20 px-2 py-0.5 rounded backdrop-blur-md uppercase tracking-tighter">Sector: Compute</span>
<h2 className="font-headline-md text-on-surface mt-1">Optical Neural Backbones</h2>
</div>
</div>
<div className="p-6 flex-1 flex flex-col justify-between">
<div className="grid grid-cols-3 gap-6 mb-8">
<div>
<div className="text-on-surface-variant font-label-sm text-xs mb-1 uppercase">Market Cap Shifting</div>
<div className="font-headline-md text-2xl font-label-sm text-on-surface">$1.4T <span className="text-primary text-sm ml-1">↑ 12%</span></div>
</div>
<div>
<div className="text-on-surface-variant font-label-sm text-xs mb-1 uppercase">Adoption Index</div>
<div className="flex items-end gap-1">
<div className="h-4 w-2 bg-primary/20 rounded-t-sm"></div>
<div className="h-6 w-2 bg-primary/40 rounded-t-sm"></div>
<div className="h-8 w-2 bg-primary rounded-t-sm"></div>
<div className="h-5 w-2 bg-primary/30 rounded-t-sm"></div>
<span className="font-label-sm text-on-surface ml-2">High</span>
</div>
</div>
<div>
<div className="text-on-surface-variant font-label-sm text-xs mb-1 uppercase">Risk Profile</div>
<div className="font-label-sm text-tertiary uppercase">MODERATE-CALIBRATED</div>
</div>
</div>
<div className="flex items-center justify-between border-t border-white/5 pt-6">
<div className="flex -space-x-2">
<div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Close up profile picture of a professional tech analyst with focused expression, lit by blue monitor glow." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAj-xblQbdi6zEmrmxdX9V8k77Ilzg1O_z4htRxTJbfUikySHIbx_l3itgARHxRseUgis8OaFb7020uGlLiu4LJbrbxAJPnYid99lhts32wOQ9rB8Ut5D7Npv4KNLFNUtxMvpyOcdATp7CJu4Bq39w1MtG2TZomh0UsLcaGaU_xe9VRT69UT5f-3KoC0fQt5TFpq-IVZyAqntmhTptBox_pV7JVOLqyaJqYyJhCTe4WNspMhHiJvWjLyNTEIXBnuWXe5swz5jsSjdE"/>
</div>
<div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-high overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Close up profile picture of a female data scientist with neon light highlights on her face." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbse-_-RcaKAx7k_DnarigtWEYWCaVL-kwAjyaVhNRLsjXQlkgb5ClaQfIMcPvdyc7Kxt-X1qsLzJZIdFA9CwIMmAYKa8Mp2YOWok7vAxnGHkwfF2nOaJRaQmV1C4tD8JhtrmWYi-LJY-pao84Fx6SlKF2i0CMy11cAUqsYR0twoqCZtKuwaP-ibWbmnSAD6whyNU-dA5Xf47rlwsZA4h7HL1NRnKUzoyyL-wCZTg2j_6GYTNRrjdErYdjo0tSobxnhG3V1UqUznk"/>
</div>
<div className="w-8 h-8 rounded-full border-2 border-surface bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">+14 Analysts</div>
</div>
<button className="flex items-center gap-2 text-primary font-label-sm text-xs hover:gap-3 transition-all uppercase tracking-widest">
                                Deep Dive Meta-Report <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
</div>
{/* Vertical Sentiment Dial */}
<div className="md:col-span-4 glass-card rounded-2xl p-6 flex flex-col items-center justify-center space-y-6">
<div className="text-center">
<h3 className="font-label-sm text-sm text-on-surface-variant uppercase tracking-widest mb-4">Sentiment Entropy</h3>
<div className="relative w-40 h-40">
{/* Circular SVG Dial Placeholder */}
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
<circle cx="50" cy="50" fill="transparent" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="8"></circle>
<circle className="drop-shadow-[0_0_8px_#7c3aed]" cx="50" cy="50" fill="transparent" r="45" stroke="#7c3aed" strokeDasharray="282.7" strokeDashoffset="70" strokeWidth="8"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="font-display-xl text-3xl font-bold">78%</span>
<span className="font-label-sm text-[10px] text-primary">AGGRESSIVE</span>
</div>
</div>
</div>
<div className="w-full space-y-3">
<div className="flex justify-between items-center text-xs font-label-sm">
<span className="text-on-surface-variant">Social Velocity</span>
<span className="text-primary">+114%</span>
</div>
<div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
<div className="h-full bg-primary w-[114%]"></div>
</div>
<div className="flex justify-between items-center text-xs font-label-sm">
<span className="text-on-surface-variant">Inst. Interest</span>
<span className="text-secondary">+22%</span>
</div>
<div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
<div className="h-full bg-secondary w-1/4"></div>
</div>
</div>
</div>
{/* Velocity Ticker Rows */}
<div className="md:col-span-12 glass-card rounded-2xl overflow-hidden">
<div className="p-4 bg-white/5 flex items-center justify-between border-b border-white/5">
<h3 className="font-headline-md text-base px-2 uppercase tracking-tighter">Correlated Market Vectors</h3>
<div className="flex gap-2">
<button className="bg-surface p-1.5 rounded-lg border border-white/10 hover:border-primary/50 transition-colors">
<span className="material-symbols-outlined text-lg">filter_list</span>
</button>
<button className="bg-surface p-1.5 rounded-lg border border-white/10 hover:border-primary/50 transition-colors">
<span className="material-symbols-outlined text-lg">download</span>
</button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left font-label-sm text-sm border-collapse">
<thead>
<tr className="text-on-surface-variant uppercase tracking-tighter border-b border-white/5">
<th className="px-6 py-4 font-medium">Trend Identifier</th>
<th className="px-6 py-4 font-medium">Velocity (24h)</th>
<th className="px-6 py-4 font-medium">Alpha Signal</th>
<th className="px-6 py-4 font-medium">Trajectory</th>
<th className="px-6 py-4 font-medium text-right">Liquidity Flux</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5">
<tr className="hover:bg-white/5 transition-colors cursor-pointer group">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center font-bold text-primary">LQ</div>
<div>
<div className="text-on-surface font-medium">Liquid Cooling Infra</div>
<div className="text-[10px] text-outline">DATACENTER_EVO_04</div>
</div>
</div>
</td>
<td className="px-6 py-5 font-label-sm text-primary">+40.2%</td>
<td className="px-6 py-5">
<span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] border border-primary/20">BUY_STRONG</span>
</td>
<td className="px-6 py-5">
<svg className="sparkline-svg" height="24" width="80">
<path d="M0 20 L10 15 L20 18 L30 8 L40 12 L50 4 L60 10 L70 2 L80 5" fill="none" stroke="#d2bbff" strokeWidth="1.5"></path>
</svg>
</td>
<td className="px-6 py-5 text-right font-label-sm">$2.4B</td>
</tr>
<tr className="hover:bg-white/5 transition-colors cursor-pointer group">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-secondary/20 flex items-center justify-center font-bold text-secondary">QS</div>
<div>
<div className="text-on-surface font-medium">Quantum-Safe Encryption</div>
<div className="text-[10px] text-outline">SEC_PROTOCOL_X</div>
</div>
</div>
</td>
<td className="px-6 py-5 font-label-sm text-secondary">+18.5%</td>
<td className="px-6 py-5">
<span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-[10px] border border-secondary/20">ACCUMULATE</span>
</td>
<td className="px-6 py-5">
<svg className="sparkline-svg" height="24" width="80">
<path d="M0 15 L15 10 L30 14 L45 5 L60 8 L75 2" fill="none" stroke="#adc6ff" strokeWidth="1.5"></path>
</svg>
</td>
<td className="px-6 py-5 text-right font-label-sm">$890M</td>
</tr>
<tr className="hover:bg-white/5 transition-colors cursor-pointer group">
<td className="px-6 py-5">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded bg-tertiary/20 flex items-center justify-center font-bold text-tertiary">SB</div>
<div>
<div className="text-on-surface font-medium">Space-Based Solar</div>
<div className="text-[10px] text-outline">ENERGY_ORBIT_8</div>
</div>
</div>
</td>
<td className="px-6 py-5 font-label-sm text-tertiary">+8.2%</td>
<td className="px-6 py-5">
<span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded text-[10px] border border-tertiary/20">WATCH</span>
</td>
<td className="px-6 py-5">
<svg className="sparkline-svg" height="24" width="80">
<path d="M0 20 L20 18 L40 19 L60 15 L80 16" fill="none" stroke="#ffb784" strokeWidth="1.5"></path>
</svg>
</td>
<td className="px-6 py-5 text-right font-label-sm">$1.1B</td>
</tr>
</tbody>
</table>
</div>
</div>
{/* Bottom Masonry Cards */}
<div className="md:col-span-4 glass-card rounded-2xl p-6 flex flex-col gap-4">
<div className="flex items-center justify-between">
<h4 className="font-headline-md text-base uppercase">Sentiment Heatmap</h4>
<span className="material-symbols-outlined text-primary text-lg">psychology</span>
</div>
<div className="grid grid-cols-4 grid-rows-4 gap-2 h-40">
<div className="bg-primary/60 rounded"></div>
<div className="bg-primary/40 rounded"></div>
<div className="bg-primary/80 rounded"></div>
<div className="bg-primary/20 rounded"></div>
<div className="bg-primary/10 rounded"></div>
<div className="bg-secondary/40 rounded"></div>
<div className="bg-primary/50 rounded"></div>
<div className="bg-primary/90 rounded"></div>
<div className="bg-secondary/20 rounded"></div>
<div className="bg-secondary/10 rounded"></div>
<div className="bg-primary/30 rounded"></div>
<div className="bg-primary/70 rounded"></div>
<div className="bg-primary/40 rounded"></div>
<div className="bg-primary/10 rounded"></div>
<div className="bg-secondary/60 rounded"></div>
<div className="bg-primary/20 rounded"></div>
</div>
<p className="font-body-md text-xs text-on-surface-variant">Correlated sentiment clustering across 42,000 data nodes indicating a pivot towards decentralization.</p>
</div>
<div className="md:col-span-8 glass-card rounded-2xl p-6 relative overflow-hidden">
<div className="flex items-center justify-between mb-6">
<div>
<h4 className="font-headline-md text-base uppercase">Neural Prediction Model</h4>
<span className="font-label-sm text-[10px] text-outline">ITERATION: 08-GAMMA-9</span>
</div>
<div className="flex items-center gap-4">
<div className="flex items-center gap-1">
<div className="w-2 h-2 rounded-full bg-primary"></div>
<span className="font-label-sm text-[10px]">Projected</span>
</div>
<div className="flex items-center gap-1">
<div className="w-2 h-2 rounded-full bg-white/20"></div>
<span className="font-label-sm text-[10px]">Historical</span>
</div>
</div>
</div>
{/* Placeholder for large chart */}
<div className="w-full h-48 bg-white/5 rounded-xl border border-white/5 flex items-end p-2 gap-4">
<div className="flex-1 bg-white/10 h-1/2 rounded-t transition-all hover:bg-primary/40"></div>
<div className="flex-1 bg-white/10 h-2/3 rounded-t transition-all hover:bg-primary/40"></div>
<div className="flex-1 bg-white/10 h-1/3 rounded-t transition-all hover:bg-primary/40"></div>
<div className="flex-1 bg-white/10 h-1/2 rounded-t transition-all hover:bg-primary/40"></div>
<div className="flex-1 bg-white/10 h-3/4 rounded-t transition-all hover:bg-primary/40"></div>
<div className="flex-1 bg-primary/40 h-5/6 rounded-t animate-pulse"></div>
<div className="flex-1 bg-primary/60 h-full rounded-t animate-pulse"></div>
<div className="flex-1 bg-primary/80 h-[90%] rounded-t animate-pulse"></div>
</div>
</div>
</section>

      </div>
    </AppShell>
  );
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
