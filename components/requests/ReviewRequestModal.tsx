"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewRequestAction } from "@/services/request.service";
import type { RequestStatus } from "@prisma/client";

interface ReviewRequestModalProps {
  request: {
    id: string;
    request_code: string;
    subject: string;
    category: string;
    user: { full_name: string };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewRequestModal({ request, isOpen, onClose }: ReviewRequestModalProps) {
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!request) return null;

  const handleReview = async (newStatus: RequestStatus) => {
    if (!remarks.trim() || remarks.trim().length < 3) {
      setError("Reviewer remarks are required (minimum 3 characters)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await reviewRequestAction(request.id, newStatus, remarks.trim());
      setRemarks("");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLeave = request.category === "LEAVE";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review {request.request_code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2 text-left">
          <p className="text-xs text-steel">
            Submitted by <strong>{request.user.full_name}</strong>: &quot;{request.subject}&quot;
          </p>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal">Reviewer Remarks / Feedback</label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="State approval conditions, resolution notes, or rejection reasoning..."
              rows={3}
              required
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <div className="flex gap-2">
            {isLeave ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleReview("REJECTED")}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleReview("APPROVED")}
                >
                  Approve Leave
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                onClick={() => handleReview("RESOLVED")}
              >
                Mark Resolved
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
