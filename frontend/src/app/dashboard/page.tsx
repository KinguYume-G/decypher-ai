"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import AIAnalystPanel from "@/components/layout/AIAnalystPanel";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { CreateTaskModal } from "@/components/dashboard/CreateTaskModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { UpgradePromptModal } from "@/components/dashboard/UpgradePromptModal";
import { cardsAPI } from "@/lib/api";
import { useDashboardStore } from "@/store";
import { useTasks } from "@/hooks/useTasks";
import type { Opportunity, TaskCategory } from "@/types";

const MODULES: { id: TaskCategory | null; label: string }[] = [
  { id: null,       label: "All"                    },
  { id: "market",   label: "Global Markets"         },
  { id: "research", label: "Academic Research"      },
  { id: "startup",  label: "Startup Opportunities"  },
  { id: "stocks",   label: "Corporate News"         },
  { id: "jobs",     label: "Careers"                },
];

export default function DashboardPage() {
  const { selectedCard, activeModule, setSelectedCard, setActiveModule } = useDashboardStore();
  const { createTask } = useTasks();

  const [cards, setCards]               = useState<Opportunity[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [search, setSearch]             = useState("");
  const [showUpgrade, setShowUpgrade]   = useState(false);

  const fetchCards = useCallback(async () => {
    setCardsLoading(true);
    try {
      const res = await cardsAPI.list({ category: activeModule ?? undefined, limit: 6 });
      setCards(res.data.data ?? []);
    } catch {
      setCards([]);
    } finally {
      setCardsLoading(false);
    }
  }, [activeModule]);

  useEffect(() => { void fetchCards(); }, [fetchCards]);

  // Client-side search filter
  const displayed = search.trim()
    ? cards.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.keywords_matched.some((k) => k.toLowerCase().includes(search.toLowerCase()))
      )
    : cards;

  const activeLabel = MODULES.find((m) => m.id === activeModule)?.label ?? "Intelligence Insights";

  return (
    <AppShell rightPanel={<AIAnalystPanel />}>
      <div className="flex flex-col h-full min-h-screen">

        {/* ── Top bar: search + filters ──────────────────────────── */}
        <header className="sticky top-0 z-40 bg-white border-b border-outline-variant/20 px-6 py-2.5">
          <div className="flex items-center gap-3">
            {/* Search — compact, subtle */}
            <div className="w-[280px] flex items-center gap-2 bg-surface-container-low rounded-full px-3 py-1.5 border border-outline-variant/25 focus-within:border-secondary/40 transition-all">
              <Search size={13} className="text-outline shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search signals…"
                className="flex-1 bg-transparent text-xs text-on-surface placeholder:text-outline outline-none"
              />
            </div>

            {/* Module tabs */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {MODULES.slice(1).map((mod) => {
                const active = activeModule === mod.id;
                return (
                  <button
                    key={String(mod.id)}
                    onClick={() => setActiveModule(mod.id)}
                    className={`px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                      active
                        ? "text-secondary border-b-2 border-secondary"
                        : "text-on-surface-variant hover:text-on-surface border-b-2 border-transparent"
                    }`}
                  >
                    {mod.label}
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Mobile module tabs */}
          <div className="lg:hidden flex gap-2 mt-2.5 overflow-x-auto pb-0.5 no-scrollbar">
            {MODULES.slice(1).map((mod) => {
              const active = activeModule === mod.id;
              return (
                <button
                  key={String(mod.id)}
                  onClick={() => setActiveModule(mod.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                    active
                      ? "bg-secondary/10 text-secondary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {mod.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* ── Main content ───────────────────────────────────────── */}
        <main className="flex-1 px-6 py-6">

          {/* Section header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-on-surface">Intelligence Insights</h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Showing {displayed.length} curated signals{activeModule ? ` · ${activeLabel}` : ""}
              </p>
            </div>
            <CreateTaskModal onCreate={createTask} />
          </div>

          {/* Card grid */}
          {cardsLoading ? (
            <div className="flex items-center justify-center min-h-[360px]">
              <div className="text-center space-y-3">
                <LoadingSpinner className="mx-auto" />
                <p className="text-sm text-on-surface-variant">Fetching intelligence signals…</p>
              </div>
            </div>
          ) : displayed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayed.map((card, i) => (
                <OpportunityCard
                  key={card.id}
                  opportunity={card}
                  index={i}
                  selected={selectedCard?.id === card.id}
                  onSelect={setSelectedCard}
                  onFavoriteToggle={fetchCards}
                />
              ))}
            </div>
          ) : (
            <EmptyState search={search} onClear={() => setSearch("")} />
          )}

          {/* View more — soft upgrade prompt */}
          {!cardsLoading && displayed.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowUpgrade(true)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors group"
              >
                View more signals
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </button>
              <p className="text-xs text-outline mt-1.5">
                Upgrade to unlock unlimited signal crawling
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Upgrade prompt modal */}
      {showUpgrade && <UpgradePromptModal onClose={() => setShowUpgrade(false)} />}
    </AppShell>
  );
}

function EmptyState({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] text-center">
      <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[28px] text-secondary">radar</span>
      </div>
      {search ? (
        <>
          <h2 className="text-base font-semibold text-on-surface">No results for &quot;{search}&quot;</h2>
          <p className="text-sm text-on-surface-variant mt-1.5 max-w-sm">
            Try a different keyword or clear the search.
          </p>
          <button
            onClick={onClear}
            className="mt-4 text-sm font-semibold text-secondary hover:underline"
          >
            Clear search
          </button>
        </>
      ) : (
        <>
          <h2 className="text-base font-semibold text-on-surface">No signals yet</h2>
          <p className="text-sm text-on-surface-variant mt-1.5 max-w-sm">
            Go to Tasks, create a monitoring task, and trigger it — AI-generated intelligence cards will appear here.
          </p>
          <a
            href="/tasks"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
          >
            Go to Tasks
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </a>
        </>
      )}
    </div>
  );
}
