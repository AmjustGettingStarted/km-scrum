"use client";

import { useActionState } from "react";
import { loginAction, type AuthActionResult } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertCircle, Lock, User } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    loginAction,
    null
  );

  return (
    <Card className="w-full max-w-sm border border-ash bg-canvas-white shadow-subtle p-6">
      <CardHeader className="text-left space-y-1.5 p-0 mb-6">
        <div className="w-8 h-8 rounded-inputs bg-midnight-ink flex items-center justify-center text-white text-xs font-semibold mb-2">
          KM
        </div>
        <CardTitle className="text-xl font-medium tracking-tight text-charcoal">
          Sign In
        </CardTitle>
        <CardDescription className="text-sm text-steel">
          Enter your internal credentials to access the workspace.
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
            <label className="text-xs font-medium text-charcoal block">Username</label>
            <div className="relative">
              <Input
                name="username"
                type="text"
                placeholder="e.g. john.doe"
                required
                autoComplete="username"
                autoFocus
                className="pl-8"
              />
              <User className="w-3.5 h-3.5 text-fog absolute left-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-medium text-charcoal block">Password</label>
            <div className="relative">
              <Input
                name="password"
                type="password"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                required
                autoComplete="current-password"
                className="pl-8"
              />
              <Lock className="w-3.5 h-3.5 text-fog absolute left-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full mt-2"
          >
            {isPending ? "Authenticating..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
