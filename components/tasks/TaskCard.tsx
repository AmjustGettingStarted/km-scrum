import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Calendar, User } from "lucide-react";
import type { TaskPriority, TaskStatus } from "@prisma/client";

interface TaskCardProps {
  task: {
    id: string;
    task_code: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    scheduled_date: Date | string;
    assigned_to?: {
      id: string;
      full_name: string;
    } | null;
  };
  onOpenStatusModal?: (task: TaskCardProps["task"]) => void;
}

export function TaskCard({ task, onOpenStatusModal }: TaskCardProps) {
  const priorityVariant =
    task.priority === "CRITICAL"
      ? "danger"
      : task.priority === "HIGH"
      ? "warning"
      : task.priority === "MEDIUM"
      ? "blue"
      : "outline";

  return (
    <div className="rounded-cards border border-ash bg-canvas-white shadow-subtle p-3.5 hover:border-smoke transition-all group select-none">
      <div className="flex items-center justify-between gap-2 mb-2">
        <Link
          href={`/tasks/${task.id}`}
          className="font-mono text-xs font-semibold text-charcoal hover:text-electric-blue transition-colors"
        >
          {task.task_code}
        </Link>
        <Badge variant={priorityVariant} className="text-[10px] px-2 py-0">
          {task.priority}
        </Badge>
      </div>

      <Link href={`/tasks/${task.id}`} className="block">
        <h4 className="text-sm font-medium text-charcoal leading-snug line-clamp-2 group-hover:text-electric-blue transition-colors mb-2.5">
          {task.title}
        </h4>
      </Link>

      <div className="flex items-center justify-between pt-2.5 border-t border-ash/60 text-xs text-steel">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-fog" />
          <span className="text-[11px]">{formatDate(task.scheduled_date)}</span>
        </div>

        {task.assigned_to ? (
          <div className="flex items-center gap-1.5" title={`Assigned to ${task.assigned_to.full_name}`}>
            <div className="w-5 h-5 rounded-full bg-paper-mist border border-ash flex items-center justify-center text-[10px] font-semibold text-charcoal">
              {task.assigned_to.full_name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] max-w-[80px] truncate">{task.assigned_to.full_name}</span>
          </div>
        ) : (
          <span className="text-[11px] text-fog italic">Unassigned</span>
        )}
      </div>

      {onOpenStatusModal && (
        <div className="mt-2.5 pt-2 border-t border-ash/40 flex justify-end">
          <button
            type="button"
            onClick={() => onOpenStatusModal(task)}
            className="text-[11px] font-medium text-electric-blue hover:underline cursor-pointer"
          >
            Update status &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
