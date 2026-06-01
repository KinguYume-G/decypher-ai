"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cardsAPI } from "@/lib/api";
import type { Opportunity, TaskCategory } from "@/types";

const CATEGORIES: { id: TaskCategory; label: string; icon: string; color: string; desc: string }[] = [
  {
    id: "market",   label: "Commercial Market", icon: "trending_up",
    color: "text-blue-500 bg-blue-50",
    desc: "Product launches, market trends, competitor analysis",
  },
  {
    id: "research", label: "Academic Research",  icon: "science",
    color: "text-emerald-600 bg-emerald-50",
    desc: "Papers, citations, research-to-product opportunities",
  },
  {
    id: "startup",  label: "Startup Signals",    icon: "rocket_launch",
    color: "text-violet-600 bg-violet-50",
    desc: "MVP ideas, funding signals, market gaps",
  },
  {
    id: "stocks",   label: "Stock Pulse",        icon: "candlestick_chart",
    color: "text-amber-600 bg-amber-50",
    desc: "SEC filings, earnings signals, AI business exposure",
  },
  {
    id: "jobs",     label: "Job Market",         icon: "work",
    color: "text-rose-500 bg-rose-50",
    desc: "Skill demand, hiring trends, career opportunities",
  },
];

export default function CategoriesPage() {
  const [previews, setPreviews] = useState<Partial<Record<TaskCategory, Opportunity[]>>>({});
  const [loading, setLoading]   = useState(true);

  const loadPreviews = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled(
      CATEGORIES.map((cat) =>
        cardsAPI.list({ category: cat.id, limit: 2 }).then((r) => ({
          id: cat.id,
          cards: r.data.data ?? [],
        }))
      )
    );
    const map: Partial<Record<TaskCategory, Opportunity[]>> = {};
    results.forEach((r) => {
      if (r.status === "fulfilled") map[r.value.id] = r.value.cards;
    });
    setPreviews(map);
    setLoading(false);
  }, []);

  useEffect(() => { void loadPreviews(); }, [loadPreviews]);

  return (
    <AppShell>
      <main className="px-6 py-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-on-surface">Categories</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Browse intelligence signals by domain. Each category is powered by dedicated AI agents and data sources.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-10">
            {CATEGORIES.map((cat) => {
              const cards = previews[cat.id] ?? [];
              return (
                <section key={cat.id}>
                  {/* Category header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cat.color}`}>
                        <span className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}>
                          {cat.icon}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-on-surface">{cat.label}</h2>
                        <p className="text-xs text-on-surface-variant">{cat.desc}</p>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard?module=${cat.id}`}
                      className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
                    >
                      View all
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>

                  {cards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cards.map((card, i) => (
                        <OpportunityCard key={card.id} opportunity={card} index={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-surface-container-low rounded-xl p-6 text-center border border-outline-variant/30">
                      <p className="text-sm text-on-surface-variant">
                        No signals yet. Create a{" "}
                        <Link href="/tasks" className="text-secondary font-semibold hover:underline">
                          monitoring task
                        </Link>{" "}
                        for this category.
                      </p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </AppShell>
  );
}
