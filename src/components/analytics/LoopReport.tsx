"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  
  return (
    <>
      <ReportHeader
        message={data.reportStateMessage}
      />

      {/* NONE 상태일 때만 루프 추가하기 버튼 표시 */}
      {status === "NONE" && (
        <div className="flex justify-center px-6 mb-4">
          <button
            onClick={() => router.push("/calendar")}
            className="flex w-full h-12 items-center justify-center whitespace-nowrap rounded-[30px] bg-[var(--gray-800,#3A3D40)] py-[15px] px-[15px] text-base font-semibold text-white transition-colors"
          >
            루프 추가하기
          </button>
        </div>
      )}

      <section className="flex flex-col gap-6 mb-8">
        <ProgressStatsCard status={status} data={data} />

      <CalendarView
        dateProgressMap={
          calendarViewType === "week"
            ? data.weekData.dateProgressMap
            : data.monthData.dateProgressMap
        }
        weekAverageProgress={data.weekData.averageProgress}
        status={status}
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
    </>
  );
}

