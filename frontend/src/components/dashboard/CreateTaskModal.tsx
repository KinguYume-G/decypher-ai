"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { TaskCreate } from "@/types";

interface CreateTaskModalProps {
  onCreate: (payload: TaskCreate) => Promise<unknown>;
}

const SOURCE_OPTIONS = [
  { id: "github", label: "GitHub" },
  { id: "hackernews", label: "Hacker News" },
  { id: "reddit", label: "Reddit" },
];

export function CreateTaskModal({ onCreate }: CreateTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [sources, setSources] = useState(["github", "hackernews"]);
  const [interval, setInterval] = useState("3600");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onCreate({
        name,
        keywords: keywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        sources,
        interval_seconds: Number(interval),
      });
      setName("");
      setKeywords("");
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
          <form onSubmit={submit} className="glass-panel w-full max-w-xl rounded-xl p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-headline-md text-xl text-on-surface">Create monitoring task</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Track one market question with focused sources and a clear refresh cadence.
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
                onChange={(event) => setName(event.target.value)}
                placeholder="AI agent developer tools"
                required
              />
              <Input
                label="Keywords"
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                placeholder="ai agent, llm ops, evals"
                required
              />

              <div>
                <div className="mb-2 font-label-sm text-xs uppercase tracking-widest text-primary-fixed-dim">
                  Sources
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {SOURCE_OPTIONS.map((source) => {
                    const selected = sources.includes(source.id);
                    return (
                      <button
                        key={source.id}
                        type="button"
                        onClick={() =>
                          setSources((items) =>
                            selected ? items.filter((item) => item !== source.id) : [...items, source.id]
                          )
                        }
                        className={`rounded-lg border px-3 py-3 text-sm transition-colors ${
                          selected
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-white/10 bg-white/5 text-on-surface-variant"
                        }`}
                      >
                        {source.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="font-label-sm text-xs uppercase tracking-widest text-primary-fixed-dim">
                  Frequency
                </span>
                <select
                  value={interval}
                  onChange={(event) => setInterval(event.target.value)}
                  className="h-11 w-full rounded-lg border border-white/10 bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                >
                  <option value="900">Every 15 minutes</option>
                  <option value="3600">Hourly</option>
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
