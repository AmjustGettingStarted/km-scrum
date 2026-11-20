"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { CommandPalette } from "@/components/layout/CommandPalette";

interface HeaderProps {
  userName?: string;
  userRole?: "MANAGER" | "SCRUM_MASTER" | "DEVELOPER";
}

export function Header({ userName = "Team Member", userRole = "DEVELOPER" }: HeaderProps) {
  const roleBadgeVariant = 
    userRole === "MANAGER" ? "purple" : 
    userRole === "SCRUM_MASTER" ? "blue" : "default";

  return (
    <header className="h-14 border-b border-ash bg-canvas-white px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-charcoal hidden sm:block">Workspace</h2>
        <CommandPalette />
      </div>

      <div className="flex items-center gap-3.5">
        <NotificationBell />

        <div className="h-4 w-px bg-ash"></div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-paper-mist border border-ash flex items-center justify-center text-xs font-semibold text-charcoal">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-charcoal leading-tight">{userName}</span>
            <div className="mt-0.5">
              <Badge variant={roleBadgeVariant} className="text-[9px] px-1.5 py-0 leading-tight">
                {userRole.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Logout trigger */}
        <form action="/api/auth/logout" method="POST">
          <Button variant="ghost" size="sm" type="submit" className="text-xs text-steel hover:text-red-600 gap-1.5 h-8">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
