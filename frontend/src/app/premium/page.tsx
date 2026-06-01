"use client";

import AppShell from "@/components/layout/AppShell";
import { Zap, Check } from "lucide-react";

const FEATURES = [
  "Unlimited signal crawling across 13+ data sources",
  "Hourly crawl frequency (vs. daily on Free)",
  "Full AI report generation per signal",
  "Priority AI Analyst with RAG-powered context search",
  "Chat history persistence across sessions",
  "Email digest — weekly intelligence summary",
];

export default function PremiumPage() {
  return (
    <AppShell>
      <main className="px-6 py-12 max-w-2xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Zap size={26} className="text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-on-surface mb-3">Decypher Pro</h1>
          <p className="text-on-surface-variant max-w-md mx-auto">
            Unlock the full power of the intelligence engine. Crawl more, analyze deeper, decide faster.
          </p>
        </div>

        <div className="bg-white border border-outline-variant/40 rounded-2xl p-8 shadow-sm">
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-black text-on-surface">$29</span>
            <span className="text-on-surface-variant">/month</span>
          </div>

          <ul className="space-y-3 mb-8">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <Check size={16} className="text-secondary mt-0.5 shrink-0" />
                <span className="text-sm text-on-surface">{f}</span>
              </li>
            ))}
          </ul>

          <button className="w-full py-3 rounded-xl bg-secondary text-white font-semibold hover:bg-secondary/90 transition-colors">
            Upgrade to Pro
          </button>
          <p className="text-xs text-center text-outline mt-3">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
