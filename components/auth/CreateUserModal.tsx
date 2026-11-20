"use client";

import { useState, useActionState, useEffect } from "react";
import { createUserAction } from "@/services/user.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, UserPlus, AlertCircle } from "lucide-react";

export function CreateUserModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createUserAction, null);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-8 h-8 rounded-inputs bg-paper-mist border border-ash flex items-center justify-center text-charcoal mb-1">
            <UserPlus className="w-4 h-4" />
          </div>
          <DialogTitle>Provision Team Account</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-3.5">
          {state?.error && (
            <div className="p-3 rounded-inputs bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal">Full Name</label>
            <Input name="fullName" placeholder="e.g. Alex Morgan" required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal">Username</label>
            <Input name="username" placeholder="e.g. alex.morgan" required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal">Email (Optional)</label>
            <Input name="email" type="email" placeholder="alex@company.internal" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal">Role</label>
            <select
              name="role"
              className="flex h-9 w-full rounded-inputs border border-ash bg-canvas-white px-3 py-1.5 text-sm text-charcoal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-midnight-ink"
              defaultValue="DEVELOPER"
            >
              <option value="DEVELOPER">Developer (Contributor)</option>
              <option value="SCRUM_MASTER">Scrum Master (Leader)</option>
              <option value="MANAGER">Manager (Administrator)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-charcoal">Initial Temporary Password</label>
            <Input
              name="temporaryPassword"
              type="text"
              defaultValue="TempPass@2026"
              required
            />
            <p className="text-[11px] text-fog">
              The user will be required to change this upon their first login.
            </p>
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
              {isPending ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
