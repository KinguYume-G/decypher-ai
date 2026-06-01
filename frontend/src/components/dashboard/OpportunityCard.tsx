"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, BookmarkCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/Badge";
import { compactScore, formatDate } from "@/lib/utils";
import { cardsAPI, notesAPI } from "@/lib/api";
import type { Opportunity, TaskCategory } from "@/types";

const CATEGORY_META: Record<TaskCategory, { label: string; icon: string; color: string }> = {
  startup:  { label: "Startup",        icon: "rocket_launch",     color: "text-violet-500" },
  market:   { label: "Global Markets", icon: "trending_up",       color: "text-blue-500" },
  research: { label: "Research",       icon: "science",           color: "text-emerald-500" },
  stocks:   { label: "Corp. News",     icon: "candlestick_chart", color: "text-amber-500" },
  jobs:     { label: "Careers",        icon: "work",              color: "text-rose-500" },
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  index?: number;
  selected?: boolean;
  onSelect?: (card: Opportunity) => void;
  onFavoriteToggle?: () => void;
}

export function OpportunityCard({
  opportunity, index, selected = false, onSelect, onFavoriteToggle,
}: OpportunityCardProps) {
  const [flipped, setFlipped]         = useState(false);
  const [favorited, setFavorited]     = useState(opportunity.is_favorited);
  const [favLoading, setFavLoading]   = useState(false);
  const [noteText, setNoteText]       = useState("");
  const [savingNote, setSavingNote]   = useState(false);

  const catMeta  = CATEGORY_META[opportunity.category] ?? CATEGORY_META.startup;
  const numLabel = index !== undefined ? String(index + 1).padStart(2, "0") : null;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favLoading) return;
    setFavLoading(true);
    try {
      const res = await cardsAPI.toggleFavorite(opportunity.id);
      setFavorited(res.data.data?.is_favorited ?? !favorited);
      onFavoriteToggle?.();
    } catch { /* ignore */ }
    finally { setFavLoading(false); }
  };

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlipped((v) => !v);
  };

  const handleSaveNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!noteText.trim() || savingNote) return;
    setSavingNote(true);
    try {
      await notesAPI.create({
        title: opportunity.title,
        content: noteText.trim(),
      });
      toast.success("Note saved");
      setNoteText("");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div
      className="relative h-[300px] cursor-pointer"
      style={{ perspective: "1200px" }}
      onClick={() => { if (!flipped) onSelect?.(opportunity); }}
    >
      <div
        className="relative w-full h-full transition-all duration-700"
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >

        {/* ── Front face ───────────────────────────────────────── */}
        <div
          className={`absolute inset-0 rounded-2xl p-5 flex flex-col bg-white border transition-all ${
            selected ? "border-secondary/60 ring-2 ring-secondary/20 shadow-md shadow-secondary/10" : "border-outline-variant/40 hover:border-outline-variant/70"
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Row 1: number + score */}
          <div className="flex items-start justify-between mb-3">
            {numLabel && (
              <span className="text-3xl font-black text-on-surface/15 leading-none select-none">
                {numLabel}
              </span>
            )}
            <span className="ml-auto text-xs font-bold text-white px-2.5 py-0.5 rounded-full bg-slate-700">
              {Math.round(opportunity.score_total * 10)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-on-surface leading-snug mb-2 line-clamp-2">
            {opportunity.title}
          </h3>

          {/* Summary */}
          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3 flex-1">
            {opportunity.why_it_matters}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {opportunity.keywords_matched.slice(0, 3).map((kw) => (
              <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface-variant">
                {kw}
              </span>
            ))}
          </div>

          {/* Actions row — favorite only + flip */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/15">
            {/* Favorite */}
            <button
              onClick={handleFavorite}
              disabled={favLoading}
              className="flex items-center gap-1 text-on-surface-variant hover:text-secondary transition-colors disabled:opacity-40"
              title={favorited ? "Remove from saved" : "Save"}
            >
              {favorited
                ? <BookmarkCheck size={15} className="text-secondary" />
                : <Bookmark size={15} />}
            </button>

            {/* Right side: category label + flip */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold ${catMeta.color} flex items-center gap-1`}>
                <span className="material-symbols-outlined text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>{catMeta.icon}</span>
                {catMeta.label}
              </span>
              <button
                onClick={handleFlip}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                title="View full analysis"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Back face ────────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col bg-white border border-outline-variant/40 overflow-y-auto custom-scrollbar"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Back header */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${catMeta.color} flex items-center gap-1`}>
              <span className="material-symbols-outlined text-[12px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>{catMeta.icon}</span>
              {catMeta.label} · AI Analysis
            </span>
            <button onClick={handleFlip} className="text-on-surface-variant hover:text-on-surface transition-colors" title="Flip back">
              <RefreshCw size={13} />
            </button>
          </div>

          <h3 className="text-sm font-bold text-on-surface mb-3 shrink-0 line-clamp-2">
            {opportunity.title}
          </h3>

          <div className="space-y-3 text-xs text-on-surface-variant flex-1">
            <Section label="What to build"  content={opportunity.what_to_build} />
            <Section label="Why it matters" content={opportunity.why_it_matters} />
            <Section label="How to execute" content={opportunity.how_to_execute} />

            {/* Score breakdown */}
            <div>
              <p className="font-bold text-on-surface/50 uppercase text-[10px] mb-1.5">Score breakdown</p>
              <div className="grid grid-cols-2 gap-1">
                <ScoreRow label="Trend"       value={opportunity.score_trend} />
                <ScoreRow label="Novelty"     value={opportunity.score_novelty} />
                <ScoreRow label="Feasibility" value={opportunity.score_feasibility} />
                <ScoreRow label="Commercial"  value={opportunity.score_commercial} />
                <ScoreRow label="Competition" value={opportunity.score_competition} warn />
              </div>
            </div>

            {/* Source signals */}
            {opportunity.source_signals.length > 0 && (
              <div>
                <p className="font-bold text-on-surface/50 uppercase text-[10px] mb-1.5">Sources</p>
                {opportunity.source_signals.slice(0, 3).map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="block text-secondary hover:underline truncate text-[10px] mb-0.5">
                    {url}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick note input */}
          <div className="shrink-0 mt-3 pt-3 border-t border-outline-variant/20" onClick={(e) => e.stopPropagation()}>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">Quick note</p>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveNote(e as unknown as React.MouseEvent); }}
                placeholder="Add your insight…"
                className="flex-1 text-[10px] px-2 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low outline-none focus:border-secondary/50 text-on-surface placeholder:text-outline"
              />
              <button
                onClick={handleSaveNote}
                disabled={!noteText.trim() || savingNote}
                className="text-[10px] px-2.5 py-1.5 rounded-lg bg-secondary text-white font-semibold disabled:opacity-40 transition-colors hover:bg-secondary/90 shrink-0"
              >
                Save
              </button>
            </div>
          </div>

          {/* Deep dive */}
          <Link
            href={`/chat?opportunityId=${opportunity.id}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-2.5 flex items-center justify-center gap-2 rounded-xl bg-secondary/8 border border-secondary/20 px-3 py-2 text-xs font-semibold text-secondary hover:bg-secondary/12 transition-colors shrink-0"
          >
            Deep dive with AI <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ label, content }: { label: string; content: string }) {
  if (!content) return null;
  return (
    <div>
      <p className="font-bold text-on-surface/50 uppercase text-[10px] mb-1">{label}</p>
      <p className="leading-relaxed line-clamp-3">{content}</p>
    </div>
  );
}

function ScoreRow({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  const color = warn
    ? value <= 4 ? "text-emerald-500" : value <= 7 ? "text-amber-500" : "text-rose-500"
    : value >= 8 ? "text-emerald-500" : value >= 6 ? "text-blue-500"    : "text-amber-500";
  return (
    <div className="flex items-center justify-between">
      <span className="text-on-surface/40">{label}</span>
      <span className={`font-bold text-[11px] ${color}`}>{value.toFixed(1)}</span>
    </div>
  );
}
