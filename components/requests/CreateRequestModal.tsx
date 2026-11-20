"use client";

import { useState, useActionState, useEffect } from "react";
import { 
  createLeaveRequestAction, 
  createComplaintAction, 
  createGeneralTicketAction 
} from "@/services/request.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Palmtree, ShieldAlert, LifeBuoy, AlertCircle } from "lucide-react";

export function CreateRequestModal() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<"LEAVE" | "COMPLAINT" | "GENERAL">("LEAVE");

  const [leaveState, leaveAction, isLeavePending] = useActionState(createLeaveRequestAction, null);
  const [complaintState, complaintAction, isComplaintPending] = useActionState(createComplaintAction, null);
  const [generalState, generalAction, isGeneralPending] = useActionState(createGeneralTicketAction, null);

  useEffect(() => {
    if (leaveState?.success || complaintState?.success || generalState?.success) {
      setOpen(false);
    }
  }, [leaveState, complaintState, generalState]);

  const activeError = 
    category === "LEAVE" ? leaveState?.error :
    category === "COMPLAINT" ? complaintState?.error :
    generalState?.error;

  const isPending = isLeavePending || isComplaintPending || isGeneralPending;

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Raise Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Raise Request or Ticket</DialogTitle>
        </DialogHeader>

        {/* Category Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-paper-mist rounded-inputs border border-ash text-xs">
          <button
            type="button"
            onClick={() => setCategory("LEAVE")}
            className={`py-1.5 px-2 rounded-inputs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              category === "LEAVE"
                ? "bg-canvas-white text-charcoal shadow-subtle font-semibold"
                : "text-steel hover:text-charcoal"
            }`}
          >
            <Palmtree className="w-3.5 h-3.5 text-emerald-600" />
            Leave
          </button>
          <button
            type="button"
            onClick={() => setCategory("COMPLAINT")}
            className={`py-1.5 px-2 rounded-inputs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              category === "COMPLAINT"
                ? "bg-canvas-white text-charcoal shadow-subtle font-semibold"
                : "text-steel hover:text-charcoal"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            Complaint
          </button>
          <button
            type="button"
            onClick={() => setCategory("GENERAL")}
            className={`py-1.5 px-2 rounded-inputs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              category === "GENERAL"
                ? "bg-canvas-white text-charcoal shadow-subtle font-semibold"
                : "text-steel hover:text-charcoal"
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 text-purple-600" />
            General
          </button>
        </div>

        {activeError && (
          <div className="p-3 rounded-inputs bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{activeError}</span>
          </div>
        )}

        {category === "LEAVE" && (
          <form action={leaveAction} className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">Leave Type</label>
              <select
                name="leaveType"
                className="flex h-9 w-full rounded-inputs border border-ash bg-canvas-white px-3 py-1.5 text-sm text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-midnight-ink"
                defaultValue="CASUAL"
              >
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="ANNUAL">Annual Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-charcoal">Start Date</label>
                <Input name="startDate" type="date" defaultValue={todayStr} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-charcoal">End Date</label>
                <Input name="endDate" type="date" defaultValue={todayStr} required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">Reason / Handover Note</label>
              <Textarea
                name="reason"
                placeholder="State the reason for leave and any pending task coverage..."
                rows={3}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isPending}>
                {isPending ? "Submitting..." : "Apply for Leave"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {category === "COMPLAINT" && (
          <form action={complaintAction} className="space-y-3 pt-1">
            <p className="text-[11px] text-fog">
              🔒 Strictly confidential. Only Scrum Masters and Managers can view this complaint.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">Subject</label>
              <Input name="subject" placeholder="Summary of the issue" required />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">Detailed Description</label>
              <Textarea
                name="description"
                placeholder="Describe your concern in detail. This information will remain private."
                rows={4}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit Complaint"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {category === "GENERAL" && (
          <form action={generalAction} className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">Subject</label>
              <Input name="subject" placeholder="What do you need assistance with?" required />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">Description</label>
              <Textarea
                name="description"
                placeholder="Environment blockers, credentials needed, equipment questions..."
                rows={4}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit Ticket"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
