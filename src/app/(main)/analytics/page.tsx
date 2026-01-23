"use client";

import { useState, useEffect } from "react";
import Header from "@/components/common/Header";
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
      dateProgressMap: {},
      stableLoops: [],
      unstableLoops: [],
      goodProgressMessage: null,
      badProgressMessage: null,
    },  
    monthData: {
      detailReportState: "",
      dateProgressMap: {},
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
          setStatus("NONE");
          setData({
            weekLoopCount: 0,
            totalLoopCount: 0,
            tenDayProgress: 0,
            reportStateMessage: "최근에는 루프가 설정되지 않았어요 \n 루프를 추가하러 가볼까요?",
            weekData: {
              detailReportState: "",
              averageProgress: 0,
              dateProgressMap: {},
              stableLoops: [],
              unstableLoops: [],
              goodProgressMessage: null,
              badProgressMessage: null,
            },
            monthData: {
              detailReportState: "",
              dateProgressMap: {},
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

  // 상태에 따른 배경색 설정
  const getBackgroundStyle = (status: ReportStatus) => {
    switch (status) {
      case "GOOD":
        return {
          background: "linear-gradient(180deg, #FFE4E0 1.89%, #FF9A8D 100%)",
          backgroundColor: "#FF9A8D",
        };
      case "OK":
        return {
          background: "linear-gradient(180deg, #FFECE9 0%, #FFD5CF 99.24%)",
          backgroundColor: "#FFD5CF",
        };
      case "HARD":
        return {
          background: "radial-gradient(174.4% 50% at 50% 50%, #F8F8F9 0%, #FFF2F0 55.77%)",
          backgroundColor: "#FFF2F0",
        };
      case "NONE":
        return {
          background: "var(--gray-100, #F8F8F9)",
          backgroundColor: "var(--gray-100, #F8F8F9)",
        };
      default:
        return {};
    }
  };

  // 레이아웃의 스크롤 영역 배경색도 설정
  useEffect(() => {
    const scrollContainer = document.querySelector('[class*="overflow-y-auto"]');
    if (scrollContainer && scrollContainer instanceof HTMLElement) {
      const bgColor = 
        status === "GOOD" ? "#FF9A8D" :
        status === "OK" ? "#FFD5CF" :
        status === "HARD" ? "#FFF2F0" :
        "#F8F8F9";
      scrollContainer.style.backgroundColor = bgColor;
      
      return () => {
        scrollContainer.style.backgroundColor = "";
      };
    }
  }, [status]);

  return (
    <div className="relative flex flex-col min-h-full overflow-x-hidden" style={getBackgroundStyle(status)}>
      <Header
        leftType="none"
        rightType="none"
        centerTitle="루프 리포트"
      />
      {/* NONE 상태를 제외한 모든 경우에 초록색 원형 오버레이 - 스크롤 계산에서 제외 */}
      {status !== "NONE" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute pointer-events-none rounded-[379.346px] bg-[#E7FFBA] blur-[67px] w-[379.346px] h-[379.018px] rotate-[-57.544deg] top-1/2 left-1/2"
            style={{
              opacity: status === "GOOD" ? 0.3 : 0.2,
            }}
          />
          <div
            className="absolute pointer-events-none rounded-[379.346px] bg-[#E7FFBA] blur-[67px] w-[379.346px] h-[219.725px] rotate-[-31.55deg] top-0 left-0"
            style={{
              opacity: status === "GOOD" ? 0.3 : 0.2,
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="relative flex items-center justify-center py-12">
          <p className="text-sm text-[#8F8A87]">로딩 중...</p>
        </div>
      ) : (
        <div className="relative">
          <LoopReport
            status={status}
            data={data}
          />
        </div>
      )}
    </div>
  );
}