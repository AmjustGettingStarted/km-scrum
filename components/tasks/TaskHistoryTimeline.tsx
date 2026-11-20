import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { ArrowRight, History } from "lucide-react";
import type { TaskStatus } from "@prisma/client";

interface TaskHistoryTimelineProps {
  history: {
    id: string;
    previous_status: TaskStatus;
    new_status: TaskStatus;
    reason: string;
    created_at: Date | string;
    changed_by: {
      id: string;
      full_name: string;
      username: string;
    };
  }[];
}

export function TaskHistoryTimeline({ history }: TaskHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-fog border border-dashed border-ash rounded-cards">
        <History className="w-5 h-5 mx-auto mb-2 text-fog/70" />
        No status transitions recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-ash">
      {history.map((record) => (
        <div key={record.id} className="relative group text-left">
          {/* Timeline Dot */}
          <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-paper-mist border-2 border-electric-blue"></span>

          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <Badge variant="outline" className="text-[10px]">
              {record.previous_status.replace("_", " ")}
            </Badge>
            <ArrowRight className="w-3 h-3 text-fog" />
            <Badge variant="default" className="text-[10px] font-semibold">
              {record.new_status.replace("_", " ")}
            </Badge>

            <span className="text-xs text-steel">by {record.changed_by.full_name}</span>
            <span className="text-[11px] text-fog">&bull; {formatDateTime(record.created_at)}</span>
          </div>

          <div className="p-3 rounded-cards bg-paper-mist/70 border border-ash/60 text-xs text-charcoal">
            <span className="font-medium text-steel block mb-0.5">Explanation:</span>
            <p className="whitespace-pre-wrap">{record.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
