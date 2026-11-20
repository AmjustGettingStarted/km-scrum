"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { transitionTaskStatusAction } from "@/services/status.service";
import { AlertCircle, ArrowRight } from "lucide-react";
import type { TaskStatus } from "@prisma/client";

const ALL_STATUSES: { key: TaskStatus; label: string }[] = [
  { key: "TO_DO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "PENDING", label: "Pending" },
  { key: "TESTING", label: "Testing" },
  { key: "RELEASED", label: "Released" },
  { key: "COMPLETED", label: "Completed" },
];

interface StatusChangeModalProps {
  task: {
    id: string;
    task_code: string;
    title: string;
    status: TaskStatus;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  allowedTargetStatuses?: TaskStatus[];
}

export function StatusChangeModal({
  task,
  isOpen,
  onClose,
  allowedTargetStatuses,
}: StatusChangeModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!task) return null;

  const availableStatuses = ALL_STATUSES.filter((s) => {
    if (s.key === task.status) return false;
    if (allowedTargetStatuses) return allowedTargetStatuses.includes(s.key);
    return true;
  });

  const handleConfirm = async () => {
    if (!selectedStatus) {
      setError("Please select a target status");
      return;
    }
    if (!reason || reason.trim().length < 5) {
      setError("A mandatory reason of at least 5 characters is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await transitionTaskStatusAction({
        taskId: task.id,
        newStatus: selectedStatus,
        reason: reason.trim(),
      });
      setReason("");
      setSelectedStatus(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status transition failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-semibold text-charcoal">{task.task_code}</span>
            <Badge variant="outline" className="text-[10px]">
              Current: {task.status.replace("_", " ")}
            </Badge>
          </div>
          <DialogTitle className="text-base font-medium">Update Task Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="p-3 rounded-inputs bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-charcoal block">Target Status</label>
            <div className="grid grid-cols-2 gap-2">
              {availableStatuses.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSelectedStatus(s.key)}
                  className={`flex items-center justify-between px-3 py-2 rounded-buttons border text-xs font-medium transition-colors cursor-pointer ${
                    selectedStatus === s.key
                      ? "border-midnight-ink bg-paper-mist text-charcoal font-semibold shadow-subtle"
                      : "border-ash bg-canvas-white text-steel hover:bg-paper-mist hover:text-charcoal"
                  }`}
                >
                  <span>{s.label}</span>
                  {selectedStatus === s.key && <ArrowRight className="w-3.5 h-3.5 text-charcoal" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-charcoal block">
                Mandatory Explanation / Reason
              </label>
              <span className="text-[10px] text-fog">Min 5 characters</span>
            </div>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the status is being updated, what was done, or any blockers..."
              rows={3}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={isSubmitting || !selectedStatus || reason.trim().length < 5}
          >
            {isSubmitting ? "Saving..." : "Confirm Status Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
