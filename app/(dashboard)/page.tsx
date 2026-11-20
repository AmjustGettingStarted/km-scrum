import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, KanbanSquare, Calendar, FileText } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-charcoal">Workspace Dashboard</h1>
        <p className="text-sm text-steel mt-1">
          Welcome to your team management console. Access tasks, daily planning, and requests below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-fog tracking-wider uppercase">Module</span>
              <KanbanSquare className="w-4 h-4 text-electric-blue" />
            </div>
            <CardTitle className="text-lg mt-2">Task Board</CardTitle>
            <CardDescription>
              Monitor the 6 required status columns, drag cards, and track daily progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-electric-blue hover:underline"
            >
              Open task board <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-fog tracking-wider uppercase">Planning</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <CardTitle className="text-lg mt-2">Daily & Monthly</CardTitle>
            <CardDescription>
              Inspect developer-wise assignments for today and view the monthly work calendar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/planning/daily"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-electric-blue hover:underline"
            >
              View daily schedule <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-fog tracking-wider uppercase">Tickets</span>
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <CardTitle className="text-lg mt-2">Requests & Leaves</CardTitle>
            <CardDescription>
              Review developer leave applications, private complaints, and general tickets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/requests"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-electric-blue hover:underline"
            >
              Manage requests <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
