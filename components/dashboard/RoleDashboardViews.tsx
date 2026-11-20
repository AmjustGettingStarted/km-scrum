import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { WorkloadBarChart } from "@/components/dashboard/WorkloadBarChart";
import { formatDate } from "@/lib/utils";
import { 
  KanbanSquare, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  FileText 
} from "lucide-react";

export function DeveloperDashboard({ data }: { data: any }) {
  const { metrics, todayTasks, recentTransitions } = data;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-charcoal">
          Good day, {data.user.fullName}
        </h1>
        <p className="text-sm text-steel mt-0.5">
          Here is your personal task briefing and workload summary for today.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-fog block mb-1">
            Today&apos;s Scheduled
          </span>
          <span className="text-2xl font-semibold text-charcoal">{metrics.todayTasksCount}</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            In Progress
          </span>
          <span className="text-2xl font-semibold text-charcoal">{metrics.inProgress}</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 block mb-1">
            Pending / Blockers
          </span>
          <span className="text-2xl font-semibold text-charcoal">{metrics.pending}</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-600 block mb-1">
            Overdue Work
          </span>
          <span className="text-2xl font-semibold text-charcoal">{metrics.overdue}</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="md:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-ash bg-paper-mist/40 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-charcoal">Today&apos;s Work Items</h3>
              <Link
                href="/planning/daily"
                className="text-xs font-medium text-electric-blue hover:underline"
              >
                Open daily planner &rarr;
              </Link>
            </div>

            <div className="divide-y divide-ash">
              {todayTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-fog italic">
                  No tasks assigned for today. Check the task board or ask your Scrum Master!
                </div>
              ) : (
                todayTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-paper-mist/30 transition-colors"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="font-mono text-xs font-semibold text-charcoal hover:text-electric-blue"
                        >
                          {task.task_code}
                        </Link>
                        <Badge variant="outline" className="text-[10px]">
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <Link href={`/tasks/${task.id}`} className="block truncate">
                        <h4 className="text-sm font-medium text-charcoal hover:text-electric-blue truncate">
                          {task.title}
                        </h4>
                      </Link>
                    </div>

                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-xs font-medium text-electric-blue hover:underline shrink-0"
                    >
                      Update &rarr;
                    </Link>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Recent Transitions */}
        <div>
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-steel">
              Your Recent Status Changes
            </h3>

            <div className="space-y-2.5 text-xs">
              {recentTransitions.length === 0 ? (
                <p className="text-fog italic py-2">No recent transitions recorded.</p>
              ) : (
                recentTransitions.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-inputs bg-paper-mist/50 border border-ash/50 space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="font-semibold text-charcoal">{item.task.task_code}</span>
                      <span className="text-fog">{formatDate(item.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-steel">
                      <span>{item.previous_status.replace("_", " ")}</span>
                      <span>&rarr;</span>
                      <span className="font-semibold text-charcoal">
                        {item.new_status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ManagementDashboard({ data }: { data: any }) {
  const { metrics, statusCounts, developerWorkload, pendingRequests } = data;
  const isManager = data.role === "MANAGER";

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-charcoal">
            {isManager ? "Executive Leadership Dashboard" : "Scrum Master Operations Cockpit"}
          </h1>
          <p className="text-sm text-steel mt-0.5">
            Real-time delivery progress, developer workload balance, and team queues.
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link
            href="/tasks"
            className="px-3.5 py-2 text-xs font-medium bg-midnight-ink text-white rounded-buttons shadow-subtle hover:bg-charcoal transition-colors"
          >
            Open Task Board
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-fog block mb-1">
            Total Active Tasks
          </span>
          <span className="text-2xl font-semibold text-charcoal">{metrics.totalTasks}</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 block mb-1">
            Testing Queue
          </span>
          <span className="text-2xl font-semibold text-charcoal">{metrics.testingQueue}</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 block mb-1">
            Blocked / Pending
          </span>
          <span className="text-2xl font-semibold text-charcoal">{metrics.pendingBlockers}</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-600 block mb-1">
            Overdue Work
          </span>
          <span className="text-2xl font-semibold text-charcoal">{metrics.overdueTasks}</span>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-ash">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
              Task Status Distribution
            </h3>
            <span className="text-xs text-steel">6 Core Statuses</span>
          </div>
          <StatusDistributionChart statusCounts={statusCounts} />
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-ash">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
              Developer Workload Balance
            </h3>
            <span className="text-xs text-steel">{metrics.activeDevelopers} active devs</span>
          </div>
          <WorkloadBarChart data={developerWorkload} />
        </Card>
      </div>

      {/* Pending Requests & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-4 md:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-ash">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
              Pending Leaves & Tickets Awaiting Review ({pendingRequests.length})
            </h3>
            <Link href="/requests" className="text-xs text-electric-blue hover:underline">
              View all &rarr;
            </Link>
          </div>

          <div className="divide-y divide-ash">
            {pendingRequests.length === 0 ? (
              <p className="text-xs text-fog italic py-4">No pending requests awaiting approval.</p>
            ) : (
              pendingRequests.map((r: any) => (
                <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-charcoal">{r.subject}</span>
                    <span className="text-fog block">by {r.user.full_name}</span>
                  </div>
                  <Link
                    href="/requests"
                    className="text-xs font-medium text-electric-blue hover:underline"
                  >
                    Review &rarr;
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Links Card */}
        <Card className="p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-steel">
            Quick Navigation
          </h3>
          <div className="space-y-2 text-xs">
            <Link
              href="/planning/daily"
              className="flex items-center justify-between p-2 rounded-inputs bg-paper-mist/40 hover:bg-paper-mist border border-ash/60 transition-colors"
            >
              <span>Daily Team Workload</span>
              <ArrowRight className="w-3.5 h-3.5 text-steel" />
            </Link>
            <Link
              href="/planning/monthly"
              className="flex items-center justify-between p-2 rounded-inputs bg-paper-mist/40 hover:bg-paper-mist border border-ash/60 transition-colors"
            >
              <span>Monthly Calendar</span>
              <ArrowRight className="w-3.5 h-3.5 text-steel" />
            </Link>
            <Link
              href="/activity-logs"
              className="flex items-center justify-between p-2 rounded-inputs bg-paper-mist/40 hover:bg-paper-mist border border-ash/60 transition-colors"
            >
              <span>Audit History</span>
              <ArrowRight className="w-3.5 h-3.5 text-steel" />
            </Link>
            {isManager && (
              <Link
                href="/manager/users"
                className="flex items-center justify-between p-2 rounded-inputs bg-paper-mist/40 hover:bg-paper-mist border border-ash/60 transition-colors"
              >
                <span>User Management</span>
                <ArrowRight className="w-3.5 h-3.5 text-steel" />
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
