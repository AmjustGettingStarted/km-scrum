import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, History } from "lucide-react";
import Link from "next/link";

interface ActivityLogsTableProps {
  logs: any[];
}

export function ActivityLogsTable({ logs }: ActivityLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="py-16 text-center text-xs text-fog border border-dashed border-ash rounded-cards">
        <History className="w-6 h-6 mx-auto mb-2 text-fog/60" />
        No activity logs match the current criteria.
      </div>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-ash bg-paper-mist/60 text-xs font-medium text-steel">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Reason / Notes</th>
              <th className="py-3 px-4">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ash">
            {logs.map((log) => {
              const roleVariant =
                log.user.role === "MANAGER"
                  ? "purple"
                  : log.user.role === "SCRUM_MASTER"
                  ? "blue"
                  : "default";

              return (
                <tr key={log.id} className="hover:bg-paper-mist/30 transition-colors text-xs">
                  <td className="py-3 px-4 text-steel whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal">{log.user.full_name}</span>
                      <Badge variant={roleVariant} className="text-[9px] px-1 py-0">
                        {log.user.role.substring(0, 3)}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {log.activity_type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-charcoal max-w-sm">
                    {log.description}
                  </td>
                  <td className="py-3 px-4 text-steel max-w-xs italic">
                    {log.reason ? `"${log.reason}"` : <span className="text-fog">&mdash;</span>}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {log.task ? (
                      <Link
                        href={`/tasks/${log.task.id}`}
                        className="font-mono text-electric-blue hover:underline"
                      >
                        {log.task.task_code}
                      </Link>
                    ) : log.request ? (
                      <span className="font-mono text-charcoal">{log.request.request_code}</span>
                    ) : (
                      <span className="text-fog">&mdash;</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
