import { Suspense } from "react";
import { getTasksAction } from "@/services/task.service";
import { getUsersAction } from "@/services/user.service";
import { getSessionFromCookies } from "@/lib/auth/session";
import { TaskBoardView } from "@/components/tasks/TaskBoardView";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { KanbanSquare } from "lucide-react";

async function TaskBoardContent() {
  const [tasks, users, session] = await Promise.all([
    getTasksAction().catch(() => []),
    getUsersAction().catch(() => []),
    getSessionFromCookies(),
  ]);

  const developers = users.filter((u) => u.role === "DEVELOPER" && u.is_active);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-tags mb-1.5 font-medium">
            <KanbanSquare className="w-3.5 h-3.5" />
            6-Status Task Board
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-charcoal">Workspace Tasks</h1>
          <p className="text-sm text-steel mt-0.5">
            {session?.user.role === "DEVELOPER"
              ? "Viewing tasks assigned to you. Every status change requires a mandatory explanation."
              : "Track all team tasks, manage status transitions, and unblock developers."}
          </p>
        </div>

        {session?.user.role !== "DEVELOPER" && (
          <CreateTaskModal developers={developers} />
        )}
      </div>

      <TaskBoardView
        tasks={tasks}
        userRole={session?.user.role}
      />
    </>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-210px)]">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="w-72 shrink-0 h-96 rounded-cards bg-paper-mist/40 border border-ash p-3 animate-pulse"></div>
      ))}
    </div>
  );
}

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <Suspense fallback={<BoardSkeleton />}>
        <TaskBoardContent />
      </Suspense>
    </div>
  );
}
