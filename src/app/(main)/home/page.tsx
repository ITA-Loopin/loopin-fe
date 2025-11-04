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
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
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
  };

  return (
    <div className="flex min-h-[calc(100vh-220px)] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Loopin 홈</h1>
      </div>

      {user ? (
        <div className="flex w-full max-w-sm flex-col items-stretch gap-6">
          <div className="rounded-xl border border-border bg-card px-6 py-4 text-left shadow-sm">
            <p className="text-lg font-medium">
              {user.nickname || user.email || "사용자"}님, 환영합니다!
            </p>
            {user.email && (
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            )}
          </div>

          <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-6 py-5 text-left">
            <h2 className="text-base font-semibold text-destructive">회원 탈퇴</h2>
            <p className="mt-1 text-sm text-destructive/70">
              탈퇴 시 계정과 모든 데이터가 영구적으로 삭제됩니다.
            </p>

            <button
              type="button"
              onClick={handleWithdraw}
              disabled={isDeleting}
              className="mt-4 w-full rounded-lg bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? "탈퇴 처리 중..." : "회원 탈퇴하기"}
            </button>

            {error && (
              <p className="mt-3 text-sm text-destructive-foreground/80">
                {error}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          사용자 정보를 불러오는 중입니다...
        </p>
      )}
    </div>
  );
} */

"use client";

import { useAppSelector } from "@/store/hooks";
import { useMemo, useState, useEffect } from "react";
import {
  HomeHeader,
  TodayLoopTitle,
  EmptyLoopView,
  LoopProgress,
  LoopList,
  type LoopItem,
} from "@/components/home";

export default function HomePage() {
  const { accessToken: storeAccessToken } = useAppSelector((state) => state.auth);
  
  // 개발용: API 테스트를 위한 하드코딩된 토큰
  // TODO: 실제 토큰으로 교체하거나 로그인 후 제거
  const TEST_ACCESS_TOKEN = ""; // 여기에 테스트용 accessToken 입력
  
  // 개발용: 테스트 모드 활성화 시 mock 데이터 사용
  // true로 설정하면 API 대신 mock 데이터 사용 (루프가 있을 때 화면 테스트용)
  const USE_MOCK_DATA = true; // true로 변경하면 mock 데이터 사용
  
  // 하드코딩된 토큰이 있으면 사용, 없으면 store에서 가져온 토큰 사용
  // TODO: 개발 서버에서 테스트할 때는 하드 코딩된 토큰 제거
  const accessToken = TEST_ACCESS_TOKEN || storeAccessToken;
  
  const [loopList, setLoopList] = useState<LoopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 날짜 표시
  const todayText = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  }, []);

  // 오늘 날짜를 YYYY-MM-DD 형식으로 변환
  const todayDateString = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // 테스트용 mock 루프 데이터
  const getMockLoopData = (): LoopItem[] => [
    {
      id: 1,
      title: "아침 운동",
      loopDate: todayDateString,
      completed: false,
      totalChecklists: 5,
      completedChecklists: 3,
    },
    {
      id: 2,
      title: "토익 스터디",
      loopDate: todayDateString,
      completed: false,
      totalChecklists: 5,
      completedChecklists: 3,
    },
    {
      id: 3,
      title: "마케팅 ch.7",
      loopDate: todayDateString,
      completed: false,
      totalChecklists: 5,
      completedChecklists: 3,
    },
    {
      id: 4,
      title: "컴퓨터 비전 공부",
      loopDate: todayDateString,
      completed: false,
      totalChecklists: 5,
      completedChecklists: 1,
    },
  ];

  // API로 Loop 데이터 가져오기
  useEffect(() => {
    const fetchLoops = async () => {
      // 테스트 모드: mock 데이터 사용
      if (USE_MOCK_DATA) {
        console.log("테스트 모드: Mock 데이터 사용");
        setIsLoading(true);
        // 실제 API 호출처럼 시뮬레이션하기 위해 약간의 딜레이
        setTimeout(() => {
          const mockData = getMockLoopData();
          setLoopList(mockData);
          setIsLoading(false);
          console.log("Mock 루프 개수:", mockData.length);
        }, 500);
        return;
      }

      if (!accessToken) {
        console.warn("accessToken이 없습니다. API 테스트를 위해 TEST_ACCESS_TOKEN을 설정하세요.");
        setIsLoading(false);
        return;
      }
      
      console.log("사용 중인 토큰:", TEST_ACCESS_TOKEN ? "하드코딩된 토큰" : "store에서 가져온 토큰");

      try {
        setIsLoading(true);
        const apiUrl = `/api-proxy/rest-api/v1/loops/date/${todayDateString}`;
        console.log("Loop API 요청:", apiUrl);
        console.log("날짜:", todayDateString);

        const response = await fetch(apiUrl, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log("API 응답 상태:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API 에러 응답:", errorText);
          throw new Error(
            `루프 데이터를 불러오는데 실패했습니다. (${response.status})`
          );
        }

        const result = await response.json();
        console.log("API 응답 데이터:", result);

        if (result.success && result.data) {
          console.log("받은 루프 개수:", result.data.loops?.length || 0);
          console.log("전체 진행률:", result.data.totalProgress);
          setLoopList(result.data.loops || []);
        } else {
          console.warn("성공 응답이지만 데이터가 없습니다:", result);
          setLoopList([]);
        }
      } catch (error) {
        console.error("루프 데이터 로딩 실패:", error);
        if (error instanceof Error) {
          console.error("에러 메시지:", error.message);
        }
        setLoopList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoops();
  }, [accessToken, todayDateString, USE_MOCK_DATA]);

  const isEmpty = loopList.length === 0;

  // 전체 진행률 계산
  const progress = useMemo(() => {
    const totalDone = loopList.reduce(
      (acc, cur) => acc + cur.completedChecklists,
      0
    );
    const totalCount = loopList.reduce(
      (acc, cur) => acc + cur.totalChecklists,
      0
    );
    return totalCount > 0 ? Math.round((totalDone / totalCount) * 100) : 0;
  }, [loopList]);

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
            <LoopProgress progress={progress} />

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


