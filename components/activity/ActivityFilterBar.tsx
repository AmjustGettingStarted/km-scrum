"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, Calendar, User, Activity } from "lucide-react";

interface ActivityFilterBarProps {
  users?: { id: string; full_name: string; username: string; role: string }[];
  isDeveloper?: boolean;
}

export function ActivityFilterBar({ users = [], isDeveloper = false }: ActivityFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") || "";
  const currentType = searchParams.get("type") || "ALL";
  const currentUser = searchParams.get("user") || "ALL";
  const currentDate = searchParams.get("date") || "";

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === "ALL") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchTerm.trim() });
  };

  const handleClearAll = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = Boolean(currentSearch || (currentType && currentType !== "ALL") || (currentUser && currentUser !== "ALL") || currentDate);

  return (
    <div className="bg-canvas-white border border-ash rounded-cards p-3.5 space-y-3 mb-6 shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-steel pointer-events-none" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description, reason, task code (e.g. KM-101)..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* User selector (Managers & Scrum Masters only) */}
          {!isDeveloper && users.length > 0 && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-steel" />
              <select
                value={currentUser}
                onChange={(e) => updateFilters({ user: e.target.value })}
                className="h-9 rounded-inputs border border-ash bg-canvas-white px-2.5 text-xs text-charcoal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-midnight-ink"
              >
                <option value="ALL">All Team Members</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Activity Type selector */}
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-steel" />
            <select
              value={currentType}
              onChange={(e) => updateFilters({ type: e.target.value })}
              className="h-9 rounded-inputs border border-ash bg-canvas-white px-2.5 text-xs text-charcoal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-midnight-ink"
            >
              <option value="ALL">All Activity Types</option>
              <optgroup label="Task Operations">
                <option value="TASKS">All Task Events</option>
                <option value="TASK_STATUS_CHANGED">Status Changes</option>
                <option value="TASK_CREATED">Task Created</option>
                <option value="TASK_UPDATED">Task Details Updated</option>
                <option value="TASK_REASSIGNED">Task Reassigned</option>
                <option value="TASK_PRIORITY_CHANGED">Priority Changed</option>
                <option value="TASK_ARCHIVED">Task Archived</option>
              </optgroup>
              <optgroup label="Files & Attachments">
                <option value="ATTACHMENT_UPLOADED">Files Uploaded</option>
              </optgroup>
              <optgroup label="Requests & Leaves">
                <option value="REQUESTS">All Requests & Leaves</option>
                <option value="LEAVE_REQUESTED">Leave Applications</option>
                <option value="COMPLAINT_FILED">Complaints</option>
                <option value="TICKET_RAISED">General Tickets</option>
                <option value="REQUEST_REVIEWED">Request Reviews</option>
              </optgroup>
              <optgroup label="User & Auth">
                <option value="USERS">User Administration</option>
                <option value="USER_LOGGED_IN">User Logins</option>
                <option value="PASSWORD_CHANGED">Password Changes</option>
              </optgroup>
            </select>
          </div>

          {/* Date picker */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-steel" />
            <input
              type="date"
              value={currentDate}
              onChange={(e) => updateFilters({ date: e.target.value })}
              className="h-9 rounded-inputs border border-ash bg-canvas-white px-2.5 text-xs text-charcoal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-midnight-ink"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="h-9 text-xs text-steel hover:text-charcoal gap-1 px-2.5"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
