import { Suspense } from "react";
import { connection } from "next/server";
import { getMonthlyPlanningDataAction } from "@/services/planning.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

interface MonthlyPlanningPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

async function MonthlyCalendarContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ year?: string; month?: string }>;
}) {
  await connection();
  const { year: qYear, month: qMonth } = await paramsPromise;
  const now = new Date();
  const year = qYear ? parseInt(qYear, 10) : now.getFullYear();
  const month = qMonth ? parseInt(qMonth, 10) : now.getMonth() + 1;

  const data = await getMonthlyPlanningDataAction(year, month);

  const monthName = new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "long",
  });

  const daysArray = Array.from({ length: data.daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-tags mb-1.5 font-medium">
            <CalendarDays className="w-3.5 h-3.5" />
            Monthly Schedule Distribution
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-charcoal">
            {monthName} {year}
          </h1>
          <p className="text-sm text-steel mt-0.5">
            Total of {data.totalTasks} tasks scheduled across {data.daysInMonth} days.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/planning/monthly?year=${month === 1 ? year - 1 : year}&month=${
              month === 1 ? 12 : month - 1
            }`}
            className="px-3 py-1.5 text-xs font-medium border border-ash rounded-buttons hover:bg-paper-mist text-charcoal transition-colors"
          >
            &larr; Prev Month
          </Link>
          <Link
            href={`/planning/monthly?year=${month === 12 ? year + 1 : year}&month=${
              month === 12 ? 1 : month + 1
            }`}
            className="px-3 py-1.5 text-xs font-medium border border-ash rounded-buttons hover:bg-paper-mist text-charcoal transition-colors"
          >
            Next Month &rarr;
          </Link>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-paper-mist/40 border-b border-ash font-medium text-xs text-steel">
          Days of {monthName}
        </div>
        <div className="grid grid-cols-7 gap-px bg-ash p-px">
          {daysArray.map((day) => {
            const count = data.dayCounts[day] || 0;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            return (
              <div
                key={day}
                className="bg-canvas-white min-h-[90px] p-2.5 flex flex-col justify-between hover:bg-paper-mist/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-charcoal">{day}</span>
                  {count > 0 && (
                    <Badge variant="blue" className="text-[10px] px-1.5 py-0">
                      {count} {count === 1 ? "task" : "tasks"}
                    </Badge>
                  )}
                </div>

                <div className="mt-2 text-right">
                  <Link
                    href={`/planning/daily?date=${dateStr}`}
                    className="text-[10px] text-electric-blue hover:underline"
                  >
                    View day &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default function MonthlyPlanningPage({ searchParams }: MonthlyPlanningPageProps) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse bg-paper-mist rounded-cards" />}>
      <MonthlyCalendarContent paramsPromise={searchParams} />
    </Suspense>
  );
}
