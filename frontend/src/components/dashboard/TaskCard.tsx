import { Play, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatInterval } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onRun: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskCard({ task, onRun, onDelete }: TaskCardProps) {
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
        <Button variant="primary" onClick={() => onRun(task.id)} className="flex-1">
          <Play size={15} />
          Run now
        </Button>
        <Button
          variant="ghost"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          <Trash2 size={15} />
        </Button>
      </div>
    </article>
  );
}
