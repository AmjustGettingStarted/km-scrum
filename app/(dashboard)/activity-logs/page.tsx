import { Suspense } from "react";
import { getActivityLogsAction } from "@/services/activity.service";
import { getUsersAction } from "@/services/user.service";
import { getSessionFromCookies } from "@/lib/auth/session";
import { ActivityLogsTable } from "@/components/activity/ActivityLogsTable";
import { History } from "lucide-react";

interface ActivityLogsPageProps {
  searchParams: Promise<{ user?: string; type?: string; date?: string; q?: string }>;
}

async function ActivityLogsContent({
  searchPromise,
}: {
  searchPromise: Promise<{ user?: string; type?: string; date?: string; q?: string }>;
}) {
  const { user, type, date, q } = await searchPromise;
  const [logs, session] = await Promise.all([
    getActivityLogsAction({
      userId: user,
      activityType: type,
      dateStr: date,
      search: q,
    }).catch(() => []),
    getSessionFromCookies(),
  ]);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-tags mb-1.5 font-medium">
            <History className="w-3.5 h-3.5" />
            Immutable Audit Trail
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-charcoal">Activity Logs</h1>
          <p className="text-sm text-steel mt-0.5">
            {session?.user.role === "DEVELOPER"
              ? "Viewing your immutable personal action and status history."
              : "Complete immutable audit log of all team actions, status updates, and reasons."}
          </p>
        </div>
      </div>

      <ActivityLogsTable logs={logs} />
    </>
  );
}

function LogsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-paper-mist rounded-inputs"></div>
      <div className="h-96 bg-paper-mist rounded-cards"></div>
    </div>
  );
}

export default function ActivityLogsPage({ searchParams }: ActivityLogsPageProps) {
  return (
    <div className="space-y-4">
      <Suspense fallback={<LogsSkeleton />}>
        <ActivityLogsContent searchPromise={searchParams} />
      </Suspense>
    </div>
  );
}
