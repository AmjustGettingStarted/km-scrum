"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface DailyDatePickerProps {
  currentDate: string;
}

export function DailyDatePicker({ currentDate }: DailyDatePickerProps) {
  const router = useRouter();

  const handleDateChange = (newDateStr: string) => {
    router.push(`/planning/daily?date=${newDateStr}`);
  };

  const shiftDays = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    handleDateChange(d.toISOString().split("T")[0]);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = currentDate === todayStr;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center border border-ash rounded-buttons bg-canvas-white shadow-subtle p-0.5">
        <button
          type="button"
          onClick={() => shiftDays(-1)}
          className="p-1.5 hover:bg-paper-mist rounded-inputs text-steel hover:text-charcoal transition-colors cursor-pointer"
          title="Previous day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handleDateChange(todayStr)}
          className={`px-3 py-1 text-xs font-medium rounded-inputs transition-colors cursor-pointer ${
            isToday
              ? "bg-midnight-ink text-white"
              : "text-steel hover:bg-paper-mist hover:text-charcoal"
          }`}
        >
          Today
        </button>

        <button
          type="button"
          onClick={() => shiftDays(1)}
          className="p-1.5 hover:bg-paper-mist rounded-inputs text-steel hover:text-charcoal transition-colors cursor-pointer"
          title="Next day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          value={currentDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="h-8 text-xs w-36"
        />
      </div>
    </div>
  );
}
