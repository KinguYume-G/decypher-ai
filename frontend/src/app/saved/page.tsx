"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Link from "next/link";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useOpportunities } from "@/hooks/useOpportunities";

export default function Page() {
  return <OpportunitiesExperience />;
}

function OpportunitiesExperience() {
  const { opportunities, loading, fetchOpportunities } = useOpportunities({ limit: 50 });
  const [search, setSearch] = useState("");
  const [highOnly, setHighOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const critical = opportunities.filter((o) => o.score_total >= 8).length;

  const filtered = opportunities.filter((o) => {
    if (highOnly && o.score_total < 8) return false;
    if (!search) return true;
    return (
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.keywords_matched.some((k) => k.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-surface/50 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-lg h-xl shrink-0">
        <div className="flex items-center gap-lg">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              className="bg-surface-container-low/50 border border-outline-variant/30 rounded-full py-xs pl-xl pr-md w-64 font-body-md text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all outline-none"
              placeholder="搜索机会..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Filter tabs */}
          <nav className="hidden xl:flex items-center gap-md">
            <button
              onClick={() => { setSearch(""); setHighOnly(false); }}
              className={`font-label-md text-label-md transition-all ${
                !search && !highOnly
                  ? "text-secondary border-b-2 border-secondary pb-2"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              全部
            </button>
            <button
              onClick={() => { setHighOnly((v) => !v); setSearch(""); }}
              className={`font-label-md text-label-md transition-all ${
                highOnly
                  ? "text-secondary border-b-2 border-secondary pb-2"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              高分（≥ 8.0）
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-sm">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">tune</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-lg custom-scrollbar">
        <div className="max-w-[1200px] mx-auto">

          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-sm mb-lg pb-md border-b border-outline-variant/20">
            <div>
              <Badge tone="primary">机会管道</Badge>
              <h1 className="mt-sm font-headline-lg text-headline-lg text-on-surface">
                机会收藏
              </h1>
              <p className="mt-xs max-w-2xl font-body-md text-body-md text-on-surface-variant">
                AI 从监控任务中提取的高置信度信号。审阅并选择值得深入分析的机会。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-sm">
              <div className="glass-card rounded-xl px-md py-sm text-center">
                <div className="font-label-sm text-[10px] uppercase text-outline">总信号数</div>
                <div className="mt-xs font-headline-md text-2xl font-bold text-on-surface">
                  {opportunities.length}
                </div>
              </div>
              <div className="glass-card rounded-xl px-md py-sm text-center">
                <div className="font-label-sm text-[10px] uppercase text-outline">高优先级</div>
                <div className="mt-xs font-headline-md text-2xl font-bold text-secondary">
                  {critical}
                </div>
              </div>
            </div>
          </div>

          {/* Card grid */}
          {loading ? (
            <div className="glass-card flex min-h-[280px] items-center justify-center rounded-xl">
              <LoadingSpinner />
            </div>
          ) : filtered.length ? (
            <>
              <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    selected={opp.id === selectedId}
                    onSelect={(card) => setSelectedId(card.id)}
                    onFavoriteToggle={fetchOpportunities}
                  />
                ))}
              </div>
              {/* Load more footer */}
              <div className="mt-lg flex justify-center">
                <p className="font-label-sm text-label-sm text-outline">
                  显示 {filtered.length} 条 · 创建更多任务获取更多信号
                </p>
              </div>
            </>
          ) : (
            <div className="glass-card flex min-h-[280px] flex-col items-center justify-center rounded-xl p-lg text-center">
              <span className="material-symbols-outlined text-4xl text-secondary mb-sm">
                search_off
              </span>
              <h2 className="font-headline-md text-xl text-on-surface">暂无机会</h2>
              <p className="mt-xs max-w-lg font-body-md text-sm text-on-surface-variant">
                {search
                  ? "未找到匹配的机会，请尝试其他关键词。"
                  : "先创建并运行监控任务，AI 分析结果将显示在这里。"}
              </p>
              {!search && (
                <Link
                  href="/tasks"
                  className="mt-md font-label-md text-label-md text-secondary hover:underline"
                >
                  前往任务管理 →
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
