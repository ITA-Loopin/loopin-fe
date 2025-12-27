"use client";

import { useState, useEffect } from "react";
import { LoopReport } from "@/components/analytics/LoopReport";
import type { LoopReportData, ReportStatus } from "@/types/report";
import { fetchLoopReport } from "@/lib/report";

export default function AnalyticsPage() {
  const [status, setStatus] = useState<ReportStatus>("NONE");
  const [data, setData] = useState<LoopReportData>({
    weekLoopCount: 0,
    totalLoopCount: 0,
    tenDayProgress: 0,
    reportStateMessage: "",
    weekData: {
      detailReportState: "",
      averageProgress: 0,
      completedDates: [],
      stableLoops: [],
      unstableLoops: [],
      goodProgressMessage: null,
      badProgressMessage: null,
    },
    monthData: {
      detailReportState: "",
      completedDates: [],
      stableLoops: [],
      unstableLoops: [],
      goodProgressMessage: null,
      badProgressMessage: null,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadReport = async () => {
      try {
        setIsLoading(true);
        const result = await fetchLoopReport();

        if (!cancelled) {
          setStatus(result.status);
          setData(result.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("루프 리포트 조회 실패", error);
          setStatus("NONE");
          setData({
            weekLoopCount: 0,
            totalLoopCount: 0,
            tenDayProgress: 0,
            reportStateMessage: "최근에는 루프가 설정되지 않았어요 \n 루프를 추가하러 가볼까요?",
            weekData: {
              detailReportState: "",
              averageProgress: 0,
              completedDates: [],
              stableLoops: [],
              unstableLoops: [],
              goodProgressMessage: null,
              badProgressMessage: null,
            },
            monthData: {
              detailReportState: "",
              completedDates: [],
              stableLoops: [],
              unstableLoops: [],
              goodProgressMessage: null,
              badProgressMessage: null,
            },
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, []);

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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-[#8F8A87]">로딩 중...</p>
        </div>
      ) : (
        <LoopReport
          status={status}
          data={data}
        />
      )}
    </div>
  );
}
