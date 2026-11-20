"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReviewRequestModal } from "@/components/requests/ReviewRequestModal";
import { formatDate } from "@/lib/utils";
import { Palmtree, ShieldAlert, LifeBuoy } from "lucide-react";

interface RequestsListViewProps {
  requests: any[];
  userRole?: "MANAGER" | "SCRUM_MASTER" | "DEVELOPER";
}

export function RequestsListView({ requests, userRole = "DEVELOPER" }: RequestsListViewProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "LEAVE" | "COMPLAINT" | "GENERAL">("ALL");
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<any | null>(null);

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "ALL") return true;
    return r.category === activeTab;
  });

  const canReview = userRole === "MANAGER" || userRole === "SCRUM_MASTER";

  return (
    <div className="space-y-4">
      {/* Tab Filter */}
      <div className="flex items-center gap-2 border-b border-ash pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 text-xs font-medium rounded-inputs transition-colors cursor-pointer ${
            activeTab === "ALL"
              ? "bg-midnight-ink text-white"
              : "text-steel hover:bg-paper-mist hover:text-charcoal"
          }`}
        >
          All Requests ({requests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("LEAVE")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-inputs transition-colors cursor-pointer ${
            activeTab === "LEAVE"
              ? "bg-midnight-ink text-white"
              : "text-steel hover:bg-paper-mist hover:text-charcoal"
          }`}
        >
          <Palmtree className="w-3.5 h-3.5 text-emerald-600" />
          Leaves ({requests.filter((r) => r.category === "LEAVE").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("COMPLAINT")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-inputs transition-colors cursor-pointer ${
            activeTab === "COMPLAINT"
              ? "bg-midnight-ink text-white"
              : "text-steel hover:bg-paper-mist hover:text-charcoal"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
          Complaints ({requests.filter((r) => r.category === "COMPLAINT").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("GENERAL")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-inputs transition-colors cursor-pointer ${
            activeTab === "GENERAL"
              ? "bg-midnight-ink text-white"
              : "text-steel hover:bg-paper-mist hover:text-charcoal"
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5 text-purple-600" />
          Tickets ({requests.filter((r) => r.category === "GENERAL").length})
        </button>
      </div>

      {/* Requests Table */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-ash bg-paper-mist/60 text-xs font-medium text-steel">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Subject & Details</th>
              <th className="py-3 px-4">Submitted By</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
              {canReview && <th className="py-3 px-4 text-right">Review</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-ash">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={canReview ? 7 : 6} className="py-12 text-center text-xs text-fog italic">
                  No requests found in this category.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const statusVariant =
                  req.status === "APPROVED" || req.status === "RESOLVED"
                    ? "success"
                    : req.status === "REJECTED"
                    ? "danger"
                    : "warning";

                return (
                  <tr key={req.id} className="hover:bg-paper-mist/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-charcoal">
                      {req.request_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[10px]">
                        {req.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <span className="font-medium text-charcoal block">{req.subject}</span>
                      <p className="text-xs text-steel line-clamp-2 mt-0.5">{req.description}</p>
                      {req.reviewer_remarks && (
                        <div className="mt-1.5 p-1.5 rounded-inputs bg-paper-mist border border-ash/60 text-[11px] text-graphite">
                          <span className="font-semibold text-charcoal">
                            Review by {req.reviewed_by?.full_name}:
                          </span>{" "}
                          {req.reviewer_remarks}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-charcoal">
                      {req.user.full_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={statusVariant} className="text-[10px]">
                        {req.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-steel">{formatDate(req.created_at)}</td>
                    {canReview && (
                      <td className="py-3.5 px-4 text-right">
                        {req.status === "PENDING" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setSelectedRequestForReview(req)}
                          >
                            Review
                          </Button>
                        ) : (
                          <span className="text-xs text-fog italic">Closed</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      <ReviewRequestModal
        request={selectedRequestForReview}
        isOpen={Boolean(selectedRequestForReview)}
        onClose={() => setSelectedRequestForReview(null)}
      />
    </div>
  );
}
