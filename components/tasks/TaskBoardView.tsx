"use client";

import { useState } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { DraggableTaskCard } from "@/components/tasks/DraggableTaskCard";
import { TaskCard } from "@/components/tasks/TaskCard";
import { StatusChangeModal } from "@/components/tasks/StatusChangeModal";
import { reorderTaskAction } from "@/services/task.service";
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
  order_index?: number;
  assigned_to?: {
    id: string;
    full_name: string;
  } | null;
}

interface TaskBoardViewProps {
  tasks: BoardTask[];
  userRole?: "MANAGER" | "SCRUM_MASTER" | "DEVELOPER";
}

function DroppableColumn({
  column,
  tasks,
  onOpenStatusModal,
  isDragDisabled,
}: {
  column: typeof COLUMNS[0];
  tasks: BoardTask[];
  onOpenStatusModal: (task: BoardTask) => void;
  isDragDisabled: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: column.key,
  });

  return (
    <div
      ref={setNodeRef}
      className="w-72 shrink-0 flex flex-col rounded-cards bg-paper-mist/50 border border-ash p-3 select-none"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1.5 pb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${column.accentColor}`}></span>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
            {column.label}
          </h3>
        </div>
        <span className="text-xs font-medium text-fog px-1.5 py-0.5 rounded-tags bg-canvas-white border border-ash/60">
          {tasks.length}
        </span>
      </div>

      {/* Task Cards Container */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[120px]">
          {tasks.length === 0 ? (
            <div className="h-24 rounded-inputs border border-dashed border-ash/80 flex items-center justify-center text-xs text-fog italic">
              Drop tasks here
            </div>
          ) : (
            tasks.map((task) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                onOpenStatusModal={onOpenStatusModal}
                isDragDisabled={isDragDisabled}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function TaskBoardView({ tasks, userRole = "DEVELOPER" }: TaskBoardViewProps) {
  const [activeTaskForModal, setActiveTaskForModal] = useState<BoardTask | null>(null);
  const [targetStatusPreselected, setTargetStatusPreselected] = useState<TaskStatus | undefined>(undefined);
  const [activeDragItem, setActiveDragItem] = useState<BoardTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const allowedTargetStatuses: TaskStatus[] | undefined =
    userRole === "DEVELOPER"
      ? ["TO_DO", "IN_PROGRESS", "PENDING", "TESTING"]
      : undefined;

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveDragItem(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceTask = tasks.find((t) => t.id === activeId);
    if (!sourceTask) return;

    // Check if dropped directly on a column
    let destinationStatus: TaskStatus | null = null;
    const isColumn = COLUMNS.some((col) => col.key === overId);

    if (isColumn) {
      destinationStatus = overId as TaskStatus;
    } else {
      // Dropped on another task card; look up that task's status
      const targetTask = tasks.find((t) => t.id === overId);
      if (targetTask) {
        destinationStatus = targetTask.status;
      }
    }

    if (!destinationStatus) return;

    // If destination status is DIFFERENT from source task status:
    // INTERCEPT: Do not commit to DB immediately!
    // Open the mandatory explanation dialog pre-selected with the target status.
    if (destinationStatus !== sourceTask.status) {
      // If developer is dropping into RELEASED or COMPLETED, block early
      if (
        userRole === "DEVELOPER" &&
        (destinationStatus === "RELEASED" || destinationStatus === "COMPLETED")
      ) {
        alert("Marking tasks as Released or Completed requires Scrum Master or Manager approval.");
        return;
      }

      setTargetStatusPreselected(destinationStatus);
      setActiveTaskForModal(sourceTask);
      return;
    }

    // If dropped in the SAME column, handle reordering persistence
    const columnTasks = tasks.filter((t) => t.status === sourceTask.status);
    const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
    const newIndex = columnTasks.findIndex((t) => t.id === overId);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      // Calculate fractional order index
      let newOrderIndex = 1000.0;
      if (newIndex === 0) {
        newOrderIndex = (columnTasks[0].order_index ?? 1000) / 2;
      } else if (newIndex === columnTasks.length - 1) {
        newOrderIndex = (columnTasks[columnTasks.length - 1].order_index ?? 1000) + 1000;
      } else {
        const prev = columnTasks[newIndex].order_index ?? 1000;
        const next = columnTasks[newIndex + 1]?.order_index ?? prev + 1000;
        newOrderIndex = (prev + next) / 2;
      }

      await reorderTaskAction(activeId, newOrderIndex);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-210px)] select-none">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);

            return (
              <DroppableColumn
                key={col.key}
                column={col}
                tasks={colTasks}
                onOpenStatusModal={(t) => {
                  setTargetStatusPreselected(undefined);
                  setActiveTaskForModal(t);
                }}
                isDragDisabled={false}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeDragItem ? (
            <div className="w-64 rotate-1 opacity-90 shadow-md">
              <TaskCard task={activeDragItem} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <StatusChangeModal
        task={activeTaskForModal}
        isOpen={Boolean(activeTaskForModal)}
        onClose={() => {
          setActiveTaskForModal(null);
          setTargetStatusPreselected(undefined);
        }}
        allowedTargetStatuses={
          targetStatusPreselected ? [targetStatusPreselected] : allowedTargetStatuses
        }
      />
    </>
  );
}
