"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { ReportHeader } from "./ReportHeader";
import { ProgressStatsCard } from "./ProgressStatsCard";
import { CalendarView } from "./CalendarView";
import { LoopStatusList } from "./LoopStatusList";

type CalendarViewType = "week" | "month";

// 리포트 상태 타입
export type ReportStatus = "GOOD" | "OK" | "HARD" | "EMPTY";

// 리포트 루프 아이템 타입
export type ReportLoopItem = {
  id: number;
  title: string;
  schedule: string; 
  completionRate: number;
};

// 리포트 데이터 타입
export type LoopReportData = {
  // 통계
  weekLoopCount: number; // 일주일 동안 채운 루프 개수
  totalLoopCount: number; // 전체 루프 개수
  tenDayProgress: number; // 최근 10일 동안 진행률 (0-100)
  weekAverageProgress: number; // 일주일 동안 평균 진행률 (0-100)
  
  // 캘린더
  completedDates: string[]; // 완료한 날짜들 (YYYY-MM-DD 형식)
  
  // 루프 목록
  stableLoops: ReportLoopItem[]; // 안정적으로 이어진 루프
  unstableLoops: ReportLoopItem[]; // 잘 이어지지 않은 루프
};


// Props 타입
type LoopReportProps = {
  status: ReportStatus;
  data: LoopReportData;
};

export function LoopReport({
  status,
  data,
}: LoopReportProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [calendarViewType, setCalendarViewType] = useState<CalendarViewType>("week");
  
  // 사용자 닉네임 가져오기 (기본값: "루핑이")
  const nickname = user?.nickname ?? "루핑이";
  
  return (
    <section className="flex flex-col gap-6 px-6 py-6">
      <ReportHeader
        nickname={nickname}
        status={status}
      />

      <ProgressStatsCard status={status} data={data} />

      <CalendarView
        completedDates={data.completedDates}
        weekAverageProgress={data.weekAverageProgress}
        onViewTypeChange={setCalendarViewType}
      />

      <LoopStatusList
        viewType={calendarViewType}
        stableLoops={data.stableLoops}
        unstableLoops={data.unstableLoops}
        status={status}
      />
    </section>
  );
}

