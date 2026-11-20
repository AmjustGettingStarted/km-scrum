import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock, Check, UserCheck } from "lucide-react";
import type { TaskPriority, TaskStatus } from "@prisma/client";

interface DailyPlanningViewProps {
  data: any;
}

export function DailyPlanningView({ data }: DailyPlanningViewProps) {
  // If Developer View
  if (data.role === "DEVELOPER") {
    const { tasks, metrics } = data;

    return (
      <div className="space-y-6">
        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <Card className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-fog block mb-1">
              Today&apos;s Tasks
            </span>
            <span className="text-2xl font-semibold text-charcoal">{metrics.total}</span>
          </Card>
          <Card className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
              In Progress
            </span>
            <span className="text-2xl font-semibold text-charcoal">{metrics.inProgress}</span>
          </Card>
          <Card className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 block mb-1">
              Completed
            </span>
            <span className="text-2xl font-semibold text-charcoal">{metrics.completed}</span>
          </Card>
          <Card className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 block mb-1">
              Pending / Blocked
            </span>
            <span className="text-2xl font-semibold text-charcoal">{metrics.pending}</span>
          </Card>
        </div>

        {/* Task List for Selected Date */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-ash bg-paper-mist/40 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-charcoal">
              Assigned Tasks ({tasks.length})
            </h3>
            <span className="text-xs text-steel">Date: {data.selectedDate}</span>
          </div>

          <div className="divide-y divide-ash">
            {tasks.length === 0 ? (
              <div className="py-12 text-center text-sm text-fog italic">
                No tasks scheduled for this day. Enjoy your day or notify your Scrum Master!
              </div>
            ) : (
              tasks.map((task: any) => {
                const priorityVariant =
                  task.priority === "CRITICAL"
                    ? "danger"
                    : task.priority === "HIGH"
                    ? "warning"
                    : task.priority === "MEDIUM"
                    ? "blue"
                    : "outline";

                return (
                  <div
                    key={task.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-paper-mist/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="font-mono text-xs font-semibold text-charcoal hover:text-electric-blue transition-colors"
                        >
                          {task.task_code}
                        </Link>
                        <Badge variant={priorityVariant} className="text-[10px]">
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {task.status.replace("_", " ")}
                        </Badge>
                        {task.isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-tags font-semibold">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                      </div>
                      <Link href={`/tasks/${task.id}`}>
                        <h4 className="text-sm font-medium text-charcoal hover:text-electric-blue transition-colors">
                          {task.title}
                        </h4>
                      </Link>
                    </div>

                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-xs font-medium text-electric-blue hover:underline shrink-0"
                    >
                      View task &rarr;
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Scrum Master & Manager Team Breakdown View
  const { developerWorkload, summary, unassignedTasks } = data;

  return (
    <div className="space-y-6">
      {/* Team Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-fog block mb-1">
            Active Developers
          </span>
          <span className="text-2xl font-semibold text-charcoal">{summary.totalDevelopers}</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-fog block mb-1">
            Total Scheduled Tasks
          </span>
          <span className="text-2xl font-semibold text-charcoal">{summary.totalScheduledTasks}</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 block mb-1">
            Developers with 0 Tasks
          </span>
          <span className="text-2xl font-semibold text-charcoal">
            {summary.unassignedDevsCount}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-600 block mb-1">
            Overloaded Developers (&ge;5)
          </span>
          <span className="text-2xl font-semibold text-charcoal">
            {summary.overloadedDevsCount}
          </span>
        </Card>
      </div>

      {/* Developer Workload Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider">
          Developer Workload Distribution
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {developerWorkload.map((item: any) => (
            <Card key={item.developer.id} className="p-4">
              <div className="flex items-center justify-between pb-3 border-b border-ash/60 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-paper-mist border border-ash flex items-center justify-center font-semibold text-xs text-charcoal">
                    {item.developer.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-charcoal block leading-tight">
                      {item.developer.full_name}
                    </span>
                    <span className="text-[11px] text-fog leading-tight">
                      @{item.developer.username}
                    </span>
                  </div>
                </div>

                <div>
                  {item.hasNoTasks ? (
                    <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-tags">
                      No tasks scheduled
                    </span>
                  ) : item.isOverloaded ? (
                    <span className="text-[11px] font-medium text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-tags">
                      Overloaded ({item.totalTasks} tasks)
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-tags">
                      {item.totalTasks} {item.totalTasks === 1 ? "task" : "tasks"}
                    </span>
                  )}
                </div>
              </div>

              {/* Task list preview */}
              <div className="space-y-2">
                {item.tasks.length === 0 ? (
                  <p className="text-xs text-fog italic py-2">
                    No tasks assigned for this date.
                  </p>
                ) : (
                  item.tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between text-xs p-2 rounded-inputs bg-paper-mist/40 hover:bg-paper-mist border border-ash/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="font-mono text-[11px] font-semibold text-charcoal hover:underline"
                        >
                          {task.task_code}
                        </Link>
                        <span className="truncate text-charcoal">{task.title}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
