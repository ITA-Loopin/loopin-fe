"use client";

import dayjs from "dayjs/esm";
import "dayjs/esm/locale/ko";
import { useMemo } from "react";
import {
  HomeHeader,
  TodayLoopTitle,
  EmptyLoopView,
  LoopProgress,
  LoopList,
} from "@/components/home";
import { useDailyLoops } from "@/hooks/useDailyLoops";

dayjs.locale("ko");

export default function HomePage() {
  // 오늘 날짜 표시
  const todayText = useMemo(() => {
    return dayjs().format("YYYY년 M월 D일 dddd");
  }, []);

  // 오늘 날짜를 YYYY-MM-DD 형식으로 변환
  const todayDateString = useMemo(() => {
    return dayjs().format("YYYY-MM-DD");
  }, []);

  // 오늘 날짜의 루프 목록 가져오기
  const { loopList, totalProgress, isLoading } = useDailyLoops({
    date: todayDateString,
  });

  // 루프 목록이 비어있는지 확인
  const isEmpty = loopList.length === 0;


  return (
    <>
      {/* 고정 배경 - 스크롤해도 항상 보임 */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 228, 224, 0.3) 100%)",
        }}
      />
      <div className="flex flex-col relative min-h-screen">
      <HomeHeader />

      <div className="flex-1 px-4 pb-6 flex flex-col gap-6">
        <TodayLoopTitle dateText={todayText} />

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-500">로딩 중...</p>
          </div>
        ) : isEmpty ? (
          <EmptyLoopView />
        ) : (
          <>
            <LoopProgress progress={totalProgress} />

            {/* 말풍선 형태의 메시지 */}
            <div className="relative flex items-center justify-center">
              <div
                className="relative rounded-lg px-4 py-3 text-sm font-semibold"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: "#FF7765",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <span>오늘 하루의 루프를 모두 채워보세요!</span>
                {/* 위쪽 삼각형 포인터 */}
                <div
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderBottom: "8px solid rgba(255, 255, 255, 0.9)",
                    filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))",
                  }}
                ></div>
              </div>
            </div>

            <LoopList loops={loopList} />
          </>
        )}
      </div>
      </div>
    </>
  );
}


