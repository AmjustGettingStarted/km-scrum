import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTaskByIdAction } from "@/services/task.service";
import { getSessionFromCookies } from "@/lib/auth/session";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskHistoryTimeline } from "@/components/tasks/TaskHistoryTimeline";
import { AttachmentUploader } from "@/components/files/AttachmentUploader";
import { formatDate } from "@/lib/utils";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

async function TaskDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [task, session] = await Promise.all([
    getTaskByIdAction(id).catch(() => null),
    getSessionFromCookies(),
  ]);

  if (!task) {
    notFound();
  }

  const priorityVariant =
    task.priority === "CRITICAL"
      ? "danger"
      : task.priority === "HIGH"
      ? "warning"
      : task.priority === "MEDIUM"
      ? "blue"
      : "outline";

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-steel hover:text-charcoal transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to task board
        </Link>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-base font-semibold text-charcoal">{task.task_code}</span>
            <Badge variant="outline">{task.status.replace("_", " ")}</Badge>
            <Badge variant={priorityVariant}>{task.priority}</Badge>
          </div>
        </div>

        <h1 className="text-2xl font-medium tracking-tight text-charcoal mt-2">
          {task.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details (Description & Instructions) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-ash/60">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-steel">
                Description & Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-charcoal leading-relaxed whitespace-pre-wrap">
              {task.description}
            </CardContent>
          </Card>

          {/* Mandatory Status History Timeline */}
          <Card>
            <CardHeader className="pb-3 border-b border-ash/60">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-steel">
                Status History & Explanations ({task.status_history.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <TaskHistoryTimeline history={task.status_history} />
            </CardContent>
          </Card>

          {/* Task Attachments (Images, Videos, APK, Logs) */}
          <Card>
            <CardHeader className="pb-3 border-b border-ash/60">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-steel">
                Task Attachments & Builds
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <AttachmentUploader
                taskId={task.id}
                initialAttachments={task.attachments?.map((a: any) => ({
                  ...a,
                  file_size: Number(a.file_size),
                }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Metadata */}
        <div className="space-y-4">
          <Card className="space-y-4 text-xs">
            <div>
              <span className="text-fog font-medium block mb-1">Assigned Developer</span>
              {task.assigned_to ? (
                <div className="flex items-center gap-2 text-charcoal font-medium">
                  <div className="w-6 h-6 rounded-full bg-paper-mist border border-ash flex items-center justify-center font-semibold text-[10px]">
                    {task.assigned_to.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span>{task.assigned_to.full_name}</span>
                </div>
              ) : (
                <span className="text-fog italic">Unassigned</span>
              )}
            </div>

            <div className="border-t border-ash/60 pt-3">
              <span className="text-fog font-medium block mb-1">Scheduled Date</span>
              <div className="flex items-center gap-1.5 text-charcoal font-medium">
                <Calendar className="w-3.5 h-3.5 text-steel" />
                <span>{formatDate(task.scheduled_date)}</span>
              </div>
            </div>

            {task.due_date && (
              <div className="border-t border-ash/60 pt-3">
                <span className="text-fog font-medium block mb-1">Due Date</span>
                <div className="flex items-center gap-1.5 text-charcoal font-medium">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>{formatDate(task.due_date)}</span>
                </div>
              </div>
            )}

            <div className="border-t border-ash/60 pt-3">
              <span className="text-fog font-medium block mb-1">Created By</span>
              <span className="text-steel font-medium">
                {task.created_by.full_name} ({formatDate(task.created_at)})
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TaskDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      <div className="h-6 w-32 bg-paper-mist rounded-inputs"></div>
      <div className="h-8 w-80 bg-paper-mist rounded-inputs"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-64 bg-paper-mist rounded-cards"></div>
        <div className="h-64 bg-paper-mist rounded-cards"></div>
      </div>
    </div>
  );
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  return (
    <Suspense fallback={<TaskDetailSkeleton />}>
      <TaskDetailContent params={params} />
    </Suspense>
  );
}
