"use client";

import { useState, useActionState, useEffect } from "react";
import { createTaskAction } from "@/services/task.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, KanbanSquare, AlertCircle } from "lucide-react";

interface CreateTaskModalProps {
  developers?: { id: string; full_name: string; username: string }[];
  userRole?: string;
  currentUserId?: string;
}

export function CreateTaskModal({ developers = [], userRole, currentUserId }: CreateTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createTaskAction, null);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state]);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="w-8 h-8 rounded-inputs bg-paper-mist border border-ash flex items-center justify-center text-charcoal mb-1">
            <KanbanSquare className="w-4 h-4" />
          </div>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-3.5">
          {state?.error && (
            <div className="p-3 rounded-inputs bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal">Task Title</label>
            <Input name="title" placeholder="Brief summary of the work item" required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal">Description & Instructions</label>
            <Textarea
              name="description"
              placeholder="Detailed specifications, reproduction steps, or implementation requirements..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {userRole === "DEVELOPER" ? (
              <div className="space-y-1">
                <label className="text-xs font-medium text-charcoal">Assign Developer</label>
                <Input value="Myself (Automatic)" disabled className="bg-paper-mist text-steel" />
                <input type="hidden" name="assignedToId" value={currentUserId || ""} />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-medium text-charcoal">Assign Developer</label>
                <select
                  name="assignedToId"
                  className="flex h-9 w-full rounded-inputs border border-ash bg-canvas-white px-3 py-1.5 text-sm text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-midnight-ink"
                  defaultValue=""
                >
                  <option value="">Unassigned</option>
                  {developers.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.full_name} ({dev.username})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">Priority</label>
              <select
                name="priority"
                className="flex h-9 w-full rounded-inputs border border-ash bg-canvas-white px-3 py-1.5 text-sm text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-midnight-ink"
                defaultValue="MEDIUM"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">Scheduled Date</label>
              <Input
                name="scheduledDate"
                type="date"
                defaultValue={todayStr}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">Due Date (Optional)</label>
              <Input name="dueDate" type="date" />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isPending}>
              {isPending ? "Creating..." : "Save Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
