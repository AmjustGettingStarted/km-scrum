"use client";

import { useState } from "react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { StatusChangeModal } from "@/components/tasks/StatusChangeModal";
import type { TaskPriority, TaskStatus } from "@prisma/client";

const COLUMNS: { key: TaskStatus; label: string; accentColor: string }[] = [
  { key: "TO_DO", label: "To Do", accentColor: "bg-steel" },
  { key: "IN_PROGRESS", label: "In Progress", accentColor: "bg-electric-blue" },
  { key: "PENDING", label: "Pending", accentColor: "bg-amber-500" },
  { key: "TESTING", label: "Testing", accentColor: "bg-purple-600" },
  { key: "RELEASED", label: "Released", accentColor: "bg-indigo-600" },
  { key: "COMPLETED", label: "Completed", accentColor: "bg-emerald-600" },
];

export interface BoardTask {
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
}

interface TaskBoardViewProps {
  tasks: BoardTask[];
  userRole?: "MANAGER" | "SCRUM_MASTER" | "DEVELOPER";
}

export function TaskBoardView({ tasks, userRole = "DEVELOPER" }: TaskBoardViewProps) {
  const [activeTaskForModal, setActiveTaskForModal] = useState<BoardTask | null>(null);

  // If user is Developer, restrict target statuses from showing RELEASED / COMPLETED directly
  const allowedTargetStatuses: TaskStatus[] | undefined =
    userRole === "DEVELOPER"
      ? ["TO_DO", "IN_PROGRESS", "PENDING", "TESTING"]
      : undefined;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-210px)] select-none">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);

          return (
            <div
              key={col.key}
              className="w-72 shrink-0 flex flex-col rounded-cards bg-paper-mist/50 border border-ash p-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1.5 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.accentColor}`}></span>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                    {col.label}
                  </h3>
                </div>
                <span className="text-xs font-medium text-fog px-1.5 py-0.5 rounded-tags bg-canvas-white border border-ash/60">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Container */}
              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-24 rounded-inputs border border-dashed border-ash/80 flex items-center justify-center text-xs text-fog italic">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onOpenStatusModal={(t) => setActiveTaskForModal(t as BoardTask)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <StatusChangeModal
        task={activeTaskForModal}
        isOpen={Boolean(activeTaskForModal)}
        onClose={() => setActiveTaskForModal(null)}
        allowedTargetStatuses={allowedTargetStatuses}
      />
    </>
  );
}
