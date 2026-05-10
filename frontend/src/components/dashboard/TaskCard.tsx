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
  const tone = {
    pending: "muted",
    running: "secondary",
    completed: "success",
    failed: "danger",
    paused: "warning",
  } as const;

  return (
    <article className="glass-panel rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-headline-md text-lg text-on-surface">{task.name}</h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Every {formatInterval(task.interval_seconds)} · {task.run_count} runs
          </p>
        </div>
        <Badge tone={tone[task.status]}>{task.status}</Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {task.keywords.map((keyword) => (
          <Badge key={keyword} tone="primary">
            {keyword}
          </Badge>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg bg-black/20 p-3 text-sm">
        <div>
          <div className="font-label-sm text-[10px] uppercase text-outline">Sources</div>
          <div className="mt-1 text-on-surface">{task.sources.join(", ")}</div>
        </div>
        <div>
          <div className="font-label-sm text-[10px] uppercase text-outline">Last run</div>
          <div className="mt-1 text-on-surface">{formatDate(task.last_run_at)}</div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Button variant="secondary" onClick={() => onRun(task.id)} className="flex-1">
          <Play size={16} />
          Run
        </Button>
        <Button variant="ghost" onClick={() => onDelete(task.id)} aria-label="Delete task">
          <Trash2 size={16} />
        </Button>
      </div>
    </article>
  );
}
