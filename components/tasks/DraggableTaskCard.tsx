"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "@/components/tasks/TaskCard";
import type { BoardTask } from "@/components/tasks/TaskBoardView";
import { GripVertical } from "lucide-react";

interface DraggableTaskCardProps {
  task: BoardTask;
  onOpenStatusModal?: (task: BoardTask) => void;
  isDragDisabled?: boolean;
}

export function DraggableTaskCard({
  task,
  onOpenStatusModal,
  isDragDisabled = false,
}: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/drag">
      {!isDragDisabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3.5 right-11 p-1 text-fog hover:text-charcoal cursor-grab active:cursor-grabbing opacity-0 group-hover/drag:opacity-100 transition-opacity z-10"
          title="Drag to reorder or move status"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      )}
      <TaskCard task={task} onOpenStatusModal={onOpenStatusModal} />
    </div>
  );
}
