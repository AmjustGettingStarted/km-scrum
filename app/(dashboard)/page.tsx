import { Suspense } from "react";
import { getDashboardMetricsAction } from "@/services/dashboard.service";
import { DeveloperDashboard, ManagementDashboard } from "@/components/dashboard/RoleDashboardViews";

async function DashboardContent() {
  const data = await getDashboardMetricsAction();

  if (data.role === "DEVELOPER") {
    return <DeveloperDashboard data={data} />;
  }

  return <ManagementDashboard data={data} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      <div className="h-8 w-64 bg-paper-mist rounded-inputs"></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-paper-mist rounded-cards"></div>
        ))}
      </div>
      <div className="h-64 bg-paper-mist rounded-cards"></div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
