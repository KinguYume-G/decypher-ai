"use client";

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { CreateTaskModal } from '@/components/dashboard/CreateTaskModal';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTasks } from '@/hooks/useTasks';

export default function TasksPage() {
  return <TasksExperience />;

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-surface/60 backdrop-blur-xl sticky top-0 z-40 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex justify-between items-center w-full px-margin-desktop h-16">
        <div className="flex items-center gap-4">
          <h2 className="font-display-xl text-headline-md font-bold text-primary tracking-tight">Task Configuration</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group hidden sm:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50">search</span>
            <input className="bg-surface-container-lowest border-none rounded-full pl-10 pr-4 py-1.5 text-sm w-64 focus:ring-1 focus:ring-primary/50 placeholder:text-on-surface-variant/30" placeholder="Quick find..." type="text" />
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors duration-200">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors duration-200">
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 p-margin-desktop bg-[radial-gradient(circle_at_top_right,_#1d1a24_0%,_#15121b_100%)] w-full">
        <div className="w-full mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-8 text-on-surface-variant">
            <span className="text-label-sm font-label-sm uppercase tracking-widest hover:text-primary cursor-pointer">Projects</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-label-sm font-label-sm uppercase tracking-widest text-primary">Task Config</span>
          </div>

          {/* Settings Card Container */}
          <div className="glass-panel rounded-[1.5rem] overflow-hidden shadow-2xl p-8 md:p-12 relative">
            {/* AI Glow Pulse */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-secondary/5 rounded-full blur-[60px]"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-white/10 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-primary text-3xl">robot_2</span>
                </div>
                <div>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface">Agent Deployment Shell</h3>
                  <p className="font-body-md text-on-surface-variant opacity-80">Configure the parameters for your next intelligence sweep.</p>
                </div>
              </div>

              <form className="space-y-10">
                {/* Keywords Input */}
                <div className="space-y-4">
                  <label className="block font-label-sm text-sm uppercase tracking-widest text-primary-fixed-dim">Target Keywords</label>
                  <div className="bg-surface-container-lowest border border-white/5 rounded-xl p-3 flex flex-wrap gap-2 focus-within:border-secondary transition-colors group">
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg">
                      <span className="font-label-sm text-xs text-primary">Web3</span>
                      <span className="material-symbols-outlined text-sm cursor-pointer">close</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg">
                      <span className="font-label-sm text-xs text-primary">Generative AI</span>
                      <span className="material-symbols-outlined text-sm cursor-pointer">close</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg">
                      <span className="font-label-sm text-xs text-primary">SaaS Infrastructure</span>
                      <span className="material-symbols-outlined text-sm cursor-pointer">close</span>
                    </div>
                    <input className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/30 min-w-[120px]" placeholder="Add keywords..." type="text" />
                  </div>
                </div>

                {/* Data Sources Bento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-full mb-2">
                    <label className="block font-label-sm text-sm uppercase tracking-widest text-primary-fixed-dim">Data Sources</label>
                  </div>
                  
                  {/* GitHub Toggle */}
                  <div className="bg-surface-container/50 border border-white/5 rounded-xl p-5 flex items-center justify-between group hover:border-white/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface">terminal</span>
                      </div>
                      <span className="font-headline-md text-body-lg">GitHub</span>
                    </div>
                    <div className="w-12 h-6 bg-primary-container rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Twitter Toggle */}
                  <div className="bg-surface-container/50 border border-white/5 rounded-xl p-5 flex items-center justify-between group hover:border-white/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface">public</span>
                      </div>
                      <span className="font-headline-md text-body-lg">Twitter</span>
                    </div>
                    <div className="w-12 h-6 bg-outline-variant rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Reddit Toggle */}
                  <div className="bg-surface-container/50 border border-white/5 rounded-xl p-5 flex items-center justify-between group hover:border-white/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface">forum</span>
                      </div>
                      <span className="font-headline-md text-body-lg">Reddit</span>
                    </div>
                    <div className="w-12 h-6 bg-primary-container rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Frequency Dropdown */}
                <div className="space-y-4">
                  <label className="block font-label-sm text-sm uppercase tracking-widest text-primary-fixed-dim">Analysis Frequency</label>
                  <div className="relative group">
                    <select className="w-full bg-surface-container-lowest border border-white/5 rounded-xl px-4 py-4 appearance-none focus:ring-1 focus:ring-secondary text-on-surface transition-all cursor-pointer" defaultValue="daily">
                      <option value="hourly">Hourly Deep-Scan</option>
                      <option value="daily">Daily Summary Report</option>
                      <option value="weekly">Weekly Intelligence Brief</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-on-surface-variant">keyboard_arrow_down</span>
                  </div>
                  <p className="text-xs text-on-surface-variant flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary ai-pulse-glow"></span>
                    Optimized for computational efficiency and data freshness.
                  </p>
                </div>

                {/* Action Area */}
                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-left">
                    <p className="font-label-sm text-[10px] uppercase text-on-surface-variant mb-1">Status</p>
                    <div className="flex items-center gap-2 text-secondary">
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                      <span className="font-body-md font-medium">Ready for deployment</span>
                    </div>
                  </div>
                  <button className="group relative px-12 py-4 rounded-xl primary-gradient text-white font-bold text-lg shadow-[0_0_40px_rgba(124,58,237,0.3)] hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] transition-all overflow-hidden flex items-center gap-3" type="button">
                    <span className="relative z-10">Deploy AI Agent</span>
                    <span className="material-symbols-outlined relative z-10 transition-transform group-hover:translate-x-1">bolt</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-12">
            <div className="glass-panel p-4 rounded-xl text-center">
              <p className="text-on-surface-variant text-xs mb-1 uppercase font-label-sm">Active Agents</p>
              <p className="font-display-xl text-headline-md text-primary">12</p>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center">
              <p className="text-on-surface-variant text-xs mb-1 uppercase font-label-sm">Points Analyzed</p>
              <p className="font-display-xl text-headline-md text-primary">1.4M</p>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center">
              <p className="text-on-surface-variant text-xs mb-1 uppercase font-label-sm">Token Usage</p>
              <p className="font-display-xl text-headline-md text-primary">84%</p>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center">
              <p className="text-on-surface-variant text-xs mb-1 uppercase font-label-sm">System Latency</p>
              <p className="font-display-xl text-headline-md text-secondary">14ms</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function TasksExperience() {
  const { tasks, loading, createTask, runTask, deleteTask } = useTasks();

  return (
    <AppShell>
      <main className="w-full px-5 py-6 md:px-margin-desktop md:py-8">
        <div className="mx-auto max-w-[1200px] space-y-8">
          <section className="flex flex-col justify-between gap-5 border-b border-white/5 pb-6 md:flex-row md:items-end">
            <div>
              <Badge tone="primary">Monitoring setup</Badge>
              <h1 className="mt-3 font-display-xl text-3xl font-black text-on-surface md:text-4xl">
                Tasks
              </h1>
              <p className="mt-3 max-w-2xl text-on-surface-variant">
                Keep tasks narrow. One task should answer one market question with a small keyword set.
              </p>
            </div>
            <CreateTaskModal onCreate={createTask} />
          </section>

          {loading ? (
            <div className="glass-panel flex min-h-[240px] items-center justify-center rounded-xl">
              <LoadingSpinner />
            </div>
          ) : tasks.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onRun={runTask} onDelete={deleteTask} />
              ))}
            </div>
          ) : (
            <div className="glass-panel flex min-h-[280px] flex-col items-center justify-center rounded-xl p-8 text-center">
              <h2 className="font-headline-md text-xl text-on-surface">Create your first monitoring task</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-on-surface-variant">
                Start with a specific segment like "AI agent testing tools" instead of broad terms like "AI".
              </p>
              <div className="mt-5">
                <CreateTaskModal onCreate={createTask} />
              </div>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
