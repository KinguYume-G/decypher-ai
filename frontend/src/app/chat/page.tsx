"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import AppShell from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ScoreBar } from "@/components/dashboard/ScoreBar";
import { useChat } from "@/hooks/useChat";
import { useOpportunity } from "@/hooks/useOpportunities";

export default function ChatPage() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <ChatExperience />
    </Suspense>
  );
}

function PageLoadingFallback() {
  return (
    <AppShell>
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    </AppShell>
  );
}

function ChatExperience() {
  const searchParams = useSearchParams();
  const opportunityId =
    Number(searchParams.get("opportunityId") || 0) || undefined;
  const { opportunity, loading } = useOpportunity(opportunityId);
  const { messages, loading: chatLoading, sendMessage } = useChat(opportunityId);

  return (
    <AppShell>
      {/* Two-column layout: context panel + chat */}
      <div className="flex flex-1 overflow-hidden h-screen">
        {/* ── Left context panel (hidden on mobile) ──────────────────── */}
        <aside className="hidden xl:flex w-[360px] border-r border-outline-variant/20 bg-surface-container-lowest/40 backdrop-blur-md flex-col">
          {/* Header */}
          <div className="p-md border-b border-outline-variant/10">
            <div className="flex items-center gap-sm mb-xs">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                AI Analyst
              </h2>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">
              Real-time synthesis of selected market signals.
            </p>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-md custom-scrollbar space-y-md">
            <Link
              href="/saved"
              className="inline-flex items-center gap-xs font-label-md text-label-md text-secondary hover:underline"
            >
              <ArrowLeft size={14} />
              返回机会列表
            </Link>

            {/* Selected context card */}
            {loading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : opportunity ? (
              <>
                <div className="p-sm rounded-xl bg-secondary/5 border border-secondary/20">
                  <p className="font-label-sm text-label-sm text-secondary uppercase mb-xs tracking-wider">
                    Contextual Focus
                  </p>
                  <div className="flex items-start gap-sm">
                    <span className="font-label-md text-headline-md text-secondary font-bold opacity-30 leading-none shrink-0">
                      {String(opportunity.id).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-headline-md font-bold text-on-surface text-sm">
                        {opportunity.title}
                      </h4>
                      <div className="w-full bg-surface-container rounded-full h-1 mt-sm overflow-hidden">
                        <div
                          className="h-full bg-secondary"
                          style={{
                            width: `${Math.round(opportunity.score_total * 10)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-sm">
                  <Link
                    href={`/chat?opportunityId=${opportunity.id}`}
                    className="accent-gradient-bg text-white font-label-md text-label-md py-sm rounded-lg shadow-lg shadow-secondary/20 hover:opacity-90 transition-opacity active:scale-95 text-center"
                  >
                    Analyze
                  </Link>
                  <button className="bg-surface border border-outline-variant text-on-surface font-label-md text-label-md py-sm rounded-lg hover:bg-surface-container-low transition-colors active:scale-95">
                    Report
                  </button>
                </div>

                {/* Score bars */}
                <div className="space-y-sm">
                  <ScoreBar label="Trend" value={opportunity.score_trend} />
                  <ScoreBar
                    label="Feasibility"
                    value={opportunity.score_feasibility}
                    tone="tertiary"
                  />
                  <ScoreBar
                    label="Commercial"
                    value={opportunity.score_commercial}
                    tone="tertiary"
                  />
                </div>

                {/* What to build */}
                <div className="glass-card rounded-xl p-sm">
                  <p className="font-label-sm text-label-sm text-secondary uppercase mb-xs">
                    What to Build
                  </p>
                  <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                    {opportunity.what_to_build}
                  </p>
                </div>

                {/* Suggested prompt */}
                <div>
                  <div className="font-label-sm text-[10px] uppercase tracking-widest text-outline mb-xs">
                    Suggested prompt
                  </div>
                  <p className="rounded-lg bg-surface-container p-sm font-body-md text-sm text-on-surface-variant">
                    What is the fastest validation plan for this opportunity?
                  </p>
                </div>
              </>
            ) : (
              <div className="glass-card rounded-xl p-sm">
                <h4 className="font-headline-md font-bold text-on-surface">
                  General Analysis
                </h4>
                <p className="mt-xs font-body-md text-sm text-on-surface-variant">
                  Select an opportunity for richer context, or ask a general
                  product strategy question.
                </p>
              </div>
            )}
          </div>

          {/* Chat input at bottom */}
          <div className="border-t border-outline-variant/10">
            {/* rendered inside ChatWindow below — this is just for sidebar look */}
          </div>
        </aside>

        {/* ── Main chat area ──────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <header className="shrink-0 px-lg py-sm border-b border-outline-variant/20 bg-surface/50 backdrop-blur-md flex items-center gap-sm">
            <Link
              href="/saved"
              className="md:hidden inline-flex items-center gap-xs font-label-md text-label-md text-secondary"
            >
              <ArrowLeft size={14} />
            </Link>
            <span
              className="material-symbols-outlined text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              smart_toy
            </span>
            <h1 className="font-headline-md text-headline-md text-on-surface">
              {opportunity?.title ?? "AI Analyst"}
            </h1>
          </header>

          {/* Chat window */}
          <div className="flex-1 overflow-hidden p-md flex flex-col">
            <ChatWindow
              messages={messages}
              loading={chatLoading}
              onSend={sendMessage}
            />
          </div>
        </main>
      </div>
    </AppShell>
  );
}
