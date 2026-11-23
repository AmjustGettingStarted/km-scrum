import { Suspense } from "react";
import { connection } from "next/server";
import { getDailyPlanningDataAction } from "@/services/planning.service";
import { DailyDatePicker } from "@/components/planning/DailyDatePicker";
import { DailyPlanningView } from "@/components/planning/DailyPlanningView";
import { Calendar } from "lucide-react";

interface DailyPlanningPageProps {
  searchParams: Promise<{ date?: string }>;
}

async function DailyPlanningContent({ datePromise }: { datePromise: Promise<{ date?: string }> }) {
  await connection();
  const { date } = await datePromise;
  const targetDate = date || new Date().toISOString().split("T")[0];
  const data = await getDailyPlanningDataAction(targetDate);

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-tags mb-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            Day-Wise Work Breakdown
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-charcoal">Daily Planning</h1>
          <p className="text-sm text-steel mt-0.5">
            {data.role === "DEVELOPER"
              ? "Review your personal scheduled tasks and deadlines for any selected day."
              : "Inspect team-wide task assignments and identify workload bottlenecks."}
          </p>
        </div>

        <DailyDatePicker currentDate={targetDate} />
      </div>

      <DailyPlanningView data={data} />
    </>
  );
}

function PlanningSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-paper-mist rounded-inputs"></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-paper-mist rounded-cards"></div>
        ))}
      </div>
      <div className="h-96 bg-paper-mist rounded-cards"></div>
    </div>
  );
}

export default function DailyPlanningPage({ searchParams }: DailyPlanningPageProps) {
  return (
    <div className="space-y-4">
      <Suspense fallback={<PlanningSkeleton />}>
        <DailyPlanningContent datePromise={searchParams} />
      </Suspense>
    </div>
  );
}
