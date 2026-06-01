"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bookmark, Copy, Lock, Paperclip, Send, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useChat } from "@/hooks/useChat";
import { notesAPI } from "@/lib/api";
import { useDashboardStore } from "@/store";
import { cn } from "@/lib/utils";

export default function AIAnalystPanel() {
  const { selectedCard } = useDashboardStore();

  // analysisStarted: user has clicked Analyze → show chat
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [showProModal, setShowProModal]        = useState(false);
  const [input, setInput]                      = useState("");
  const bottomRef                              = useRef<HTMLDivElement>(null);
  const fileInputRef                           = useRef<HTMLInputElement>(null);

  const { messages, loading, sendMessage, clearMessages } = useChat(selectedCard?.id);

  // Reset when card changes
  useEffect(() => {
    clearMessages();
    setAnalysisStarted(false);
    setInput("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCard?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAnalyze = () => {
    if (!selectedCard) return;
    setAnalysisStarted(true);
    const opener =
      `/no_think\nAnalyze this signal: "${selectedCard.title}". ` +
      `Cover: (1) key trend driving this, (2) who should care and why, (3) one concrete opportunity to act on. Be concise.`;
    sendMessage(opener, false);
  };

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    if (!analysisStarted) setAnalysisStarted(true);
    sendMessage(msg, false);
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const saveNote = async (content: string) => {
    if (!selectedCard) return;
    try {
      await notesAPI.create({ title: selectedCard.title, content });
      toast.success("Saved to Notes");
    } catch { toast.error("Failed to save note"); }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied"));
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-outline-variant/30 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <span className="text-sm font-bold text-on-surface">AI Analyst</span>
        </div>
        <p className="text-xs text-on-surface-variant">Real-time synthesis of selected market signals.</p>
      </div>

      {/* ── Contextual focus ─────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-outline-variant/30 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Contextual Focus</p>

        {selectedCard ? (
          <>
            <p className="text-sm font-semibold text-secondary border-b-2 border-secondary pb-1 line-clamp-2 mb-3">
              {selectedCard.title}
            </p>

            {/* Score mini-bar */}
            {!analysisStarted && (
              <div className="space-y-1.5 mb-4">
                <ScoreLine label="Trend"       value={selectedCard.score_trend} />
                <ScoreLine label="Feasibility" value={selectedCard.score_feasibility} />
                <ScoreLine label="Commercial"  value={selectedCard.score_commercial} />
              </div>
            )}

            {/* Analyze / Report buttons — shown until analysis starts */}
            {!analysisStarted && (
              <div className="flex gap-2">
                <button
                  onClick={handleAnalyze}
                  className="flex-1 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-colors"
                >
                  Analyze
                </button>
                <button
                  onClick={() => setShowProModal(true)}
                  className="flex-1 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center gap-1"
                >
                  <Lock size={11} className="text-amber-500" />
                  Report
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-on-surface-variant italic">Select a card to load context here.</p>
        )}
      </div>

      {/* ── Message thread ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
        {!selectedCard && (
          <p className="text-xs text-on-surface-variant text-center py-6 leading-relaxed">
            Click any opportunity card to load it here and start a focused analysis.
          </p>
        )}

        {selectedCard && !analysisStarted && messages.length === 0 && (
          <div className="text-center py-4">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Click <strong className="text-secondary">Analyze</strong> to get an AI breakdown of this signal,
              or ask a question below.
            </p>
            <Link href={`/chat?opportunityId=${selectedCard.id}`}
              className="inline-flex items-center gap-1 mt-3 text-[11px] font-semibold text-secondary hover:underline">
              Open full chat <ArrowUpRight size={11} />
            </Link>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-secondary/15 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[13px] text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
            )}

            <div className="flex flex-col gap-1 max-w-[85%]">
              <div className={cn(
                "rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                msg.role === "user"
                  ? "bg-secondary text-white rounded-tr-sm"
                  : "bg-surface-container-low text-on-surface rounded-tl-sm"
              )}>
                {msg.content || (
                  <span className="flex gap-1 items-center text-on-surface-variant">
                    <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                )}
              </div>

              {msg.role === "assistant" && msg.content && (
                <div className="flex items-center gap-2.5 pl-1">
                  <button onClick={() => copyText(msg.content)}
                    className="flex items-center gap-1 text-[10px] text-outline hover:text-on-surface transition-colors">
                    <Copy size={10} /> Copy
                  </button>
                  <button onClick={() => saveNote(msg.content)}
                    className="flex items-center gap-1 text-[10px] text-outline hover:text-secondary transition-colors">
                    <Bookmark size={10} /> Save note
                  </button>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-white">U</span>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-outline-variant/30 shrink-0">
        <div className="flex items-end gap-2 rounded-2xl border border-outline-variant/35 bg-surface-container-low px-3 py-2.5 focus-within:border-secondary/40 focus-within:ring-1 focus-within:ring-secondary/15 transition-all">
          <button
            onClick={() => toast("File upload coming soon — Pro feature.", { icon: "📎" })}
            className="w-6 h-6 rounded-full border border-outline-variant/50 flex items-center justify-center text-outline hover:text-on-surface hover:border-outline transition-colors shrink-0 mb-0.5"
          >
            <Paperclip size={12} />
          </button>

          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            placeholder="Ask about markets, research, startups, the stock market, or job opportunities."
            className="flex-1 resize-none bg-transparent text-xs text-on-surface placeholder:text-outline/70 outline-none leading-relaxed max-h-20 py-0.5"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:bg-outline shrink-0 mb-0.5"
          >
            <Send size={12} />
          </button>
        </div>
        <input ref={fileInputRef} type="file" className="hidden" />
      </div>

      {/* ── Report Pro modal ─────────────────────────────────── */}
      {showProModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowProModal(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
              <Zap size={20} className="text-amber-500" />
            </div>
            <h2 className="text-base font-bold text-on-surface mb-2">Report generation is a Pro feature</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
              Generate structured research reports — market sizing, competitive landscape, risk assessment — powered by deep AI analysis across all your signals.
            </p>
            <Link href="/premium"
              className="block w-full py-2.5 rounded-xl bg-secondary text-white text-sm font-semibold text-center hover:bg-secondary/90 transition-colors"
              onClick={() => setShowProModal(false)}>
              Upgrade to Pro
            </Link>
            <button onClick={() => setShowProModal(false)}
              className="w-full mt-2 py-2 text-xs text-on-surface-variant hover:text-on-surface transition-colors">
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreLine({ label, value }: { label: string; value: number }) {
  const pct   = Math.round(value * 10);
  const color = value >= 8 ? "bg-emerald-500" : value >= 6 ? "bg-secondary" : "bg-amber-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-outline w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-on-surface w-5 text-right">{pct}</span>
    </div>
  );
}
