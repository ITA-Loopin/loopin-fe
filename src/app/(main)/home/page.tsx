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
      console.error("회원 탈퇴 실패", err);
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
      {/* 오른쪽 위 디자인 요소 */}
      <div
        className="absolute top-0 right-0 -z-10"
        style={{
          width: "360.827px",
          height: "162.286px",
          transform: "rotate(30.835deg)",
          borderRadius: "360.827px",
          opacity: 0.5,
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
          background: "var(--primary-300, #FFC2BA)",
          filter: "blur(67px)",
        }}
      />
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


