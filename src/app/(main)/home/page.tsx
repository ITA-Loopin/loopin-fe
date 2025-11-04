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
  const { accessToken } = useAppSelector((state) => state.auth);
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

  // API로 Loop 데이터 가져오기
  useEffect(() => {
    const fetchLoops = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // TODO: 실제 API 엔드포인트로 변경
        // const response = await fetch("/api-proxy/rest-api/v1/loops", {
        //   headers: {
        //     Accept: "application/json",
        //     Authorization: `Bearer ${accessToken}`,
        //   },
        // });
        // if (response.ok) {
        //   const data = await response.json();
        //   setLoopList(data);
        // }
        
        // 임시: 엠티뷰를 보기 위해 빈 배열로 설정
        // 데이터가 있을 때 테스트하려면 아래 주석을 해제하세요:
        // setLoopList([
        //   { id: 1, title: "아침 운동", completed: 3, total: 5 },
        //   { id: 2, title: "토익 스터디", completed: 3, total: 5 },
        //   { id: 3, title: "마케팅 ch.7", completed: 3, total: 5 },
        // ]);
        setLoopList([]);
      } catch (error) {
        console.error("루프 데이터 로딩 실패", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoops();
  }, [accessToken]);

  const isEmpty = loopList.length === 0;

  const totalDone = loopList.reduce((acc, cur) => acc + cur.completed, 0);
  const totalCount = loopList.reduce((acc, cur) => acc + cur.total, 0);
  const progress = totalCount > 0 ? Math.round((totalDone / totalCount) * 100) : 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 228, 224, 0.3) 100%)",
      }}
    >
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

            {/* 버튼 자리 */}
            <button className="border rounded-lg py-2">
              오늘 하루의 루프를 모두 채워보세요!
            </button>

            <LoopList loops={loopList} />
          </>
        )}
      </div>
    </div>
  );
}


