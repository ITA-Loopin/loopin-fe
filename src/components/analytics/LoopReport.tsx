"use client";

import { useState } from "react";
import { ReportHeader } from "./ReportHeader";
import { ProgressStatsCard } from "./ProgressStatsCard";
import { CalendarView } from "./CalendarView";
import { LoopStatusList } from "./LoopStatusList";

import type { LoopReportData, ReportStatus } from "@/types/report";

type CalendarViewType = "week" | "month";


// Props 타입
type LoopReportProps = {
  status: ReportStatus;
  data: LoopReportData;
};

export function LoopReport({
  status,
  data,
}: LoopReportProps) {
  const [calendarViewType, setCalendarViewType] = useState<CalendarViewType>("week");
  
  return (
    <section className="flex flex-col gap-6 px-6 py-6">
      <ReportHeader
        message={data.reportStateMessage}
      />

      <ProgressStatsCard status={status} data={data} />

      <CalendarView
        completedDates={
          calendarViewType === "week"
            ? data.weekData.completedDates
            : data.monthData.completedDates
        }
        weekAverageProgress={data.weekData.averageProgress}
        onViewTypeChange={setCalendarViewType}
      />

      <LoopStatusList
        viewType={calendarViewType}
        stableLoops={
          calendarViewType === "week"
            ? data.weekData.stableLoops
            : data.monthData.stableLoops
        }
        unstableLoops={
          calendarViewType === "week"
            ? data.weekData.unstableLoops
            : data.monthData.unstableLoops
        }
        status={status}
        goodProgressMessage={
          calendarViewType === "week"
            ? data.weekData.goodProgressMessage
            : data.monthData.goodProgressMessage
        }
        badProgressMessage={
          calendarViewType === "week"
            ? data.weekData.badProgressMessage
            : data.monthData.badProgressMessage
        }
      />
    </section>
  );
}

