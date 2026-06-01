"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { TaskCategory, TaskCreate } from "@/types";

interface CreateTaskModalProps {
  onCreate: (payload: TaskCreate) => Promise<unknown>;
}

// 每个模块推荐的默认数据源（与后端 CATEGORY_DEFAULT_SOURCES 对应）
const CATEGORY_SOURCES: Record<TaskCategory, { id: string; label: string; free?: boolean }[]> = {
  startup:  [
    { id: "github",      label: "GitHub",       free: true },
    { id: "hackernews",  label: "Hacker News",  free: true },
    { id: "devto",       label: "DEV.to",       free: true },
    { id: "producthunt", label: "Product Hunt", free: false },
  ],
  market:   [
    { id: "github",      label: "GitHub",       free: true },
    { id: "hackernews",  label: "Hacker News",  free: true },
    { id: "devto",       label: "DEV.to",       free: true },
    { id: "producthunt", label: "Product Hunt", free: false },
  ],
  research: [
    { id: "arxiv",       label: "arXiv",        free: true },
    { id: "openalex",    label: "OpenAlex",     free: true },
    { id: "github",      label: "GitHub",       free: true },
    { id: "hackernews",  label: "Hacker News",  free: true },
  ],
  stocks:   [
    { id: "sec",         label: "SEC EDGAR",    free: true },
    { id: "hackernews",  label: "Hacker News",  free: true },
    { id: "github",      label: "GitHub",       free: true },
  ],
  jobs:     [
    { id: "stackexchange", label: "Stack Overflow",  free: true },
    { id: "remoteok",      label: "Remote OK",       free: true },
    { id: "github",        label: "GitHub",           free: true },
    { id: "devto",         label: "DEV.to",           free: true },
  ],
};

const CATEGORIES: { id: TaskCategory; label: string; icon: string }[] = [
  { id: "startup",  label: "Startup",  icon: "rocket_launch" },
  { id: "market",   label: "Market",   icon: "trending_up" },
  { id: "research", label: "Research", icon: "science" },
  { id: "stocks",   label: "News",     icon: "candlestick_chart" },
  { id: "jobs",     label: "Careers",  icon: "work" },
];

export function CreateTaskModal({ onCreate }: CreateTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState<TaskCategory>("startup");
  const [sources, setSources] = useState<string[]>(["github", "hackernews"]);
  const [interval, setInterval] = useState("3600");
  const [loading, setLoading] = useState(false);

  const availableSources = CATEGORY_SOURCES[category];

  const handleCategoryChange = (cat: TaskCategory) => {
    setCategory(cat);
    // 切换模块时重置为该模块前两个默认数据源
    const defaults = CATEGORY_SOURCES[cat].slice(0, 2).map((s) => s.id);
    setSources(defaults);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onCreate({
        name,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        sources,
        interval_seconds: Number(interval),
        category,
      });
      setName("");
      setKeywords("");
      setSources(["github", "hackernews"]);
      setCategory("startup");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        New task
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="glass-panel w-full max-w-xl rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-headline-md text-xl text-on-surface">Create monitoring task</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Track one market question per task with focused keywords.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/5">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              <Input
                label="Task name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="AI agent developer tools"
                required
              />

              {/* 模块选择 */}
              <div>
                <div className="mb-2 font-label-sm text-xs uppercase tracking-widest text-primary-fixed-dim">
                  Module
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs transition-colors ${
                        category === cat.id
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/5 text-on-surface-variant hover:border-white/20"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Keywords (comma-separated)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={
                  category === "research"
                    ? "large language models, in-context learning"
                    : category === "stocks"
                    ? "artificial intelligence, cloud infrastructure"
                    : category === "jobs"
                    ? "rust, webassembly, systems programming"
                    : "ai agent, llm ops, evals"
                }
                required
              />

              {/* 数据源（按模块动态切换） */}
              <div>
                <div className="mb-2 font-label-sm text-xs uppercase tracking-widest text-primary-fixed-dim">
                  Data sources
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableSources.map((src) => {
                    const selected = sources.includes(src.id);
                    return (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() =>
                          setSources((items) =>
                            selected ? items.filter((i) => i !== src.id) : [...items, src.id]
                          )
                        }
                        className={`rounded-lg border px-3 py-2.5 text-sm transition-colors text-left flex items-center justify-between gap-2 ${
                          selected
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-white/10 bg-white/5 text-on-surface-variant hover:border-white/20"
                        }`}
                      >
                        <span>{src.label}</span>
                        {src.free === true && (
                          <span className="text-[10px] font-bold text-green-400 opacity-70">FREE</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {category === "stocks" && (
                  <p className="mt-2 text-xs text-outline">
                    ⚠️ SEC data is for research only — not investment advice.
                  </p>
                )}
              </div>

              <label className="block space-y-2">
                <span className="font-label-sm text-xs uppercase tracking-widest text-primary-fixed-dim">
                  Frequency
                </span>
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="h-11 w-full rounded-lg border border-white/10 bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                >
                  <option value="900">Every 15 minutes</option>
                  <option value="3600">Hourly</option>
                  <option value="43200">Every 12 hours</option>
                  <option value="86400">Daily</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} disabled={!sources.length}>
                Create task
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
