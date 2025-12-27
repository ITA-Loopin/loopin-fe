"use client";

import { useState } from "react";
import { LoopReport, type ReportStatus, type LoopReportData } from "@/components/analytics/LoopReport";

export default function AnalyticsPage() {
  // 테스트용: 상태 변경 가능하도록
  const [status, setStatus] = useState<ReportStatus>("GOOD");

  // 더미 데이터
  const dummyData: LoopReportData = {
    weekLoopCount: 4,
    totalLoopCount: 5,
    tenDayProgress: 85,
    weekAverageProgress: 80,
    completedDates: [
      "2024-01-07",
      "2024-01-09",
      "2024-01-12",
    ],
    stableLoops: [
      {
        id: 1,
        title: "아침 운동",
        schedule: "매주 월수금",
        completionRate: 100,
      },
    ],
    unstableLoops: [
      {
        id: 2,
        title: "토익 공부",
        schedule: "매주 월수금",
        completionRate: 0,
      },
    ],
  };

  // EMPTY 상태용 더미 데이터
  const emptyData: LoopReportData = {
    weekLoopCount: 0,
    totalLoopCount: 0,
    tenDayProgress: 0,
    weekAverageProgress: 0,
    completedDates: [],
    stableLoops: [],
    unstableLoops: [],
  };

  const data = status === "EMPTY" ? emptyData : dummyData;

  return (
    <div className="flex flex-col">
      {/* 페이지 헤더 - 고정 */}
      <div className="flex w-full items-center justify-center px-6 pt-6 pb-4">
        <div className="flex w-[328px] items-center justify-center">
          <h1 className="text-center text-base font-semibold leading-[150%] tracking-[-0.32px] text-[#3A3D40]">
            루프 리포트
          </h1>
        </div>
      </div>

      {/* 테스트용 상태 변경 버튼 */}
      <div className="flex gap-2 p-4 bg-gray-100">
        {(["GOOD", "OK", "HARD", "EMPTY"] as ReportStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded text-sm ${
              status === s
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <LoopReport
        status={status}
        data={data}
      />
    </div>
  );
}
