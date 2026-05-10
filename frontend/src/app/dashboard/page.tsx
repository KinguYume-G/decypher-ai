"use client";

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';
import { Activity, ArrowRight, Sparkles, Target } from 'lucide-react';
import { CreateTaskModal } from '@/components/dashboard/CreateTaskModal';
import { OpportunityCard } from '@/components/dashboard/OpportunityCard';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useTasks } from '@/hooks/useTasks';

export default function DashboardPage() {
  return <DashboardExperience />;

  return (
    <AppShell>
      {/* TopAppBar Component */}
      <header className="flex justify-between items-center w-full px-margin-desktop h-16 z-40 sticky top-0 bg-surface/60 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-8">
          <h1 className="font-display-xl text-headline-md font-bold text-primary tracking-tight">Opportunity Feed</h1>
          <div className="hidden md:flex items-center gap-6">
            <a className="text-primary font-bold border-b-2 border-primary py-4 text-sm" href="#">Real-time Feed</a>
            <a className="text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 px-3 py-1 rounded-lg text-sm" href="/market">Emerging Tech</a>
            <a className="text-on-surface-variant font-medium hover:bg-white/5 transition-colors duration-200 px-3 py-1 rounded-lg text-sm" href="/market">Market Shifts</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input className="w-full bg-surface-container-low border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:border-primary outline-none transition-all" placeholder="Search insights..." type="text" />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-white/5 transition-colors duration-200">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-white/5 transition-colors duration-200">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {/* Page Canvas */}
      <div className="p-10 mx-auto w-full">
        {/* Hero Insight Section (Bento Top) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          <div className="md:col-span-8 glass-card rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] group-hover:bg-primary/30 transition-all duration-500"></div>
            <div className="flex flex-col h-full justify-between relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-label-sm uppercase tracking-wider border border-primary/30">Priority Opportunity</span>
                  <span className="flex items-center gap-1 text-on-surface-variant text-xs">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    2 minutes ago
                  </span>
                </div>
                <h2 className="font-display-xl text-headline-lg text-white mb-4">AI Model Compression via Spiking Neural Networks (SNNs)</h2>
                <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
                  A surge in GitHub repositories and arXiv papers indicates a pivot towards neuromorphic computing for edge deployment. Our engine identifies a 40% increase in developer interest within the last 72 hours.
                </p>
              </div>
              <div className="flex items-center gap-6 mt-10">
                <Link href="/chat" className="bg-gradient-to-r from-primary to-secondary text-on-primary px-8 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 text-center flex items-center justify-center">Analyze Deeply</Link>
                <button className="text-primary font-bold flex items-center gap-2 hover:translate-x-1 transition-transform">
                  View Technical Graph
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32 mb-4 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-white/10" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-primary drop-shadow-[0_0_8px_rgba(210,187,255,0.6)]" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.4" strokeDashoffset="36.4" strokeWidth="8"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-display-xl font-black text-white">91%</span>
                <span className="text-[10px] font-label-sm text-on-surface-variant">CONFIDENCE</span>
              </div>
            </div>
            <h3 className="font-headline-md text-white mb-2">High Impact Forecast</h3>
            <p className="text-on-surface-variant text-sm px-4">Market sentiment aligns with technological feasibility. Recommended action: Aggressive Monitoring.</p>
          </div>
        </div>

        {/* Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Reddit Source */}
          <div className="glass-card rounded-2xl p-6 flex flex-col h-full group hover:border-primary/40 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
                <img className="w-4 h-4" alt="Reddit" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFScGNoA3L5pQRhb2rJZPHvP3biC8o1eDcdB5amgOdjSCTdlULKiJkmPvegIpF5qs-dOo2h4zo63vxm2V3QIvbUueQgWNMCELEGWy9EGSyJlACukO3nC-oNffR9jb9hvv9Uj-asyEuEEID0TSzWPnsKBdcTjIeI0VLWFLU00WcpbXtHCfarhWyvMxGEVanWREmpGdDZAnLG81S6ROfIOhEcJmqfHdVMC5yFTn00apX0f1awBzGCfl-lu5ETlfcD73ECk0PVy_SNp8"/>
                <span className="text-[10px] font-label-sm text-red-400">REDDIT /R/MACHINELEARNING</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center bg-primary/5">
                <span className="text-xs font-bold text-primary">82%</span>
              </div>
            </div>
            <h4 className="font-headline-md text-white mb-3 group-hover:text-primary transition-colors">Decentralized LLM Training Swarms</h4>
            <p className="text-on-surface-variant text-sm mb-8 line-clamp-3">
              Growing discussion around P2P orchestration for large-scale training. AI summary: Significant movement toward bypassing centralized compute clusters via distributed latent space optimization.
            </p>
            <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">bookmark</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-error/20 hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <Link href="/chat" className="text-[10px] font-label-sm uppercase tracking-widest text-primary border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-center flex items-center justify-center">Analyze Deeply</Link>
            </div>
            <span className="text-[10px] text-outline mt-3 block text-right italic">Detected 14h ago</span>
          </div>

          {/* Card 2: GitHub Source */}
          <div className="glass-card rounded-2xl p-6 flex flex-col h-full group hover:border-primary/40 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/10 border border-slate-100/30">
                <span className="material-symbols-outlined text-sm text-slate-100">terminal</span>
                <span className="text-[10px] font-label-sm text-slate-100 uppercase">GITHUB / OPEN_SOURCE</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center bg-primary/5">
                <span className="text-xs font-bold text-primary">94%</span>
              </div>
            </div>
            <h4 className="font-headline-md text-white mb-3 group-hover:text-primary transition-colors">Project 'Ouroboros' Self-Evolving Code</h4>
            <p className="text-on-surface-variant text-sm mb-8 line-clamp-3">
              A repository gaining 2k stars in 4 hours. Uses recursive feedback loops to refactor its own core engine. AI summary: A breakthrough in autonomous optimization that could redefine DevOps.
            </p>
            <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">bookmark</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-error/20 hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <Link href="/chat" className="text-[10px] font-label-sm uppercase tracking-widest text-primary border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-center flex items-center justify-center">Analyze Deeply</Link>
            </div>
            <span className="text-[10px] text-outline mt-3 block text-right italic">Detected 5h ago</span>
          </div>

          {/* Card 3: Hacker News Source */}
          <div className="glass-card rounded-2xl p-6 flex flex-col h-full group hover:border-primary/40 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30">
                <span className="text-[10px] font-label-sm text-orange-400">HACKER NEWS</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center bg-primary/5">
                <span className="text-xs font-bold text-primary">76%</span>
              </div>
            </div>
            <h4 className="font-headline-md text-white mb-3 group-hover:text-primary transition-colors">Post-SaaS: The Rise of Vertical AI Agents</h4>
            <p className="text-on-surface-variant text-sm mb-8 line-clamp-3">
              Top-tier discussion on the obsolescence of generic software in favor of specialized, task-specific intelligence agents. AI summary: Market transition from "tooling" to "execution" services.
            </p>
            <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">bookmark</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-error/20 hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <Link href="/chat" className="text-[10px] font-label-sm uppercase tracking-widest text-primary border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-center flex items-center justify-center">Analyze Deeply</Link>
            </div>
            <span className="text-[10px] text-outline mt-3 block text-right italic">Detected 1d ago</span>
          </div>

          {/* Featured Image Bento Item */}
          <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden relative min-h-[300px] flex items-end">
            <img className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity" alt="Abstract flow" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2YQzf5mQvK3QnDEv_IQcSgGvqJSJbgF6F_87DJ1gTjD0rw1UhTJRjxJH_kFznRDElGbDG7RjdinVLfieUL8hhQES2DursJ2opDiaLzwzYg7JbgqKrmytWHcbHEyqVa5j2058RLqxp0TsE3TnpPfWKGCPfX3zxyE6N4V3XEPBJZrh8N8sE3Xl-vL9Kv4pnZlV6cK8292Spj3Wydu8uDfPpmOgxKbLR0xu8OUHEGgTpRAqzWLcRpbxs5OZFSkIQmyGjEKdy-K0JIfU"/>
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
            <div className="relative p-8 w-full flex justify-between items-end z-10">
              <div className="max-w-md">
                <h3 className="font-headline-lg text-white mb-2">Computational Sovereignty</h3>
                <p className="text-on-surface-variant">Global infrastructure is moving toward localized AI nodes. This macro trend currently shows high investment correlation across EU markets.</p>
              </div>
              <div className="ai-pulse-glow mr-4"></div>
            </div>
          </div>

          {/* Stats Bento Item */}
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-transparent">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">monitoring</span>
              <span className="text-xs font-label-sm text-primary uppercase">Engine Status</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Sources Scanned</span>
                <span className="text-sm font-bold text-white">4,291</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-3/4"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Signals Processed</span>
                <span className="text-sm font-bold text-white">12.8M</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-secondary h-full w-1/2"></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Active Forecasts</span>
                <span className="text-sm font-bold text-white">142</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual FAB (Only for main screens) */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_0_20px_rgba(210,187,255,0.4)] hover:scale-110 active:scale-90 transition-all group">
          <span className="material-symbols-outlined transition-transform group-hover:rotate-90">settings_input_component</span>
        </button>
      </div>
    </AppShell>
  );
}

