import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  History,
  PlusCircle,
  RefreshCw,
  Edit3,
  UserCheck,
  Zap,
  Archive,
  Paperclip,
  Calendar,
  AlertOctagon,
  HelpCircle,
  CheckCircle2,
  UserPlus,
  Key,
  LogIn,
  Lock,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

interface ActivityLogsTableProps {
  logs: any[];
}

export function ActivityLogsTable({ logs }: ActivityLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="py-20 text-center text-xs text-fog border border-dashed border-ash rounded-cards bg-canvas-white">
        <History className="w-8 h-8 mx-auto mb-2.5 text-fog/50" />
        <p className="font-medium text-charcoal mb-0.5">No Activity Logs Found</p>
        <p className="text-steel max-w-sm mx-auto">
          No events match the selected filters or search terms. Try adjusting your filter parameters.
        </p>
      </div>
    );
  }

  const getActionBadge = (type: string) => {
    switch (type) {
      case "TASK_CREATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <PlusCircle className="w-3 h-3 shrink-0" />
            Task Created
          </span>
        );
      case "TASK_STATUS_CHANGED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-3 h-3 shrink-0" />
            Status Changed
          </span>
        );
      case "TASK_PRIORITY_CHANGED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Zap className="w-3 h-3 shrink-0" />
            Priority Changed
          </span>
        );
      case "TASK_REASSIGNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <UserCheck className="w-3 h-3 shrink-0" />
            Reassigned
          </span>
        );
      case "TASK_UPDATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Edit3 className="w-3 h-3 shrink-0" />
            Task Updated
          </span>
        );
      case "TASK_ARCHIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <Archive className="w-3 h-3 shrink-0" />
            Archived
          </span>
        );
      case "ATTACHMENT_UPLOADED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <Paperclip className="w-3 h-3 shrink-0" />
            File Uploaded
          </span>
        );
      case "LEAVE_REQUESTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <Calendar className="w-3 h-3 shrink-0" />
            Leave Applied
          </span>
        );
      case "COMPLAINT_FILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
            <AlertOctagon className="w-3 h-3 shrink-0" />
            Complaint
          </span>
        );
      case "TICKET_RAISED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
            <HelpCircle className="w-3 h-3 shrink-0" />
            Ticket Raised
          </span>
        );
      case "REQUEST_REVIEWED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-teal-50 text-teal-800 border border-teal-200">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            Request Reviewed
          </span>
        );
      case "USER_CREATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserPlus className="w-3 h-3 shrink-0" />
            User Created
          </span>
        );
      case "USER_STATUS_CHANGED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <ShieldAlert className="w-3 h-3 shrink-0" />
            Account Status
          </span>
        );
      case "PASSWORD_RESET":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <Key className="w-3 h-3 shrink-0" />
            Password Reset
          </span>
        );
      case "USER_LOGGED_IN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
            <LogIn className="w-3 h-3 shrink-0" />
            Login
          </span>
        );
      case "PASSWORD_CHANGED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-tags text-[10px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
            <Lock className="w-3 h-3 shrink-0" />
            Password Changed
          </span>
        );
      default:
        return (
          <Badge variant="outline" className="font-mono text-[9px]">
            {type.replace(/_/g, " ")}
          </Badge>
        );
    }
  };

  return (
    <Card className="p-0 overflow-hidden shadow-subtle border-ash">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-ash bg-paper-mist/60 text-xs font-medium text-steel">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Details &amp; Diff</th>
              <th className="py-3 px-4">Explanation / Remarks</th>
              <th className="py-3 px-4">Target Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ash bg-canvas-white">
            {logs.map((log) => {
              const roleVariant =
                log.user.role === "MANAGER"
                  ? "purple"
                  : log.user.role === "SCRUM_MASTER"
                  ? "blue"
                  : "default";

              const hasDiff = Boolean(log.previous_value && log.new_value);

              return (
                <tr key={log.id} className="hover:bg-paper-mist/30 transition-colors text-xs">
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 text-steel whitespace-nowrap">
                    <span className="block font-medium text-charcoal">
                      {formatDateTime(log.created_at)}
                    </span>
                    {log.ip_address && (
                      <span className="text-[10px] text-fog font-mono block">
                        IP: {log.ip_address}
                      </span>
                    )}
                  </td>

                  {/* Actor */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-paper-mist border border-ash flex items-center justify-center text-[10px] font-semibold text-charcoal">
                        {log.user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium text-charcoal block leading-tight">
                          {log.user.full_name}
                        </span>
                        <div className="mt-0.5">
                          <Badge variant={roleVariant} className="text-[9px] px-1 py-0 leading-none">
                            {log.user.role.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Action Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getActionBadge(log.activity_type)}
                  </td>

                  {/* Description & Value Diff */}
                  <td className="py-3.5 px-4 text-charcoal max-w-sm">
                    <p className="font-medium text-charcoal leading-snug">{log.description}</p>
                    {hasDiff && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono">
                        <span className="px-1.5 py-0.5 bg-paper-mist rounded border border-ash line-through text-steel">
                          {log.previous_value.replace(/_/g, " ")}
                        </span>
                        <ArrowRight className="w-3 h-3 text-fog shrink-0" />
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-semibold">
                          {log.new_value.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Reason / Notes */}
                  <td className="py-3.5 px-4 text-steel max-w-xs">
                    {log.reason ? (
                      <div className="p-2 rounded bg-paper-mist/50 border border-ash/80 text-[11px] italic text-charcoal">
                        &ldquo;{log.reason}&rdquo;
                      </div>
                    ) : (
                      <span className="text-fog">&mdash;</span>
                    )}
                  </td>

                  {/* Target Entity Link */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {log.task ? (
                      <Link
                        href={`/tasks/${log.task.id}`}
                        className="inline-flex items-center gap-1 font-mono text-electric-blue hover:underline bg-blue-50/50 px-2 py-0.5 rounded border border-blue-200 text-xs font-medium"
                      >
                        {log.task.task_code}
                      </Link>
                    ) : log.request ? (
                      <Link
                        href="/requests"
                        className="inline-flex items-center gap-1 font-mono text-indigo-700 hover:underline bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-200 text-xs font-medium"
                      >
                        {log.request.request_code}
                      </Link>
                    ) : (
                      <span className="text-fog font-mono">&mdash;</span>
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
