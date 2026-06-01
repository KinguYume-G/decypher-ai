"use client";

import { X, Zap } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function UpgradePromptModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
          <Zap size={22} className="text-amber-500" />
        </div>

        <h2 className="text-lg font-bold text-on-surface mb-2">
          Unlock unlimited signals
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
          Free plan shows the top 6 AI-curated signals per category. Upgrade to Pro and
          Decypher will crawl more sources, generate deeper analysis, and surface signals
          your competitors miss.
        </p>

        <div className="space-y-2 mb-5">
          {[
            "Unlimited signal crawling across 13+ sources",
            "Higher crawl frequency (every hour vs. daily)",
            "Full report generation per signal",
            "Priority AI Analyst with RAG search",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="text-xs text-on-surface">{item}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 transition-colors"
        >
          Upgrade to Pro
        </button>
        <button
          onClick={onClose}
          className="w-full mt-2 py-2 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
