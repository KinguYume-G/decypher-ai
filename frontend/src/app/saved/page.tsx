"use client";

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';
import { OpportunityCard } from '@/components/dashboard/OpportunityCard';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useOpportunities } from '@/hooks/useOpportunities';

export default function Page() {
  return <OpportunitiesExperience />;

  return (
    <AppShell>
      <div className="flex-1 p-margin-desktop w-full max-w-[1600px] mx-auto space-y-8">
        {/* Content from Stitch */}
        
<div className="max-w-container-max mx-auto space-y-gutter">
{/* Header & Stats */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Saved Opportunities</h2>
<p className="text-on-surface-variant font-body-md max-w-xl">Centralized intelligence dossier of high-confidence signals extracted from the deep engine. Review, prioritize, and execute deeper analysis.</p>
</div>
<div className="flex gap-4">
<div className="glass-panel rounded-xl px-6 py-4 flex flex-col items-center">
<span className="font-label-sm text-primary mb-1">TOTAL NODES</span>
<span className="font-headline-md text-on-surface">142</span>
</div>
<div className="glass-panel rounded-xl px-6 py-4 flex flex-col items-center">
<span className="font-label-sm text-tertiary mb-1">HIGH PRIORITY</span>
<span className="font-headline-md text-on-surface">28</span>
</div>
</div>
</div>
{/* Controls Bar */}
<div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-xl">
<div className="flex flex-wrap items-center gap-2">
<button className="px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 font-label-sm">ALL SIGNALS</button>
<button className="px-4 py-2 rounded-full bg-white/5 text-on-surface-variant hover:bg-white/10 transition-colors font-label-sm">CRITICAL ONLY</button>
<button className="px-4 py-2 rounded-full bg-white/5 text-on-surface-variant hover:bg-white/10 transition-colors font-label-sm">TECH STACK</button>
<button className="px-4 py-2 rounded-full bg-white/5 text-on-surface-variant hover:bg-white/10 transition-colors font-label-sm">ARBITRAGE</button>
<div className="w-px h-6 bg-white/10 mx-2"></div>
<button className="flex items-center gap-2 px-3 py-1 rounded hover:bg-white/5 text-on-surface-variant transition-colors">
<span className="material-symbols-outlined text-[20px]" data-icon="filter_list">filter_list</span>
<span className="font-label-sm">FILTERS</span>
</button>
</div>
<div className="flex items-center gap-4 bg-background border border-white/10 rounded-lg px-4 py-2 w-full md:w-auto">
<span className="material-symbols-outlined text-outline" data-icon="search">search</span>
<input className="bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline w-full md:w-64 font-body-md" placeholder="Search dossier..." type="text"/>
</div>
</div>
{/* Opportunity Dossier Table/List */}
<div className="glass-panel rounded-xl overflow-hidden shadow-2xl shadow-black/40">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-white/5 border-b border-white/10">
<th className="px-6 py-4 font-label-sm text-outline tracking-widest uppercase">Opportunity Node</th>
<th className="px-6 py-4 font-label-sm text-outline tracking-widest uppercase">Confidence</th>
<th className="px-6 py-4 font-label-sm text-outline tracking-widest uppercase">Categories</th>
<th className="px-6 py-4 font-label-sm text-outline tracking-widest uppercase">Detected</th>
<th className="px-6 py-4 font-label-sm text-outline tracking-widest uppercase text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5">
{/* Entry 1 */}
<tr className="hover:bg-white/5 transition-colors group">
<td className="px-6 py-6">
<div className="flex items-center gap-4">
<div className="h-12 w-12 rounded bg-surface-container-high border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
<span className="material-symbols-outlined text-primary" data-icon="hub">hub</span>
</div>
<div>
<div className="font-headline-md text-[18px] text-on-surface mb-0.5">Quantum Ledger Optimization</div>
<div className="text-on-surface-variant text-sm font-body-md">Ref. #QL-9428 • L2 Protocol Expansion</div>
</div>
</div>
</td>
<td className="px-6 py-6">
<div className="flex items-center gap-3">
<div className="relative h-10 w-10 flex items-center justify-center">
<svg className="h-full w-full rotate-[-90deg]">
<circle cx="20" cy="20" fill="transparent" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="3"></circle>
<circle className="drop-shadow-[0_0_8px_rgba(210,187,255,0.6)]" cx="20" cy="20" fill="transparent" r="16" stroke="#d2bbff" strokeDasharray="100" strokeDashoffset="8" strokeWidth="3"></circle>
</svg>
<span className="absolute text-[10px] font-bold font-label-sm">92%</span>
</div>
<span className="font-label-sm text-primary">CRITICAL</span>
</div>
</td>
<td className="px-6 py-6">
<div className="flex gap-2">
<span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-label-sm text-primary">BLOCKCHAIN</span>
<span className="px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20 text-[10px] font-label-sm text-secondary">FINTECH</span>
</div>
</td>
<td className="px-6 py-6">
<div className="text-on-surface font-body-md">2.4h ago</div>
<div className="text-outline text-xs">Lat: 40.7128 | Lon: -74.0060</div>
</td>
<td className="px-6 py-6 text-right">
<Link href="/chat" className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface hover:bg-primary hover:text-on-primary transition-all duration-300 ai-pulse-glow group/btn">
<span className="font-label-sm">DEEP DIVE</span>
<span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</Link>
</td>
</tr>
{/* Entry 2 */}
<tr className="hover:bg-white/5 transition-colors group">
<td className="px-6 py-6">
<div className="flex items-center gap-4">
<div className="h-12 w-12 rounded bg-surface-container-high border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
<span className="material-symbols-outlined text-tertiary" data-icon="biotech">biotech</span>
</div>
<div>
<div className="font-headline-md text-[18px] text-on-surface mb-0.5">Synthetic Bio-Neural Interface</div>
<div className="text-on-surface-variant text-sm font-body-md">Ref. #SB-1022 • MedTech Series A</div>
</div>
</div>
</td>
<td className="px-6 py-6">
<div className="flex items-center gap-3">
<div className="relative h-10 w-10 flex items-center justify-center">
<svg className="h-full w-full rotate-[-90deg]">
<circle cx="20" cy="20" fill="transparent" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="3"></circle>
<circle className="drop-shadow-[0_0_8px_rgba(255,183,132,0.6)]" cx="20" cy="20" fill="transparent" r="16" stroke="#ffb784" strokeDasharray="100" strokeDashoffset="25" strokeWidth="3"></circle>
</svg>
<span className="absolute text-[10px] font-bold font-label-sm">75%</span>
</div>
<span className="font-label-sm text-tertiary">STABLE</span>
</div>
</td>
<td className="px-6 py-6">
<div className="flex gap-2">
<span className="px-2 py-0.5 rounded bg-tertiary/10 border border-tertiary/20 text-[10px] font-label-sm text-tertiary">BIOTECH</span>
<span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-label-sm text-on-surface-variant">AI-DRIVEN</span>
</div>
</td>
<td className="px-6 py-6">
<div className="text-on-surface font-body-md">5.1h ago</div>
<div className="text-outline text-xs">Remote Capture Node-7</div>
</td>
<td className="px-6 py-6 text-right">
<Link href="/chat" className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface hover:bg-primary hover:text-on-primary transition-all duration-300 ai-pulse-glow group/btn">
<span className="font-label-sm">DEEP DIVE</span>
<span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</Link>
</td>
</tr>
{/* Entry 3 */}
<tr className="hover:bg-white/5 transition-colors group">
<td className="px-6 py-6">
<div className="flex items-center gap-4">
<div className="h-12 w-12 rounded bg-surface-container-high border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
<span className="material-symbols-outlined text-secondary" data-icon="bolt">bolt</span>
</div>
<div>
<div className="font-headline-md text-[18px] text-on-surface mb-0.5">Fusion Grid Management</div>
<div className="text-on-surface-variant text-sm font-body-md">Ref. #FG-4402 • Infrastructure Arbitrage</div>
</div>
</div>
</td>
<td className="px-6 py-6">
<div className="flex items-center gap-3">
<div className="relative h-10 w-10 flex items-center justify-center">
<svg className="h-full w-full rotate-[-90deg]">
<circle cx="20" cy="20" fill="transparent" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="3"></circle>
<circle className="drop-shadow-[0_0_8px_rgba(173,198,255,0.6)]" cx="20" cy="20" fill="transparent" r="16" stroke="#adc6ff" strokeDasharray="100" strokeDashoffset="12" strokeWidth="3"></circle>
</svg>
<span className="absolute text-[10px] font-bold font-label-sm">88%</span>
</div>
<span className="font-label-sm text-secondary">OPTIMAL</span>
</div>
</td>
<td className="px-6 py-6">
<div className="flex gap-2">
<span className="px-2 py-0.5 rounded bg-secondary/10 border border-secondary/20 text-[10px] font-label-sm text-secondary">ENERGY</span>
<span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-label-sm text-on-surface-variant">GOV-SEC</span>
</div>
</td>
<td className="px-6 py-6">
<div className="text-on-surface font-body-md">12.8h ago</div>
<div className="text-outline text-xs">Sector Alpha-9 Cluster</div>
</td>
<td className="px-6 py-6 text-right">
<Link href="/chat" className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface hover:bg-primary hover:text-on-primary transition-all duration-300 ai-pulse-glow group/btn">
<span className="font-label-sm">DEEP DIVE</span>
<span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</Link>
</td>
</tr>
{/* Entry 4 */}
<tr className="hover:bg-white/5 transition-colors group">
<td className="px-6 py-6">
<div className="flex items-center gap-4">
<div className="h-12 w-12 rounded bg-surface-container-high border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
<span className="material-symbols-outlined text-primary" data-icon="memory">memory</span>
</div>
<div>
<div className="font-headline-md text-[18px] text-on-surface mb-0.5">Neuromorphic Compute Farm</div>
<div className="text-on-surface-variant text-sm font-body-md">Ref. #NC-8119 • GPU Scarcity Play</div>
</div>
</div>
</td>
<td className="px-6 py-6">
<div className="flex items-center gap-3">
<div className="relative h-10 w-10 flex items-center justify-center">
<svg className="h-full w-full rotate-[-90deg]">
<circle cx="20" cy="20" fill="transparent" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="3"></circle>
<circle className="drop-shadow-[0_0_8px_rgba(210,187,255,0.6)]" cx="20" cy="20" fill="transparent" r="16" stroke="#d2bbff" strokeDasharray="100" strokeDashoffset="40" strokeWidth="3"></circle>
</svg>
<span className="absolute text-[10px] font-bold font-label-sm">60%</span>
</div>
<span className="font-label-sm text-outline">EMERGING</span>
</div>
</td>
<td className="px-6 py-6">
<div className="flex gap-2">
<span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-label-sm text-primary">HARDWARE</span>
<span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-label-sm text-on-surface-variant">SUPPLY-CHAIN</span>
</div>
</td>
<td className="px-6 py-6">
<div className="text-on-surface font-body-md">1d ago</div>
<div className="text-outline text-xs">Pacific RIM Telemetry</div>
</td>
<td className="px-6 py-6 text-right">
<Link href="/chat" className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface hover:bg-primary hover:text-on-primary transition-all duration-300 ai-pulse-glow group/btn">
<span className="font-label-sm">DEEP DIVE</span>
<span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
</Link>
</td>
</tr>
</tbody>
</table>
{/* Dossier Footer */}
<div className="bg-surface-container-low px-6 py-4 border-t border-white/10 flex items-center justify-between">
<div className="text-outline font-label-sm">SHOWING 4 OF 142 ENTRIES</div>
<div className="flex gap-2">
<button className="p-2 glass-panel rounded hover:bg-white/10 transition-colors">
<span className="material-symbols-outlined text-on-surface" data-icon="chevron_left">chevron_left</span>
</button>
<button className="p-2 glass-panel rounded bg-primary text-on-primary">
<span className="font-label-sm px-2">1</span>
</button>
<button className="p-2 glass-panel rounded hover:bg-white/10 transition-colors">
<span className="font-label-sm px-2">2</span>
</button>
<button className="p-2 glass-panel rounded hover:bg-white/10 transition-colors">
<span className="font-label-sm px-2">3</span>
</button>
<button className="p-2 glass-panel rounded hover:bg-white/10 transition-colors">
<span className="material-symbols-outlined text-on-surface" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Secondary Dossier Sections: Bento-Grid style details */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
{/* Global Hotspots */}
<div className="glass-panel rounded-xl p-6 md:col-span-2">
<div className="flex items-center justify-between mb-6">
<h3 className="font-headline-md text-on-surface">Intelligence Hotspots</h3>
<span className="material-symbols-outlined text-outline" data-icon="public">public</span>
</div>
<div className="aspect-video w-full rounded-lg bg-surface-container-highest relative overflow-hidden">
<img className="w-full h-full object-cover opacity-50" data-alt="A sophisticated digital world map glowing with neon violet and electric blue data points indicating intelligence clusters. The map is displayed on a dark glass interface with microscopic grid lines and floating data callouts, creating a high-tech command center visualization. Soft ambient light illuminates the edges of the continents against a deep obsidian background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBAQ0EAbtueBo6qy2Km8JPlk4TglXWHLPx8kR9gwEBEeRXeRBC-w-rekcKRv8J6-ZAZj-eAhYOM3lSzRAKaWhp0kHIFdr0c1Bg4mB5BCZJrDq9g2Jt4yWBTZdFdKeR6kZhAzsyCOyXUA9oNmdh9ihFbrxW2CSUvpQlfigAebLc7faq_M5CAC8w_ftWU6Kq-q8XxZGe_N1fQg_R60Rq9kgA3aG1Dm5XwAV3b7Q8Xemq4gjq3aHtt_qQFf1mXu1D_6ut_OFbFsWSWwM"/>
<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
{/* Map Overlay Markers */}
<div className="absolute top-1/4 left-1/3 h-3 w-3 bg-primary rounded-full animate-ping"></div>
<div className="absolute top-1/4 left-1/3 h-2 w-2 bg-primary rounded-full"></div>
<div className="absolute bottom-1/3 right-1/4 h-3 w-3 bg-secondary rounded-full animate-ping"></div>
<div className="absolute bottom-1/3 right-1/4 h-2 w-2 bg-secondary rounded-full"></div>
</div>
</div>
{/* Rapid Analysis Feed */}
<div className="glass-panel rounded-xl p-6 flex flex-col">
<h3 className="font-headline-md text-on-surface mb-6">Live Stream Analysis</h3>
<div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
<div className="p-3 rounded bg-white/5 border-l-2 border-primary">
<div className="font-label-sm text-primary mb-1">SIGNAL ACQUIRED</div>
<div className="text-sm font-body-md text-on-surface">Satellite array detected shift in energy consumption in Zurich sector.</div>
<div className="text-[10px] text-outline mt-1 uppercase">T-minus 04:22</div>
</div>
<div className="p-3 rounded bg-white/5 border-l-2 border-secondary">
<div className="font-label-sm text-secondary mb-1">CORRELATION SUCCESS</div>
<div className="text-sm font-body-md text-on-surface">Matching QL-9428 with recent venture capital liquidity event.</div>
<div className="text-[10px] text-outline mt-1 uppercase">T-minus 12:45</div>
</div>
<div className="p-3 rounded bg-white/5 border-l-2 border-outline">
<div className="font-label-sm text-outline mb-1">NODE UPDATE</div>
<div className="text-sm font-body-md text-on-surface">SB-1022 technical whitepaper has been decrypted and indexed.</div>
<div className="text-[10px] text-outline mt-1 uppercase">T-minus 21:00</div>
</div>
</div>
<button className="mt-auto w-full py-3 text-center text-label-sm text-primary hover:bg-primary/10 rounded transition-colors uppercase tracking-widest">Connect to live stream</button>
</div>
</div>
</div>

      </div>
    </AppShell>
  );
}

function OpportunitiesExperience() {
  const { opportunities, loading } = useOpportunities({ limit: 50 });
  const critical = opportunities.filter((item) => item.score_total >= 8).length;

  return (
    <AppShell>
      <main className="w-full px-5 py-6 md:px-margin-desktop md:py-8">
        <div className="mx-auto max-w-[1400px] space-y-8">
          <section className="flex flex-col justify-between gap-5 border-b border-white/5 pb-6 md:flex-row md:items-end">
            <div>
              <Badge tone="primary">Opportunity pipeline</Badge>
              <h1 className="mt-3 font-display-xl text-3xl font-black text-on-surface md:text-4xl">
                Opportunities
              </h1>
              <p className="mt-3 max-w-2xl text-on-surface-variant">
                Review AI-generated opportunities from your monitoring tasks. Open a deep dive only when
                the signal is worth validating.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Total" value={opportunities.length} />
              <MiniStat label="High score" value={critical} />
            </div>
          </section>

          {loading ? (
            <div className="glass-panel flex min-h-[280px] items-center justify-center rounded-xl">
              <LoadingSpinner />
            </div>
          ) : opportunities.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          ) : (
            <div className="glass-panel flex min-h-[280px] flex-col items-center justify-center rounded-xl p-8 text-center">
              <h2 className="font-headline-md text-xl text-on-surface">No opportunities yet</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-on-surface-variant">
                Create and run a monitoring task first. Results from the analysis pipeline will show here.
              </p>
              <Link href="/tasks" className="mt-5 text-sm font-semibold text-primary hover:underline">
                Go to tasks
              </Link>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-panel rounded-xl px-5 py-4 text-center">
      <div className="font-label-sm text-[10px] uppercase tracking-widest text-outline">{label}</div>
      <div className="mt-1 font-headline-md text-2xl text-on-surface">{value}</div>
    </div>
  );
}
