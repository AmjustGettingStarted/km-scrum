"use client";

import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, KeyRound, UserX, UserCheck } from "lucide-react";
import { resetPasswordAction, toggleUserStatusAction } from "@/services/user.service";

interface UserActionsDropdownProps {
  user: {
    id: string;
    username: string;
    full_name: string;
    is_active: boolean;
  };
}

export function UserActionsDropdown({ user }: UserActionsDropdownProps) {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState("ResetPass@2026");
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async () => {
    setIsResetting(true);
    try {
      await resetPasswordAction(user.id, tempPassword);
      setResetDialogOpen(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Password reset failed");
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleUserStatusAction(user.id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Status change failed");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-steel hover:text-charcoal">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => setResetDialogOpen(true)}>
            <KeyRound className="w-3.5 h-3.5 mr-2 text-steel" />
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleStatus}>
            {user.is_active ? (
              <>
                <UserX className="w-3.5 h-3.5 mr-2 text-red-500" />
                <span className="text-red-600">Deactivate</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                <span className="text-emerald-600">Activate</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-left">
            <p className="text-xs text-steel">
              Generate a temporary password for <strong>{user.full_name}</strong> ({user.username}).
            </p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-charcoal">Temporary Password</label>
              <Input
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Temporary password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isResetting || !tempPassword}
              onClick={handleResetPassword}
            >
              {isResetting ? "Resetting..." : "Confirm Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
