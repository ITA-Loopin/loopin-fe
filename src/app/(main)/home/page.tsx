/*"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout, setLoading } from "@/store/slices/authSlice";
export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleWithdraw = async () => {
    if (!confirm("정말로 Loopin 회원을 탈퇴하시겠습니까?")) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    dispatch(setLoading(true));
    try {
      if (!accessToken) {
        throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
      }
      const response = await fetch("/api-proxy/rest-api/v1/member", {
        method: "DELETE",
        accessToken,
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "회원 탈퇴에 실패했습니다.");
      }
      dispatch(logout());
      alert("회원 탈퇴가 완료되었습니다.");
      router.replace("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "회원 탈퇴에 실패했습니다."
      );
    } finally {
      setIsDeleting(false);
      dispatch(setLoading(false));
    }
  }; */

"use client";

import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useMemo, useEffect, useState } from "react";
import {
  TodayLoopTitle,
  EmptyLoopView,
  LoopProgress,
  LoopList,
} from "@/components/home";
import Header from "@/components/common/Header";
import { useDailyLoops } from "@/hooks/useDailyLoops";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

dayjs.locale("ko");

export default function HomePage() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

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

  useEffect(() => {
    if (!isLoading && isEmpty) {
      const calendarIcon = document.querySelector(
        ".calendar-icon-trigger"
      ) as HTMLElement;
      if (calendarIcon) {
        const rect = calendarIcon.getBoundingClientRect();
        setTooltipPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        setShowTooltip(true);
      }
    } else {
      setShowTooltip(false);
    }
  }, [isLoading, isEmpty]);

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
        {showTooltip && tooltipPosition && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              width: `${tooltipPosition.width}px`,
              height: `${tooltipPosition.height}px`,
            }}
          >
            <Tooltip
              open={showTooltip}
              onOpenChange={setShowTooltip}
              delayDuration={0}
            >
              <TooltipTrigger asChild>
                <div className="absolute inset-0" />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={40}
                className="bg-[#FF7765] border-none shadow-none p-0 m-0 text-white relative [&_svg]:hidden [&_[data-slot='tooltip-arrow']]:hidden [&>svg]:hidden"
                style={{
                  display: "flex",
                  padding: "7px 12px",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 0 7px 0 rgba(0, 0, 0, 0.05)",
                  borderRadius: "8px",
                }}
              >
                <span className="text-sm font-medium text-white whitespace-nowrap">
                  오늘의 첫 루프를 만들어보세요!
                </span>
                <div
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 z-10"
                  style={{
                    backgroundColor: "#FF7765",
                  }}
                />
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        <Header />

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
                <div className="relative rounded-lg bg-white/90 px-4 py-3 text-sm font-semibold text-[#FF7765] shadow-[0px_2px_8px_rgba(0,0,0,0.1)]">
                  <span>오늘 하루의 루프를 모두 채워보세요!</span>
                  {/* 위쪽 삼각형 포인터 */}
                  <div className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-[rgba(255,255,255,0.9)] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.1)]"></div>
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
