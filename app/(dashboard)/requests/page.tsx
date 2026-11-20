import { Suspense } from "react";
import { getRequestsAction } from "@/services/request.service";
import { getSessionFromCookies } from "@/lib/auth/session";
import { CreateRequestModal } from "@/components/requests/CreateRequestModal";
import { RequestsListView } from "@/components/requests/RequestsListView";
import { FileText } from "lucide-react";

async function RequestsContent() {
  const [requests, session] = await Promise.all([
    getRequestsAction().catch(() => []),
    getSessionFromCookies(),
  ]);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-tags mb-1.5 font-medium">
            <FileText className="w-3.5 h-3.5" />
            Ticket & Request Center
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-charcoal">Requests & Leaves</h1>
          <p className="text-sm text-steel mt-0.5">
            {session?.user.role === "DEVELOPER"
              ? "Apply for leave, submit confidential complaints, or raise operational issues."
              : "Review and respond to developer leaves, issues, and confidential complaints."}
          </p>
        </div>

        <CreateRequestModal />
      </div>

      <RequestsListView
        requests={requests}
        userRole={session?.user.role}
      />
    </>
  );
}

function RequestsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-paper-mist rounded-inputs"></div>
      <div className="h-64 bg-paper-mist rounded-cards"></div>
    </div>
  );
}

export default function RequestsPage() {
  return (
    <div className="space-y-4">
      <Suspense fallback={<RequestsSkeleton />}>
        <RequestsContent />
      </Suspense>
    </div>
  );
}
