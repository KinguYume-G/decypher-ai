"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, BookmarkCheck, RefreshCw, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { compactScore, formatDate } from "@/lib/utils";
import { cardsAPI } from "@/lib/api";
import type { Opportunity, TaskCategory } from "@/types";

const CATEGORY_META: Record<
  TaskCategory,
  { label: string; icon: string; color: string }
> = {
  startup:  { label: "Startup",        icon: "rocket_launch",     color: "text-violet-400" },
  market:   { label: "Global Markets", icon: "trending_up",       color: "text-blue-400" },
  research: { label: "Research",       icon: "science",           color: "text-emerald-400" },
  stocks:   { label: "Corp. News",     icon: "candlestick_chart", color: "text-amber-400" },
  jobs:     { label: "Careers",        icon: "work",              color: "text-rose-400" },
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  index?: number;           // 0-based → 显示为 "01" "02"
  selected?: boolean;
  onSelect?: (card: Opportunity) => void;
  onFavoriteToggle?: () => void;
}

export function OpportunityCard({
  opportunity,
  index,
  selected = false,
  onSelect,
  onFavoriteToggle,
}: OpportunityCardProps) {
  const [flipped, setFlipped]     = useState(false);
  const [favorited, setFavorited] = useState(opportunity.is_favorited);
  const [liked, setLiked]         = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const catMeta    = CATEGORY_META[opportunity.category] ?? CATEGORY_META.startup;
  const numLabel   = index !== undefined ? String(index + 1).padStart(2, "0") : null;
  // Score badge: teal-slate consistent style matching target UI
  const scoreColor = "bg-slate-700";

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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((v) => !v);
  };

  return (
    /* 固定高度容器，提供 3D 透视 */
    <div
      className="relative h-[300px] cursor-pointer"
      style={{ perspective: "1200px" }}
      onClick={() => { if (!flipped) onSelect?.(opportunity); }}
    >
      {/* 翻转容器 */}
      <div
        className="relative w-full h-full transition-all duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── 正面 ─────────────────────────────────────────── */}
        <div
          className={`absolute inset-0 rounded-2xl p-5 flex flex-col glass-card transition-all ${
            selected ? "ring-2 ring-violet-400/60 border-violet-400/40" : ""
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* 顶部：序号 + 分数 */}
          <div className="flex items-start justify-between mb-3">
            {numLabel && (
              <span className="font-display-xl text-3xl font-black text-on-surface/20 leading-none select-none">
                {numLabel}
              </span>
            )}
            <span className={`ml-auto text-xs font-bold text-white px-2 py-0.5 rounded-full ${scoreColor}`}>
              {Math.round(opportunity.score_total * 10)}
            </span>
          </div>

          {/* 标题 */}
          <h3 className="font-headline-md text-base text-on-surface leading-tight mb-2 line-clamp-2">
            {opportunity.title}
          </h3>

          {/* 摘要 */}
          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3 flex-1">
            {opportunity.why_it_matters}
          </p>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {opportunity.keywords_matched.slice(0, 3).map((kw) => (
              <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-on-surface/5 border border-on-surface/10 text-on-surface-variant">
                {kw}
              </span>
            ))}
          </div>

          {/* 底部操作行 */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-on-surface/5">
            <div className="flex items-center gap-3">
              {/* 收藏 */}
              <button onClick={handleFavorite} disabled={favLoading}
                className="flex items-center gap-1 text-on-surface-variant hover:text-rose-400 transition-colors disabled:opacity-40">
                {favorited
                  ? <BookmarkCheck size={14} className="text-rose-400" />
                  : <Bookmark size={14} />}
              </button>
              {/* 点赞 */}
              <button onClick={handleLike}
                className={`flex items-center gap-1 transition-colors ${liked ? "text-blue-400" : "text-on-surface-variant hover:text-blue-400"}`}>
                <ThumbsUp size={14} className={liked ? "fill-blue-400" : ""} />
              </button>
            </div>

            {/* 右侧：模块标签 + 翻转按钮 */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold ${catMeta.color} flex items-center gap-1`}>
                <span className="material-symbols-outlined text-[12px]">{catMeta.icon}</span>
                {catMeta.label}
              </span>
              <button onClick={handleFlip}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                title="查看详情">
                <RefreshCw size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 背面（完整 AI 分析内容）──────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col glass-card overflow-y-auto custom-scrollbar"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 背面顶部 */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${catMeta.color} flex items-center gap-1`}>
              <span className="material-symbols-outlined text-[12px]">{catMeta.icon}</span>
              {catMeta.label} · AI Analysis
            </span>
            <button onClick={handleFlip}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
              title="Flip back">
              <RefreshCw size={13} />
            </button>
          </div>

          <h3 className="font-headline-md text-sm text-on-surface font-bold mb-3 shrink-0 line-clamp-2">
            {opportunity.title}
          </h3>

          <div className="space-y-3 text-xs text-on-surface-variant flex-1">
            <Section label="What to build"  content={opportunity.what_to_build} />
            <Section label="Why it matters" content={opportunity.why_it_matters} />
            <Section label="How to execute" content={opportunity.how_to_execute} />

            {/* Score breakdown */}
            <div>
              <p className="font-bold text-on-surface/60 uppercase text-[10px] mb-1.5">Score breakdown</p>
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
                <p className="font-bold text-on-surface/60 uppercase text-[10px] mb-1.5">Sources</p>
                <div className="space-y-1">
                  {opportunity.source_signals.slice(0, 4).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="block text-violet-400 hover:underline truncate text-[10px]">
                      {url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Deep dive link */}
          <Link
            href={`/chat?opportunityId=${opportunity.id}`}
            className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-violet-500/10 border border-violet-400/20 px-3 py-2 text-xs font-semibold text-violet-400 hover:bg-violet-500/20 transition-colors shrink-0"
          >
            Deep dive with AI
            <ArrowRight size={12} />
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
      <p className="font-bold text-on-surface/60 uppercase text-[10px] mb-1">{label}</p>
      <p className="leading-relaxed line-clamp-3">{content}</p>
    </div>
  );
}

function ScoreRow({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  const color = warn
    ? value <= 4 ? "text-emerald-400" : value <= 7 ? "text-amber-400" : "text-rose-400"
    : value >= 8 ? "text-emerald-400" : value >= 6 ? "text-blue-400" : "text-amber-400";
  return (
    <div className="flex items-center justify-between">
      <span className="text-on-surface/50">{label}</span>
      <span className={`font-bold ${color}`}>{value.toFixed(1)}</span>
    </div>
  );
}
