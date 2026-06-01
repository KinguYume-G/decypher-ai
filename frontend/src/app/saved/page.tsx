"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Bookmark, Search } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cardsAPI } from "@/lib/api";
import type { Opportunity } from "@/types";

export default function SavedPage() {
  const [cards, setCards]       = useState<Opportunity[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // favorited=true → only cards the user has explicitly saved
      const res = await cardsAPI.list({ favorited: true, limit: 50 });
      setCards(res.data.data ?? []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const displayed = search.trim()
    ? cards.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.keywords_matched.some((k) => k.toLowerCase().includes(search.toLowerCase()))
      )
    : cards;

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-outline-variant/20 px-6 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Bookmark size={18} className="text-secondary" />
          <h1 className="text-base font-bold text-on-surface">Saved</h1>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-3 py-1.5 border border-outline-variant/25 focus-within:border-secondary/40 transition-all w-64">
          <Search size={13} className="text-outline shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved signals…"
            className="flex-1 bg-transparent text-xs text-on-surface placeholder:text-outline outline-none"
          />
        </div>
      </header>

      <main className="px-6 py-8 max-w-5xl mx-auto w-full">

        {/* Sub-header */}
        <div className="mb-6">
          <p className="text-sm text-on-surface-variant">
            {loading
              ? "Loading your saved signals…"
              : `${cards.length} saved signal${cards.length !== 1 ? "s" : ""}${displayed.length !== cards.length ? ` · ${displayed.length} matching` : ""}`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <LoadingSpinner />
          </div>
        ) : displayed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayed.map((card, i) => (
              <OpportunityCard
                key={card.id}
                opportunity={card}
                index={i}
                onFavoriteToggle={load}   // re-fetch when user un-saves a card
              />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <p className="text-sm text-on-surface-variant">No results for &ldquo;{search}&rdquo;</p>
            <button onClick={() => setSearch("")}
              className="mt-3 text-sm font-semibold text-secondary hover:underline">
              Clear search
            </button>
          </div>
        )}
      </main>
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <Bookmark size={26} className="text-outline" />
      </div>
      <h2 className="text-base font-semibold text-on-surface">No saved signals yet</h2>
      <p className="text-sm text-on-surface-variant mt-1.5 max-w-sm leading-relaxed">
        Click the <Bookmark size={13} className="inline mb-0.5" /> bookmark icon on any intelligence card to save it here for later review.
      </p>
    </div>
  );
}
