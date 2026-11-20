"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  KanbanSquare, 
  Calendar, 
  CalendarDays, 
  FileText, 
  History, 
  Users, 
  LayoutDashboard,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ("MANAGER" | "SCRUM_MASTER" | "DEVELOPER")[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Task Board",
    href: "/tasks",
    icon: KanbanSquare,
  },
  {
    label: "Daily Planning",
    href: "/planning/daily",
    icon: Calendar,
  },
  {
    label: "Monthly Calendar",
    href: "/planning/monthly",
    icon: CalendarDays,
    roles: ["MANAGER", "SCRUM_MASTER"],
  },
  {
    label: "Requests & Leaves",
    href: "/requests",
    icon: FileText,
  },
  {
    label: "Activity Logs",
    href: "/activity-logs",
    icon: History,
    roles: ["MANAGER", "SCRUM_MASTER"],
  },
  {
    label: "User Management",
    href: "/manager/users",
    icon: Users,
    roles: ["MANAGER"],
  },
];

interface AppSidebarProps {
  userRole?: "MANAGER" | "SCRUM_MASTER" | "DEVELOPER";
}

export function AppSidebar({ userRole = "DEVELOPER" }: AppSidebarProps) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  return (
    <aside className="w-60 shrink-0 border-r border-ash bg-canvas-white flex flex-col h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="h-14 border-b border-ash flex items-center px-4 gap-2.5">
        <div className="w-6 h-6 rounded-inputs bg-midnight-ink flex items-center justify-center text-white text-xs font-semibold">
          KM
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-charcoal leading-tight">km-scrum</span>
          <span className="text-[10px] text-fog leading-tight">Internal Workspace</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-buttons text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-electric-blue font-semibold"
                  : "text-graphite hover:bg-paper-mist hover:text-charcoal"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-electric-blue" : "text-steel")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Workspace Footer status */}
      <div className="p-3 border-t border-ash bg-paper-mist/40">
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-steel">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Online &bull; Single Workspace</span>
        </div>
      </div>
    </aside>
  );
}
