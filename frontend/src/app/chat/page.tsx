"use client";

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import AppShell from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ScoreBar } from '@/components/dashboard/ScoreBar';
import { useChat } from '@/hooks/useChat';
import { useOpportunity } from '@/hooks/useOpportunities';

export default function ChatPage() {
  return <ChatExperience />;

  return (
    <AppShell>
      {/* Top App Bar Navigation Shell */}
      <header className="flex justify-between items-center w-full px-margin-desktop h-16 z-40 bg-surface/60 backdrop-blur-xl border-b border-white/10 sticky top-0 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded bg-surface-container-high border border-white/10 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">explore</span>
            <span className="font-label-sm text-on-surface-variant">CONTEXT: QUANTUM LEAP INITIATIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8 text-body-md">
            <span className="text-primary font-bold border-b-2 border-primary py-5">Analysis</span>
            <span className="text-on-surface-variant font-medium hover:text-on-surface cursor-pointer">Simulation</span>
            <span className="text-on-surface-variant font-medium hover:text-on-surface cursor-pointer">Export</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"><span className="material-symbols-outlined">notifications</span></button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"><span className="material-symbols-outlined">settings</span></button>
          </div>
        </div>
      </header>

      {/* Chat Container Grid */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Left Side: Context Details (Persistent Drawer) */}
        <section className="w-80 border-r border-white/10 bg-surface-container-low hidden xl:flex flex-col p-6 overflow-y-auto custom-scrollbar">
          <h3 className="font-display-xl text-headline-md font-bold text-primary mb-6">Opportunity Meta</h3>
          <div className="space-y-6">
            <div className="glass-panel rounded-xl p-4">
              <div className="text-[10px] font-label-sm text-primary mb-2 uppercase tracking-tighter">Current Phase</div>
              <div className="flex items-center gap-2 text-on-surface">
                <span className="w-2 h-2 rounded-full bg-primary ai-pulse-dot"></span>
                <span className="font-headline-md text-sm ml-2">Deep Feature Extraction</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-label-sm text-xs text-on-surface-variant uppercase">Key Parameters</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-high border border-white/5">
                  <span className="text-xs text-on-surface-variant">Sentiment Score</span>
                  <span className="font-label-sm text-primary">0.94</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-high border border-white/5">
                  <span className="text-xs text-on-surface-variant">Volatility Index</span>
                  <span className="font-label-sm text-tertiary">Medium</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-high border border-white/5">
                  <span className="text-xs text-on-surface-variant">Market Alignment</span>
                  <span className="font-label-sm text-secondary">88%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-label-sm text-xs text-on-surface-variant uppercase">Attached Documents</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-primary text-lg">description</span>
                  <span className="text-sm truncate">Market_Analysis_Q4.pdf</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors">
                  <span className="material-symbols-outlined text-primary text-lg">data_table</span>
                  <span className="text-sm truncate">User_Growth_Metrics.csv</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Center: Message Thread */}
        <section className="flex-1 flex flex-col relative bg-surface-dim">
          <div className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-12 custom-scrollbar pb-40">
            {/* AI Message */}
            <div className="flex gap-6 max-w-6xl">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
              </div>
              <div className="space-y-4 flex-1">
                <div className="text-[10px] font-label-sm text-primary tracking-widest uppercase">Decypher Core</div>
                <div className="text-body-lg text-on-surface leading-relaxed">
                  <p className="mb-4">Analysis of the <span className="text-primary font-semibold">Quantum Leap Initiative</span> reveals a significant 24% divergence in projected cloud scaling costs versus infrastructure readiness.</p>
                  <ul className="list-disc ml-4 space-y-2 text-on-surface-variant">
                    <li>Primary bottleneck: Latency in the edge-node synchronization layer.</li>
                    <li>Opportunity: Reprioritize the "Luminous" protocol deployment to bypass the legacy gateway.</li>
                  </ul>
                  <p className="mt-4">Would you like me to simulate the budgetary impact of a phased protocol roll-out over the next 3 quarters?<span className="ai-cursor"></span></p>
                </div>
              </div>
            </div>

            {/* User Message */}
            <div className="flex justify-end">
              <div className="max-w-2xl glass-panel bg-surface-container-high/50 px-6 py-4 rounded-2xl rounded-tr-none border-white/5">
                <p className="text-body-md text-on-surface">Yes, please simulate the budgetary impact. Specifically focus on how this affects our CapEx for the European expansion next year.</p>
              </div>
            </div>

            {/* AI Message (Streaming/Thinking) */}
            <div className="flex gap-6 max-w-6xl">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
              </div>
              <div className="space-y-4 flex-1">
                <div className="text-[10px] font-label-sm text-primary tracking-widest uppercase">Decypher Core</div>
                <div className="flex items-center gap-4 text-on-surface-variant italic">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="text-xs">Processing financial datasets...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Input Area */}
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 pointer-events-none">
            <div className="max-w-6xl mx-auto glass-panel p-2 rounded-2xl shadow-2xl pointer-events-auto ring-1 ring-white/10">
              <div className="flex flex-col gap-2">
                <textarea className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder-slate-500 custom-scrollbar resize-none p-4 font-body-md min-h-[60px]" placeholder="Deep-dive into the data..." rows={1}></textarea>
                <div className="flex items-center justify-between px-2 pb-2">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all text-on-surface-variant hover:text-primary border border-transparent hover:border-primary/20">
                      <span className="material-symbols-outlined text-sm">attach_file</span>
                      <span className="text-[10px] font-label-sm uppercase">Attach Context</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all text-on-surface-variant hover:text-secondary border border-transparent hover:border-secondary/20">
                      <span className="material-symbols-outlined text-sm">data_object</span>
                      <span className="text-[10px] font-label-sm uppercase">Fetch JSON</span>
                    </button>
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-on-primary" style={{fontVariationSettings: "'FILL' 1"}}>send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: AI Visualizer/Assets */}
        <section className="w-96 border-l border-white/10 bg-surface-container-low hidden 2xl:flex flex-col p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            <div>
              <h4 className="font-label-sm text-xs text-on-surface-variant uppercase mb-4 tracking-wider">Visual Intelligence</h4>
              <div className="aspect-video glass-panel rounded-2xl overflow-hidden relative group">
                <img className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="Abstract flow" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYvx37fQ63St4Aebr_-9uXJwYfA8DyRBY5tRmkRwffRIJqKv7QuQZYyh5pB2QmqladTSCz9_SQ1cSOAmddbXpeb-DEeG4Ubd2DW54Ll9ztUQHXgul25_NV4z-wPCMaZoenEfnYfc_AunAiiBOqJWOBLA_l4rkjaqayhdl55vlYSRdIPMcZ_M5qu71DwV6za-UwndxZ5sot4M1N0hXjXjMRjYjR87LEJHyFocowfbZfL_o4_dr3GlVMPfyJ0mjxQCGjXM69xde81g8"/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
                    <span className="material-symbols-outlined text-white">fullscreen</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-label-sm text-xs text-on-surface-variant uppercase mb-4 tracking-wider">Computed Entities</h4>
              <div className="space-y-3">
                <div className="p-4 glass-panel rounded-xl flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary text-sm">hub</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Edge Cluster A-12</div>
                    <div className="text-xs text-on-surface-variant mt-1">High probability of infrastructure collision in T-minus 48 hours.</div>
                  </div>
                </div>
                <div className="p-4 glass-panel rounded-xl flex items-start gap-4 border-primary/20 bg-primary/5">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Security Protocol Alpha</div>
                    <div className="text-xs text-on-surface-variant mt-1">AI-suggested hardening of the synchronization layer recommended.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-dashed border-white/20">
              <div className="flex flex-col items-center text-center space-y-3">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant opacity-50">analytics</span>
                <h5 className="font-headline-md text-sm">Generate Real-time Projection</h5>
                <p className="text-xs text-on-surface-variant">Create a simulated forecast based on the current chat context.</p>
                <button className="w-full py-2 px-4 rounded-lg bg-surface-container-highest hover:bg-white/10 text-xs font-label-sm transition-all mt-2">INITIALIZE RUN</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function ChatExperience() {
  const searchParams = useSearchParams();
  const opportunityId = Number(searchParams.get('opportunityId') || 0) || undefined;
  const { opportunity, loading } = useOpportunity(opportunityId);
  const { messages, loading: chatLoading, sendMessage } = useChat(opportunityId);

  return (
    <AppShell>
      <main className="grid min-h-screen gap-6 px-5 py-6 md:px-margin-desktop md:py-8 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <Link href="/saved" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft size={16} />
            Opportunities
          </Link>

          <div className="glass-panel rounded-xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <Badge tone="primary">Deep dive</Badge>
            </div>
            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : opportunity ? (
              <div className="space-y-5">
                <div>
                  <h1 className="font-headline-md text-xl text-on-surface">{opportunity.title}</h1>
                  <p className="mt-3 text-sm leading-6 text-on-surface-variant">{opportunity.what_to_build}</p>
                </div>
                <div className="space-y-3">
                  <ScoreBar label="Trend" value={opportunity.score_trend} />
                  <ScoreBar label="Feasibility" value={opportunity.score_feasibility} tone="secondary" />
                  <ScoreBar label="Commercial" value={opportunity.score_commercial} tone="tertiary" />
                </div>
                <div>
                  <div className="font-label-sm text-[10px] uppercase tracking-widest text-outline">Suggested prompt</div>
                  <p className="mt-2 rounded-lg bg-black/20 p-3 text-sm leading-6 text-on-surface-variant">
                    What is the fastest validation plan for this opportunity?
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="font-headline-md text-xl text-on-surface">General analysis</h1>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                  Select an opportunity for richer context, or ask a general product strategy question.
                </p>
              </div>
            )}
          </div>
        </aside>

        <section className="min-w-0">
          <ChatWindow messages={messages} loading={chatLoading} onSend={sendMessage} />
        </section>
      </main>
    </AppShell>
  );
}
