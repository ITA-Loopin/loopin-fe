/*"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  import { useDailyLoops } from "@/hooks/useDailyLoops";
  import { useRouter } from "next/navigation";
  
  dayjs.locale("ko");
  
  export default function HomePage() {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<{
      top: number;
      left: number;
      width: number;
      height: number;
    } | null>(null);
    const router = useRouter();
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
      if (isLoading || !isEmpty) {
        setTooltipVisible(false);
        const hideTimer = window.setTimeout(() => setShowTooltip(false), 300);
        return () => window.clearTimeout(hideTimer);
      }

      const updatePosition = () => {
        const calendarIcon = document.querySelector(
          ".calendar-icon-trigger"
        ) as HTMLElement | null;
        if (!calendarIcon) return;
        const rect = calendarIcon.getBoundingClientRect();
        setTooltipPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      };

      const rafId = window.requestAnimationFrame(() => {
        updatePosition();
        setShowTooltip(true);
        window.requestAnimationFrame(() => setTooltipVisible(true));
      });

      window.addEventListener("resize", updatePosition);
      return () => {
        window.cancelAnimationFrame(rafId);
        window.removeEventListener("resize", updatePosition);
      };
    }, [isLoading, isEmpty]);

    useEffect(() => {
      if (!showTooltip) return;

      let hideTimer: number | undefined;
      const dismiss = () => {
        setTooltipVisible(false);
        hideTimer = window.setTimeout(() => setShowTooltip(false), 300);
      };

      // 페이드인 직후 잔여 이벤트로 즉시 닫히지 않도록 약간 지연 후 리스너 등록
      const armId = window.setTimeout(() => {
        document.addEventListener("touchstart", dismiss, {
          passive: true,
          once: true,
        });
        document.addEventListener("click", dismiss, { once: true });
        document.addEventListener("scroll", dismiss, {
          capture: true,
          passive: true,
          once: true,
        });
      }, 150);

      return () => {
        window.clearTimeout(armId);
        if (hideTimer) window.clearTimeout(hideTimer);
        document.removeEventListener("touchstart", dismiss);
        document.removeEventListener("click", dismiss);
        document.removeEventListener("scroll", dismiss, { capture: true });
      };
    }, [showTooltip]);

    return (
      <>
        {/* 고정 배경 - 스크롤해도 항상 보임 */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            background:
              // eslint-disable-next-line no-restricted-syntax
              "linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 228, 224, 0.3) 100%)",
          }}
        />
        <div className="flex flex-col relative min-h-screen">
        {/* 오른쪽 위 디자인 요소 */}
        <div
          className="absolute top-0 right-0 -z-10"
          style={{
            width: "360.827px",
            height: "162.286px",
            transform: "rotate(30.835deg)",
            borderRadius: "360.827px",
            opacity: 0.5,
            // eslint-disable-next-line no-restricted-syntax
            background: "var(--primary-300, #FFC2BA)",
            filter: "blur(67px)",
          }}
        />
        {/* 우측 상단 디자인 요소 (추가) */}
        <div
          className="absolute top-0 right-0 -z-10"
          style={{
            width: "379.346px",
            height: "170.615px",
            transform: "rotate(7.014deg)",
            borderRadius: "379.346px",
            opacity: 0.2,
            // eslint-disable-next-line no-restricted-syntax
            background: "#E7FFBA",
            filter: "blur(67px)",
          }}
        />
        {/* 우측 하단 디자인 요소 */}
        <div
          className="absolute bottom-0 right-0 -z-10"
          style={{
            width: "379.346px",
            height: "170.615px",
            transform: "rotate(-42.799deg)",
            borderRadius: "379.346px",
            opacity: 0.2,
            // eslint-disable-next-line no-restricted-syntax
            background: "#E7FFBA",
            filter: "blur(67px)",
          }}
        />
        {/* 왼쪽 중앙 하단 디자인 요소 */}
        <div
          className="absolute left-0 top-[60%] -z-10"
          style={{
            width: "209px",
            height: "317.653px",
            transform: "rotate(89.667deg)",
            borderRadius: "317.653px",
            opacity: 0.15,
            // eslint-disable-next-line no-restricted-syntax
            background: "var(--primary-300, #FFC2BA)",
            filter: "blur(67px)",
          }}
        />
        
          {showTooltip && tooltipPosition && (
            <div
              className="fixed z-50 pointer-events-none transition-opacity duration-300"
              style={{
                top: `${tooltipPosition.top - 18}px`,
                left: `${tooltipPosition.left + tooltipPosition.width / 2}px`,
                transform: "translate(-50%, -100%)",
                opacity: tooltipVisible ? 1 : 0,
              }}
            >
              <div
                className="relative bg-primary-500 text-white"
                style={{
                  display: "flex",
                  padding: "7px 12px",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "8px",
                  // eslint-disable-next-line no-restricted-syntax
                  boxShadow: "0 0 7px 0 rgba(0, 0, 0, 0.05)",
                }}
              >
                <span className="text-sm font-medium text-white whitespace-nowrap">
                  오늘의 첫 루프를 만들어보세요!
                </span>
                <div
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                  style={{
                    // eslint-disable-next-line no-restricted-syntax
                    backgroundColor: "#FF7765",
                  }}
                />
              </div>
            </div>
          )}
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
                  {/* eslint-disable-next-line no-restricted-syntax */}
                  <div className="relative rounded-lg bg-white/90 px-4 py-3 text-sm font-semibold text-primary-main shadow-[0px_2px_8px_rgba(0,0,0,0.1)]">
                    <span>오늘 하루의 루프를 모두 채워보세요!</span>
                    {/* 위쪽 삼각형 포인터 */}
                    {/* eslint-disable-next-line no-restricted-syntax */}
                    <div className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-[rgba(255,255,255,0.9)] drop-shadow-[0px_2px_4px_rgba(0,0,0,0.1)]"></div>
                  </div>
                </div>
  
                <LoopList loops={loopList} />

                {/* 팀 루프 보러가기 버튼 */}
                { }
                <div className="flex w-full justify-center itema-center px-2 py-[6px] gap-2 roundeed-[5px] bg-primary-100">
                  { }
                  <button className="text-body-2-sb text-primary-main whitespace-nowrap" onClick={() => router.push("/teamloop")}>
                    팀 루프 보러가기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  }