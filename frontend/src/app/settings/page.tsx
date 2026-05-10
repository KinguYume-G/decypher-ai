"use client";

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { LogOut, Settings2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function Page() {
  return <SettingsExperience />;

  return (
    <AppShell>
      <div className="flex-1 p-margin-desktop w-full max-w-[1600px] mx-auto space-y-8">
        {/* Content from Stitch */}
        
{/* Header Section */}
<section className="flex justify-between items-end">
<div>
<span className="font-label-sm text-primary uppercase tracking-[0.2em]">Infrastructure</span>
<h2 className="font-display-xl text-headline-lg text-on-surface mt-1">System Architecture</h2>
<p className="text-on-surface-variant mt-2 max-w-xl font-body-md">Configure core engine parameters, manage authentication matrices, and monitor computational throughput.</p>
</div>
<div className="flex gap-4">
<button className="px-6 py-2.5 rounded-lg border border-secondary text-secondary font-medium hover:bg-secondary/5 transition-all active:scale-95">Reboot Nodes</button>
<button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white font-medium shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:brightness-110 transition-all active:scale-95">Apply Global Changes</button>
</div>
</section>
{/* Top Row: Bento Grid */}
<div className="grid grid-cols-12 gap-6">
{/* API Configuration Matrix (8 columns) */}
<div className="col-span-12 lg:col-span-8 glass-panel p-6 rounded-xl relative overflow-hidden">
<div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none"></div>
<div className="flex justify-between items-center mb-8">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg" data-icon="vpn_key">vpn_key</span>
<h3 className="font-headline-md text-on-surface">API Key Matrix</h3>
</div>
<button className="font-label-sm text-primary flex items-center gap-2 hover:opacity-80 transition-opacity">
<span className="material-symbols-outlined text-sm" data-icon="add">add</span>
                        NEW INTEGRATION
                    </button>
</div>
<div className="space-y-4">
{/* OpenAI Row */}
<div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low border border-white/5">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded flex items-center justify-center bg-white/5 border border-white/10">
<span className="material-symbols-outlined text-on-surface" data-icon="bolt">bolt</span>
</div>
<div>
<p className="font-headline-md text-sm text-on-surface">OpenAI Neural Engine</p>
<p className="font-label-sm text-[10px] text-on-surface-variant">GPT-4-TURBO INTEGRATION</p>
</div>
</div>
<div className="flex items-center gap-4">
<div className="px-4 py-2 bg-black/40 rounded font-label-sm text-on-surface-variant tracking-widest flex items-center gap-3 border border-white/5">
<span>sk-•••••••••••••4981</span>
<span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary transition-colors" data-icon="visibility">visibility</span>
</div>
<span className="flex items-center gap-1.5 font-label-sm text-emerald-400">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                ACTIVE
                            </span>
</div>
</div>
{/* DeepSeek Row */}
<div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low border border-white/5">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded flex items-center justify-center bg-white/5 border border-white/10">
<span className="material-symbols-outlined text-on-surface" data-icon="psychology">psychology</span>
</div>
<div>
<p className="font-headline-md text-sm text-on-surface">DeepSeek Coder V2</p>
<p className="font-label-sm text-[10px] text-on-surface-variant">OPEN-SOURCE BACKEND</p>
</div>
</div>
<div className="flex items-center gap-4">
<div className="px-4 py-2 bg-black/40 rounded font-label-sm text-on-surface-variant tracking-widest flex items-center gap-3 border border-white/5">
<span>ds-•••••••••••••2100</span>
<span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary transition-colors" data-icon="visibility_off">visibility_off</span>
</div>
<span className="flex items-center gap-1.5 font-label-sm text-outline">
<span className="w-2 h-2 rounded-full bg-outline"></span>
                                STANDBY
                            </span>
</div>
</div>
{/* GitHub Row */}
<div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low border border-white/5">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded flex items-center justify-center bg-white/5 border border-white/10">
<span className="material-symbols-outlined text-on-surface" data-icon="code">code</span>
</div>
<div>
<p className="font-headline-md text-sm text-on-surface">GitHub Repositories</p>
<p className="font-label-sm text-[10px] text-on-surface-variant">OAUTH 2.0 PROTOCOL</p>
</div>
</div>
<div className="flex items-center gap-4">
<div className="px-4 py-2 bg-black/40 rounded font-label-sm text-on-surface-variant tracking-widest flex items-center gap-3 border border-white/5">
<span>gh-•••••••••••••3021</span>
<span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary transition-colors" data-icon="visibility">visibility</span>
</div>
<span className="flex items-center gap-1.5 font-label-sm text-emerald-400">
<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                SYNCED
                            </span>
</div>
</div>
</div>
</div>
{/* Billing & Usage (4 columns) */}
<div className="col-span-12 lg:col-span-4 glass-panel p-6 rounded-xl flex flex-col justify-between">
<div>
<div className="flex justify-between items-start mb-6">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-lg" data-icon="analytics">analytics</span>
<h3 className="font-headline-md text-on-surface">Usage Quota</h3>
</div>
<span className="font-label-sm bg-secondary/10 text-secondary px-2 py-1 rounded text-[10px]">TIER 3: ELITE</span>
</div>
<div className="space-y-6">
<div>
<div className="flex justify-between font-label-sm text-xs mb-2">
<span className="text-on-surface-variant">NEURAL TOKENS</span>
<span className="text-on-surface">7.2M / 10M</span>
</div>
<div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
<div className="h-full bg-gradient-to-r from-primary to-secondary w-[72%] shadow-[0_0_10px_rgba(173,198,255,0.4)]"></div>
</div>
</div>
<div>
<div className="flex justify-between font-label-sm text-xs mb-2">
<span className="text-on-surface-variant">SCRAPE QUERIES</span>
<span className="text-on-surface">1.4K / 5K</span>
</div>
<div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
<div className="h-full bg-secondary w-[28%]"></div>
</div>
</div>
</div>
</div>
<div className="mt-8 pt-6 border-t border-white/5">
<div className="flex items-center justify-between mb-4">
<span className="font-body-md text-on-surface-variant">Estimated Cost</span>
<span className="font-label-sm text-xl text-primary">$412.00 <span className="text-[10px] text-outline">USD</span></span>
</div>
<button className="w-full py-3 rounded-lg bg-surface-container-high border border-white/10 text-on-surface font-label-sm hover:bg-white/5 transition-colors">UPGRADE RESOURCE PLAN</button>
</div>
</div>
</div>
{/* Middle Row: Detailed Configuration Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{/* Engine Preferences Card */}
<div className="glass-panel p-6 rounded-xl flex flex-col">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-primary" data-icon="settings_input_component">settings_input_component</span>
<h4 className="font-headline-md text-lg">Engine Calibration</h4>
</div>
<div className="space-y-6 flex-1">
<div>
<div className="flex justify-between font-label-sm text-[10px] mb-4">
<span className="text-on-surface-variant">SCRAPING AGGRESSION</span>
<span className="text-primary">LEVEL 07</span>
</div>
<input className="w-full custom-range accent-primary" max="10" min="0" type="range" value="7"/>
<p className="text-[11px] text-outline mt-2 leading-relaxed italic">High intensity may trigger enhanced CAPTCHA detection systems on target nodes.</p>
</div>
<div className="flex items-center justify-between">
<div>
<p className="font-body-md text-on-surface">Neural Bypass</p>
<p className="text-xs text-on-surface-variant">Redirect through decentralized exit nodes</p>
</div>
<div className="w-12 h-6 bg-primary/20 border border-primary/40 rounded-full relative cursor-pointer">
<div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full shadow-[0_0_8px_#d2bbff]"></div>
</div>
</div>
<div className="flex items-center justify-between">
<div>
<p className="font-body-md text-on-surface">Auto-Rotation</p>
<p className="text-xs text-on-surface-variant">Rotate API keys upon rate-limiting</p>
</div>
<div className="w-12 h-6 bg-white/5 border border-white/10 rounded-full relative cursor-pointer">
<div className="absolute left-1 top-1 w-4 h-4 bg-outline rounded-full"></div>
</div>
</div>
</div>
</div>
{/* Visualization Card */}
<div className="glass-panel p-6 rounded-xl relative overflow-hidden flex flex-col">
<div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
<img className="w-full h-full object-cover grayscale brightness-50" data-alt="A sophisticated abstract technological background featuring glowing circuit-like lines and geometric patterns. The aesthetic is deep obsidian with electric blue and neon purple highlights, creating a cinematic cyber-premium atmosphere. Dynamic data flow effects suggest high-speed processing and computational power in a futuristic command center setting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIMF6XcvxHLwhJFLRGiQ5c4_eXRiwC7SCktX2ROA6fX-1zbOW0-3Lyz9k2UXG1y3DDZg7qQm1uOAQQr93QhkCOeNKdMBDZNYL6CdxH-a_q5R1xjAbVLseJEOhV5LFMnvhtr6sk4BmQO_H41owASJz1uys-VY35g0dskmnmvrJxlpi6y_OpVz9SPjNDpLzkZHMy0tBvLYfuP1LzapnN8V-eLKRCkSP_VYw24g6DW8wX4s9JaidQU6zg5yrfcUuaOCHcNLX4O2d4opY"/>
</div>
<div className="relative z-10 flex flex-col h-full">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-secondary" data-icon="radar">radar</span>
<h4 className="font-headline-md text-lg">Global Node Status</h4>
</div>
<div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
<div className="w-24 h-24 border-2 border-dashed border-secondary/30 rounded-full flex items-center justify-center ai-pulse">
<span className="material-symbols-outlined text-4xl text-secondary" data-icon="language">language</span>
</div>
<div>
<p className="font-label-sm text-secondary tracking-widest">NETWORK STABILITY: 99.98%</p>
<p className="text-xs text-on-surface-variant mt-1">128 Active nodes across 4 regions</p>
</div>
</div>
</div>
</div>
{/* Security Log Card */}
<div className="glass-panel p-6 rounded-xl flex flex-col">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-tertiary" data-icon="security">security</span>
<h4 className="font-headline-md text-lg">Infrastructure Logs</h4>
</div>
<div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[220px]">
<div className="font-label-sm text-[10px] space-y-1 p-2 rounded bg-black/30 border-l-2 border-tertiary">
<p className="text-tertiary">[14:22:01] SEC_ALRT: SSH Attempt Filtered</p>
<p className="text-outline">SOURCE: 192.168.1.104 | STATUS: BLOCKED</p>
</div>
<div className="font-label-sm text-[10px] space-y-1 p-2 rounded bg-black/10 border-l-2 border-outline">
<p className="text-on-surface">[14:18:55] SYS_INFO: Scraper node-4 rotated</p>
<p className="text-outline">ID: NODE_USA_WEST_2 | LATENCY: 12ms</p>
</div>
<div className="font-label-sm text-[10px] space-y-1 p-2 rounded bg-black/10 border-l-2 border-outline">
<p className="text-on-surface">[14:15:22] SYS_INFO: API Cache Cleared</p>
<p className="text-outline">PURGED: 4.2GB | RECLAIMED: 98.1%</p>
</div>
<div className="font-label-sm text-[10px] space-y-1 p-2 rounded bg-black/30 border-l-2 border-primary">
<p className="text-primary">[14:02:11] AI_PROC: Model hand-off complete</p>
<p className="text-outline">GPT-4-TURBO -&gt; DEEPSEEK_V2_PRO</p>
</div>
</div>
</div>
</div>
{/* Footer Metric Bar */}
<footer className="glass-panel px-8 py-4 rounded-xl flex flex-wrap gap-12 items-center">
<div className="flex items-center gap-4">
<div className="p-2 rounded bg-primary/10">
<span className="material-symbols-outlined text-primary text-xl" data-icon="memory">memory</span>
</div>
<div>
<p className="font-label-sm text-[10px] text-on-surface-variant uppercase">CPU Core Load</p>
<p className="font-headline-md text-lg text-on-surface leading-tight">14.2% <span className="text-xs text-emerald-400">Stable</span></p>
</div>
</div>
<div className="flex items-center gap-4 border-l border-white/10 pl-12">
<div className="p-2 rounded bg-secondary/10">
<span className="material-symbols-outlined text-secondary text-xl" data-icon="database">database</span>
</div>
<div>
<p className="font-label-sm text-[10px] text-on-surface-variant uppercase">Vector DB Latency</p>
<p className="font-headline-md text-lg text-on-surface leading-tight">4.2ms <span className="text-xs text-emerald-400">-0.2ms</span></p>
</div>
</div>
<div className="flex items-center gap-4 border-l border-white/10 pl-12">
<div className="p-2 rounded bg-tertiary/10">
<span className="material-symbols-outlined text-tertiary text-xl" data-icon="cloud_done">cloud_done</span>
</div>
<div>
<p className="font-label-sm text-[10px] text-on-surface-variant uppercase">Uptime Score</p>
<p className="font-headline-md text-lg text-on-surface leading-tight">99.998%</p>
</div>
</div>
<div className="ml-auto flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
<span className="font-label-sm text-[10px] text-outline tracking-widest">SYSTEMS NOMINAL // NODE: PHX-04</span>
</div>
</footer>

      </div>
    </AppShell>
  );
}

function SettingsExperience() {
  const { user, logout } = useAuth();

  return (
    <AppShell>
      <main className="w-full px-5 py-6 md:px-margin-desktop md:py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <section className="border-b border-white/5 pb-6">
            <Badge tone="primary">Workspace settings</Badge>
            <h1 className="mt-3 font-display-xl text-3xl font-black text-on-surface md:text-4xl">
              Settings
            </h1>
            <p className="mt-3 max-w-2xl text-on-surface-variant">
              Keep this page operational and quiet. Advanced API key management should only appear once those
              features are wired to the backend.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="glass-panel rounded-xl p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Settings2 size={22} />
              </div>
              <h2 className="font-headline-md text-xl text-on-surface">Account</h2>
              <div className="mt-5 space-y-3 text-sm">
                <Row label="Username" value={user?.username ?? "Guest"} />
                <Row label="Email" value={user?.email ?? "Not loaded"} />
                <Row label="Session" value="JWT bearer token" />
              </div>
              <Button variant="ghost" onClick={logout} className="mt-6">
                <LogOut size={16} />
                Log out
              </Button>
            </div>

            <div className="glass-panel rounded-xl p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <ShieldCheck size={22} />
              </div>
              <h2 className="font-headline-md text-xl text-on-surface">System status</h2>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                Auth and task APIs are active. Opportunities and chat are now exposed through backend routes.
                Provider-specific API key controls should be added after backend persistence is designed.
              </p>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-semibold text-on-surface">{value}</span>
    </div>
  );
}