function DashboardExperience() {
  const { tasks, loading: tasksLoading, createTask, runTask, deleteTask } = useTasks();
  const { opportunities, loading: oppLoading } = useOpportunities({ limit: 6 });
  const activeTasks = tasks.filter((task) => task.is_active).length;
  const runningTasks = tasks.filter((task) => task.status === 'running').length;
  const topOpportunity = opportunities[0];

  return (
    <AppShell>
      <main className="w-full px-5 py-6 md:px-margin-desktop md:py-8">
        <div className="mx-auto max-w-[1400px] space-y-8">
          <section className="flex flex-col justify-between gap-5 border-b border-white/5 pb-6 lg:flex-row lg:items-end">
            <div>
              <Badge tone="primary">Workspace overview</Badge>
              <h1 className="mt-3 font-display-xl text-3xl font-black text-on-surface md:text-4xl">
                Opportunity command center
              </h1>
              <p className="mt-3 max-w-2xl text-on-surface-variant">
                Create focused monitoring tasks, run analysis, and deep-dive only into the opportunities
                that look worth validating.
              </p>
            </div>
            <CreateTaskModal onCreate={createTask} />
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <Stat icon={Target} label="Active tasks" value={String(activeTasks)} />
            <Stat icon={Sparkles} label="Opportunities" value={String(opportunities.length)} />
            <Stat icon={Activity} label="Running now" value={String(runningTasks)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-xl text-on-surface">Latest opportunities</h2>
                <Link href="/saved" className="text-sm font-semibold text-primary hover:underline">
                  View all
                </Link>
              </div>

              {oppLoading ? (
                <EmptyState loading title="Loading opportunities" />
              ) : opportunities.length ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {opportunities.map((opportunity) => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No opportunities yet"
                  body="Create a task, run it, and the AI-generated opportunities will appear here."
                  action={
                    <Link href="/tasks">
                      <Button>Go to tasks</Button>
                    </Link>
                  }
                />
              )}
            </div>

            <aside className="space-y-4">
              <div className="glass-panel rounded-xl p-5">
                <h2 className="font-headline-md text-xl text-on-surface">Recommended next step</h2>
                {topOpportunity ? (
                  <>
                    <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                      Start a deep dive on the highest-ranked opportunity and turn it into a validation plan.
                    </p>
                    <Link
                      href={`/chat?opportunityId=${topOpportunity.id}`}
                      className="mt-5 inline-flex w-full items-center justify-between rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/15"
                    >
                      Analyze top opportunity
                      <ArrowRight size={16} />
                    </Link>
                  </>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                    Your first useful step is to create one narrow monitoring task. Avoid broad keywords.
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-md text-xl text-on-surface">Tasks</h2>
                  <Link href="/tasks" className="text-sm font-semibold text-primary hover:underline">
                    Manage
                  </Link>
                </div>
                {tasksLoading ? (
                  <EmptyState loading title="Loading tasks" />
                ) : tasks.length ? (
                  tasks.slice(0, 2).map((task) => (
                    <TaskCard key={task.id} task={task} onRun={runTask} onDelete={deleteTask} />
                  ))
                ) : (
                  <EmptyState title="No tasks" body="Add your first monitoring task." />
                )}
              </div>
            </aside>
          </section>
        </div>
      </main>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={20} />
      </div>
      <div className="font-label-sm text-[10px] uppercase tracking-widest text-outline">{label}</div>
      <div className="mt-2 font-display-xl text-3xl font-black text-on-surface">{value}</div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  loading,
  action,
}: {
  title: string;
  body?: string;
  loading?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass-panel flex min-h-[180px] flex-col items-center justify-center rounded-xl p-6 text-center">
      {loading ? <LoadingSpinner className="mb-4" /> : null}
      <h3 className="font-headline-md text-lg text-on-surface">{title}</h3>
      {body ? <p className="mt-2 max-w-md text-sm text-on-surface-variant">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
