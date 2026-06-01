"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bookmark, Copy, Paperclip, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useChat } from "@/hooks/useChat";
import { notesAPI } from "@/lib/api";
import { useDashboardStore } from "@/store";
import { cn } from "@/lib/utils";

type AnalystTab = "analyze" | "report";

const QUICK_PROMPTS = [
  "Summarize key insights",
  "Who are the competitors?",
  "What's the market size?",
  "Suggest an MVP approach",
];

export default function AIAnalystPanel() {
  const { selectedCard } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<AnalystTab>("analyze");
  const [input, setInput]         = useState("");
  const [autoSent, setAutoSent]   = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const { messages, loading, sendMessage, clearMessages } = useChat(selectedCard?.id);

  // When a new card is selected: clear history, reset tab, auto-send opening analysis
  useEffect(() => {
    clearMessages();
    setActiveTab("analyze");
    setInput("");
    setAutoSent(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCard?.id]);

  // Auto-send opening analysis once per card selection (only when a card is selected)
  useEffect(() => {
    if (selectedCard && !autoSent) {
      setAutoSent(true);
      const opener = `Give me a brief analysis of this signal: "${selectedCard.title}". Cover the key trend, who should care, and one concrete opportunity.`;
      setTimeout(() => sendMessage(opener, false), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCard?.id, autoSent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    // Works with or without a selected card (no card = general market Q&A mode)
    sendMessage(msg, activeTab === "report");
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleAttach = () => {
    toast("File upload coming soon — Pro feature.", { icon: "📎" });
  };

  const saveNote = async (content: string) => {
    if (!selectedCard) return;
    try {
      await notesAPI.create({ title: selectedCard.title, content });
      toast.success("Saved to Notes");
    } catch {
      toast.error("Failed to save note");
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied"));
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 border-b border-outline-variant/30 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-secondary/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <span className="text-sm font-bold text-on-surface">AI Analyst</span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Real-time synthesis of selected market signals.
        </p>
      </div>

      {/* ── Contextual focus ─────────────────────────────────────── */}
      {selectedCard ? (
        <div className="px-5 py-4 border-b border-outline-variant/30 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
            Contextual Focus
          </p>
          <p className="text-sm font-semibold text-secondary border-b-2 border-secondary pb-1 line-clamp-2">
            {selectedCard.title}
          </p>

          {/* Analyze / Report tabs */}
          <div className="flex gap-1 mt-3">
            {(["analyze", "report"] as AnalystTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors",
                  activeTab === tab
                    ? "bg-secondary text-white"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                )}
              >
                {tab === "analyze" ? "Analyze" : "Report"}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5 py-4 border-b border-outline-variant/30 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
            Contextual Focus
          </p>
          <p className="text-xs text-on-surface-variant italic">
            Select a card to load context here.
          </p>
        </div>
      )}

      {/* ── Message thread ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">

        {/* Empty state — no card selected */}
        {!selectedCard && (
          <div className="py-6 text-center">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Click any opportunity card to load it here and start a focused analysis session.
            </p>
          </div>
        )}

        {/* Quick prompts — shown when card selected but no user messages yet */}
        {selectedCard && messages.filter(m => m.role === "user").length === 0 && !loading && (
          <div className="pt-2">
            <p className="text-[10px] text-outline uppercase tracking-widest mb-2">Quick prompts</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-secondary/30 text-secondary hover:bg-secondary/5 transition-colors font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
          >
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

              {/* Action row for assistant messages */}
              {msg.role === "assistant" && msg.content && (
                <div className="flex items-center gap-2.5 pl-1">
                  <button
                    onClick={() => copyText(msg.content)}
                    className="flex items-center gap-1 text-[10px] text-outline hover:text-on-surface transition-colors"
                  >
                    <Copy size={10} /> Copy
                  </button>
                  <button
                    onClick={() => saveNote(msg.content)}
                    className="flex items-center gap-1 text-[10px] text-outline hover:text-secondary transition-colors"
                  >
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

        {selectedCard && messages.length > 1 && (
          <div className="text-center pt-1">
            <Link
              href={`/chat?opportunityId=${selectedCard.id}`}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-secondary hover:underline"
            >
              Open full chat <ArrowUpRight size={10} />
            </Link>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar (ChatGPT-style) ─────────────────────────────── */}
      <div className="px-4 py-3 border-t border-outline-variant/30 shrink-0">
        <div className="flex items-end gap-2 rounded-2xl border border-outline-variant/35 bg-surface-container-low px-3 py-2.5 focus-within:border-secondary/40 focus-within:ring-1 focus-within:ring-secondary/15 transition-all">
          {/* Attach button (+) */}
          <button
            onClick={handleAttach}
            className="w-6 h-6 rounded-full border border-outline-variant/50 flex items-center justify-center text-outline hover:text-on-surface hover:border-outline transition-colors shrink-0 mb-0.5"
            title="Attach file"
          >
            <Paperclip size={12} />
          </button>

          {/* Text input — always enabled */}
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about markets, research, startups, the stock market, or job opportunities."
            disabled={loading}
            className="flex-1 resize-none bg-transparent text-xs text-on-surface placeholder:text-outline/70 outline-none leading-relaxed max-h-20 py-0.5"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:bg-outline shrink-0 mb-0.5"
            title="Send"
          >
            <Send size={12} />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={() => toast("File upload coming soon — Pro feature.", { icon: "📎" })}
        />
      </div>
    </div>
  );
}
