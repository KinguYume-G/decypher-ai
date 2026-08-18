"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Pause, Play, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatInterval } from "@/lib/utils";
import { taskAPI } from "@/lib/api";
import type { AnalysisRun, SourceItem, Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onRun: (id: number) => void;
  onDelete: (id: number) => void;
  onToggle: (task: Task) => void;
}

export function TaskCard({ task, onRun, onDelete, onToggle }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [items, setItems] = useState<SourceItem[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const toggleDetails = async () => {
    const next = !expanded;
    setExpanded(next);
    if (!next || runs.length > 0 || detailsLoading) return;
    setDetailsLoading(true);
    try {
      const [runsResponse, itemsResponse] = await Promise.all([
        taskAPI.runs(task.id),
        taskAPI.items(task.id),
      ]);
      setRuns(runsResponse.data.data ?? []);
      setItems(itemsResponse.data.data ?? []);
    } finally {
      setDetailsLoading(false);
    }
  };
  const tonemap: Record<Task["status"], "primary" | "success" | "muted" | "danger" | "warning"> = {
    pending:   "muted",
    running:   "primary",   // secondary-fixed purple
    completed: "success",   // tertiary-fixed cyan
    failed:    "danger",
    paused:    "warning",
  };

  return (
    <article className="glass-card rounded-xl p-md hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-sm">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline-md text-headline-md text-on-surface truncate">
            {task.name}
          </h3>
          <p className="mt-xs font-body-md text-sm text-on-surface-variant">
            Every {formatInterval(task.interval_seconds)} · {task.run_count} runs
          </p>
        </div>
        <Badge tone={tonemap[task.status]}>{task.status}</Badge>
      </div>

      {/* Keyword chips */}
      <div className="mt-sm flex flex-wrap gap-xs">
        {task.keywords.map((kw) => (
          <Badge key={kw} tone="muted">
            {kw}
          </Badge>
        ))}
      </div>

      {/* Metadata grid */}
      <div className="mt-md grid grid-cols-2 gap-sm rounded-lg bg-surface-container p-sm text-sm">
        <div>
          <div className="font-label-sm text-[10px] uppercase text-outline">Sources</div>
          <div className="mt-xs text-on-surface">{task.sources.join(", ")}</div>
        </div>
        <div>
          <div className="font-label-sm text-[10px] uppercase text-outline">Last run</div>
          <div className="mt-xs text-on-surface">{formatDate(task.last_run_at)}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-md flex items-center gap-sm">
        <Button
          variant="primary"
          onClick={() => onRun(task.id)}
          className="flex-1"
          disabled={!task.is_active || task.status === "running"}
        >
          <Play size={15} />
          Run now
        </Button>
        <Button
          variant="ghost"
          onClick={() => onToggle(task)}
          aria-label={task.is_active ? "Pause task" : "Resume task"}
        >
          {task.is_active ? <Pause size={15} /> : <Play size={15} />}
        </Button>
        <Button variant="ghost" onClick={() => void toggleDetails()} aria-label="Show run history">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </Button>
        <Button
          variant="ghost"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          <Trash2 size={15} />
        </Button>
      </div>

      {expanded && (
        <div className="mt-md space-y-sm border-t border-outline-variant/30 pt-md">
          {detailsLoading ? (
            <p className="text-xs text-on-surface-variant">Loading run history…</p>
          ) : (
            <>
              <div>
                <p className="font-label-sm text-[10px] uppercase text-outline">Recent runs</p>
                {runs.length === 0 ? (
                  <p className="mt-xs text-xs text-on-surface-variant">No recorded runs yet.</p>
                ) : runs.slice(0, 5).map((run) => (
                  <div key={run.id} className="mt-xs flex items-center justify-between text-xs">
                    <span className="text-on-surface">{run.status} · {run.trigger}</span>
                    <span className="text-outline">{run.collected_count} signals · {run.opportunity_count} cards</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="font-label-sm text-[10px] uppercase text-outline">Latest sources</p>
                {items.slice(0, 3).map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-xs block truncate text-xs text-secondary hover:underline"
                  >
                    {item.source} · {item.title}
                  </a>
                ))}
                {items.length === 0 && <p className="mt-xs text-xs text-on-surface-variant">No stored sources yet.</p>}
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}
