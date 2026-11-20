"use client";

import { useActionState } from "react";
import { changePasswordAction, type AuthActionResult } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertCircle, KeyRound } from "lucide-react";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    changePasswordAction,
    null
  );

  return (
    <Card className="w-full max-w-sm border border-ash bg-canvas-white shadow-subtle p-6">
      <CardHeader className="text-left space-y-1.5 p-0 mb-6">
        <div className="w-8 h-8 rounded-inputs bg-amber-500 flex items-center justify-center text-white text-xs font-semibold mb-2">
          <KeyRound className="w-4 h-4" />
        </div>
        <CardTitle className="text-xl font-medium tracking-tight text-charcoal">
          Change Password
        </CardTitle>
        <CardDescription className="text-sm text-steel">
          You must set a new secure password before continuing to your workspace.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3 rounded-inputs bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-charcoal block">Current Password</label>
            <Input
              name="currentPassword"
              type="password"
              placeholder="Temporary password provided by Manager"
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-charcoal block">New Password</label>
            <Input
              name="newPassword"
              type="password"
              placeholder="Minimum 8 characters"
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-charcoal block">Confirm New Password</label>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Re-enter new password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full mt-2"
          >
            {isPending ? "Updating password..." : "Update Password & Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
