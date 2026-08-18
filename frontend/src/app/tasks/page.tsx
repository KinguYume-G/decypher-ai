"use client";

import React, { useState } from "react";
import { Zap } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "@/components/layout/AppShell";
import { CreateTaskModal } from "@/components/dashboard/CreateTaskModal";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getAPIErrorMessage, seedAPI } from "@/lib/api";
import { useTasks } from "@/hooks/useTasks";

export default function TasksPage() {
  const { tasks, loading, createTask, runTask, deleteTask, toggleTask } = useTasks();
  const [seeding, setSeeding] = useState(false);

  const handleQuickSetup = async () => {
    setSeeding(true);
    try {
      const res = await seedAPI.run();
      toast.success(res.data.data?.message ?? "Tasks created and crawls triggered!");
      // Reload tasks list after a short delay
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      toast.error(getAPIErrorMessage(err, "Failed to run quick setup"));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-outline-variant/20 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">monitoring</span>
          <h1 className="text-base font-bold text-on-surface">Monitoring Tasks</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick Setup — one click to populate all 5 modules */}
          {tasks.length === 0 && !loading && (
            <button
              onClick={handleQuickSetup}
              disabled={seeding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-semibold hover:bg-secondary/15 transition-colors disabled:opacity-50"
            >
              <Zap size={13} />
              {seeding ? "Setting up…" : "Quick Setup (all 5 modules)"}
            </button>
          )}
          <CreateTaskModal onCreate={createTask} />
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">

        {/* Intro */}
        <div className="mb-8">
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Each task monitors a specific market question. The more focused the keywords, the higher the signal quality.
            Click <strong>Run</strong> to manually trigger a crawl — cards will appear on your Dashboard within seconds.
          </p>
        </div>

        {/* How it works — shown when no tasks */}
        {!loading && tasks.length === 0 && (
          <div className="bg-secondary/5 border border-secondary/15 rounded-xl p-6 mb-8">
            <h2 className="text-sm font-bold text-secondary mb-3">How to get your first cards</h2>
            <ol className="space-y-2">
              {[
                'Click "New task" → pick a category (e.g. Startup) → enter keywords (e.g. "ai agent, llm ops")',
                "Select data sources — GitHub, Hacker News, arXiv are free and require no API key",
                'Click "Create task", then hit Run to trigger an immediate crawl',
                "The AI analyzes fetched signals and generates 6 intelligence cards on your Dashboard",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-on-surface-variant">
                  <span className="w-5 h-5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[240px]">
            <LoadingSpinner />
          </div>
        ) : tasks.length ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total tasks"    value={tasks.length} icon="task_alt" />
              <StatCard label="Active"         value={tasks.filter((t) => t.is_active).length} icon="play_circle" />
              <StatCard label="Running"        value={tasks.filter((t) => t.status === "running").length} icon="bolt" />
              <StatCard label="Total runs"     value={tasks.reduce((acc, t) => acc + t.run_count, 0)} icon="repeat" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onRun={runTask}
                  onDelete={deleteTask}
                  onToggle={toggleTask}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[240px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[28px] text-secondary">monitoring</span>
            </div>
            <h2 className="text-base font-semibold text-on-surface mb-2">No tasks yet</h2>
            <p className="text-sm text-on-surface-variant max-w-sm mb-5">
              Use <strong>Quick Setup</strong> to instantly create tasks for all 5 modules and start crawling,
              or create a custom task below.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleQuickSetup}
                disabled={seeding}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                <Zap size={15} />
                {seeding ? "Setting up…" : "Quick Setup"}
              </button>
              <CreateTaskModal onCreate={createTask} />
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white border border-outline-variant/40 rounded-xl p-4 text-center">
      <span className="material-symbols-outlined text-secondary text-[18px]">{icon}</span>
      <div className="mt-1 text-[10px] uppercase tracking-widest text-outline font-medium">{label}</div>
      <div className="mt-1 text-2xl font-bold text-on-surface">{value}</div>
    </div>
  );
}
