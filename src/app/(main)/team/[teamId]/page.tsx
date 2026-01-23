"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import Image from "next/image";
import Header from "@/components/common/Header";
import { LoopProgress } from "@/components/home/LoopProgress";
import { TeamLoopList } from "@/components/team/TeamLoopList";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { AddTeamLoopSheet } from "@/components/team/AddTeamLoopSheet";
import {
  fetchTeamDetail,
  fetchTeamLoops,
  fetchTeamCalendarLoops,
  type TeamLoopApiItem,
} from "@/lib/team";
import { TeamLoopFAB } from "@/components/team/TeamLoopFAB";
import type { TeamItem } from "@/components/team/types";

type TeamDetail = TeamItem & {
  myTotalProgress: number;
  teamTotalProgress: number;
};

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params?.teamId as string;
  const [activeTab, setActiveTab] = useState<"my" | "team" | "calendar">("my");
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamLoops, setTeamLoops] = useState<TeamLoopApiItem[]>([]);
  const [isLoadingLoops, setIsLoadingLoops] = useState(true);
  const [isAddLoopSheetOpen, setIsAddLoopSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(dayjs());
  const [loopDays, setLoopDays] = useState<Map<string, boolean>>(new Map());
  const [isLoadingLoopDays, setIsLoadingLoopDays] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadTeamDetail = async () => {
      if (!teamId) return;

      try {
        setIsLoading(true);
        setError(null);
        const teamData = await fetchTeamDetail(Number(teamId));
        if (!cancelled) {
          setTeam(teamData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "팀 정보를 불러오는데 실패했습니다",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadTeamDetail();

    return () => {
      cancelled = true;
    };
  }, [teamId]);

  // 팀 루프 리스트 가져오기
  useEffect(() => {
    let cancelled = false;

    const loadTeamLoops = async () => {
      if (!teamId) return;

      try {
        setIsLoadingLoops(true);
        // 캘린더 탭이고 날짜가 선택된 경우 해당 날짜의 루프 조회
        const date =
          activeTab === "calendar" && selectedDate
            ? selectedDate.format("YYYY-MM-DD")
            : undefined;
        const loops = await fetchTeamLoops(Number(teamId), date);
        if (!cancelled) {
          setTeamLoops(loops);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("팀 루프 리스트 조회 실패", err);
          setTeamLoops([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLoops(false);
        }
      }
    };

    loadTeamLoops();

    return () => {
      cancelled = true;
    };
  }, [teamId, activeTab, selectedDate]);

  // 팀 루프 캘린더 (루프가 있는 날짜) 가져오기
  useEffect(() => {
    let cancelled = false;

    const loadTeamCalendarLoops = async () => {
      if (!teamId || activeTab !== "calendar") return;

      try {
        setIsLoadingLoopDays(true);
        const year = visibleMonth.year();
        const month = visibleMonth.month() + 1; // dayjs month는 0-based이므로 +1
        const loopDaysMap = await fetchTeamCalendarLoops(
          Number(teamId),
          year,
          month,
        );
        if (!cancelled) {
          setLoopDays(loopDaysMap);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("팀 루프 캘린더 조회 실패", err);
          setLoopDays(new Map());
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLoopDays(false);
        }
      }
    };

    loadTeamCalendarLoops();

    return () => {
      cancelled = true;
    };
  }, [teamId, activeTab, visibleMonth]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-body-2-m text-[var(--gray-500)]">로딩 중...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header
          leftType="back"
          rightType="none"
          onBack={() => router.back()}
          centerTitle="팀 상세"
        />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-body-2-m text-red-500">
            {error || "팀 정보를 불러올 수 없습니다"}
          </p>
        </div>
      </div>
    );
  }

  const teamName = team.title;
  const goal = team.description;
  // 탭에 따라 다른 진행률 사용
  const progress =
    activeTab === "my"
      ? (team.myTotalProgress ?? 0)
      : (team.teamTotalProgress ?? 0);

  return (
    <div className="flex flex-col min-h-full">
      {/* 확장된 헤더 영역 (Header + 탭) */}
      <div className="bg-white/30 backdrop-blur-[7px] flex-shrink-0">
        <Header
          leftType="back"
          rightType="user"
          onBack={() => router.back()}
          centerTitle={teamName}
          className="bg-transparent backdrop-blur-none border-none"
        />

        {/* 탭 */}
        <div className="flex w-full items-center border-b border-[var(--gray-200)]">
          <button
            onClick={() => setActiveTab("my")}
            className={`flex-1 py-3 text-body-2-sb transition-colors ${
              activeTab === "my"
                ? "text-[var(--primary-500)] border-b-1 border-[var(--primary-500)]"
                : "text-[var(--gray-400)]"
            }`}
          >
            내 루프
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`flex-1 py-3 text-body-2-sb transition-colors ${
              activeTab === "team"
                ? "text-[var(--primary-500)] border-b-1 border-[var(--primary-500)]"
                : "text-[var(--gray-400)]"
            }`}
          >
            팀 루프
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex-1 py-3 text-body-2-sb transition-colors ${
              activeTab === "calendar"
                ? "text-[var(--primary-500)] border-b-1 border-[var(--primary-500)]"
                : "text-[var(--gray-400)]"
            }`}
          >
            캘린더
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 py-6">
        {/* 날짜와 목표 영역 */}
        <div className="mb-6">
          {/* 날짜와 아이콘 버튼 */}
          <div className="flex items-center justify-between mb-[6px]">
            <p className="text-body-2-m text-[var(--gray-600)]">
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
            <button
              type="button"
              onClick={() => router.push(`/team/${teamId}/manage`)}
              className="flex items-center justify-center p-0 bg-transparent cursor-pointer"
              aria-label="팀 관리하기"
            >
              <svg
                width="22"
                height="24"
                viewBox="0 0 22 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.84637 3.65039L8.58351 1.74753C8.70783 1.42536 8.92655 1.14824 9.21102 0.952469C9.4955 0.7567 9.83247 0.651411 10.1778 0.650391H11.5835C11.9288 0.651411 12.2658 0.7567 12.5503 0.952469C12.8348 1.14824 13.0535 1.42536 13.1778 1.74753L13.9149 3.65039L16.4178 5.09039L18.4407 4.78182C18.7775 4.7361 19.1203 4.79155 19.4255 4.94112C19.7308 5.09068 19.9847 5.32762 20.1549 5.62182L20.8407 6.82182C21.0164 7.1207 21.0973 7.46584 21.0728 7.81168C21.0484 8.15753 20.9196 8.48781 20.7035 8.75896L19.4521 10.3532V13.2332L20.7378 14.8275C20.9539 15.0987 21.0826 15.429 21.1071 15.7748C21.1316 16.1207 21.0506 16.4658 20.8749 16.7647L20.1892 17.9647C20.019 18.2589 19.7651 18.4958 19.4598 18.6454C19.1546 18.7949 18.8118 18.8504 18.4749 18.8047L16.4521 18.4961L13.9492 19.9361L13.2121 21.839C13.0878 22.1611 12.869 22.4383 12.5846 22.634C12.3001 22.8298 11.9631 22.9351 11.6178 22.9361H10.1778C9.83247 22.9351 9.4955 22.8298 9.21102 22.634C8.92655 22.4383 8.70783 22.1611 8.58351 21.839L7.84637 19.9361L5.34351 18.4961L3.32065 18.8047C2.98382 18.8504 2.64101 18.7949 2.33576 18.6454C2.03052 18.4958 1.77664 18.2589 1.60637 17.9647L0.920652 16.7647C0.744941 16.4658 0.663985 16.1207 0.688469 15.7748C0.712953 15.429 0.841727 15.0987 1.0578 14.8275L2.30922 13.2332V10.3532L1.02351 8.75896C0.807441 8.48781 0.678668 8.15753 0.654183 7.81168C0.629699 7.46584 0.710655 7.1207 0.886366 6.82182L1.57208 5.62182C1.74235 5.32762 1.99624 5.09068 2.30148 4.94112C2.60672 4.79155 2.94954 4.7361 3.28637 4.78182L5.30922 5.09039L7.84637 3.65039ZM7.45208 11.7932C7.45208 12.4714 7.65316 13.1342 8.0299 13.6981C8.40664 14.2619 8.94211 14.7013 9.56859 14.9608C10.1951 15.2203 10.8845 15.2882 11.5495 15.1559C12.2146 15.0236 12.8255 14.6971 13.305 14.2176C13.7845 13.7381 14.1111 13.1272 14.2433 12.4621C14.3756 11.7971 14.3077 11.1077 14.0482 10.4812C13.7887 9.8547 13.3493 9.31923 12.7855 8.9425C12.2216 8.56576 11.5588 8.36468 10.8807 8.36468C9.97134 8.36468 9.09927 8.7259 8.45629 9.36888C7.8133 10.0119 7.45208 10.8839 7.45208 11.7932V11.7932Z"
                  stroke="#3A3D40"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* 목표 */}
          <h2 className="text-title-2-b text-[var(--gray-black)]">{goal}</h2>
        </div>

        {/* 루프 프로그레스 또는 캘린더 */}
        {activeTab === "calendar" ? (
          <div className="flex justify-center -mt-6 mb-6">
            <MonthCalendar
              visibleMonth={visibleMonth}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onChangeMonth={(offset) => {
                setVisibleMonth((prev) => prev.add(offset, "month"));
              }}
              loopDays={loopDays}
            />
          </div>
        ) : (
          <div className="flex justify-center mb-6">
            <LoopProgress progress={progress} />
          </div>
        )}

        {/* 툴팁 독려멘트 */}
        {activeTab !== "calendar" && (
          <div className="mb-6 flex justify-center">
            <div className="relative flex items-center justify-center">
              <div className="relative flex h-9 self-stretch items-center justify-center gap-[10px] rounded-[5px] bg-white/50 backdrop-blur-[0px] px-3 py-[7px] text-body-2-b text-[var(--gray-700)] shadow-[0_0_7px_0_rgba(0,0,0,0.05)]">
                {/* 삼각형 포인터 */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="12"
                  viewBox="0 0 17 12"
                  fill="none"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  <path d="M8.5 0L17 12H0L8.5 0Z" className="fill-white/50" />
                </svg>
                <span>오늘 하루의 루프를 모두 채워보세요!</span>
              </div>
            </div>
          </div>
        )}

        {/* 루프 리스트 */}
        <TeamLoopList
          loops={teamLoops}
          isLoading={isLoadingLoops}
          activeTab={activeTab}
          teamId={Number(teamId)}
        />

        {/* 루프 추가하기 버튼 / 팀 활동 기록보기 버튼 */}
        <div className="flex justify-center">
          {activeTab === "team" ? (
            <button
              type="button"
              onClick={() => {
                router.push(`/team/${teamId}/activity`);
              }}
              className="flex w-full h-9 px-2 py-1.5 justify-center items-center gap-2 rounded-[5px] bg-[var(--gray-200)] text-body-2-sb text-[var(--gray-600)] whitespace-nowrap"
            >
              팀 활동 기록보기
            </button>
          ) : (
            <PrimaryButton
              variant="secondary"
              onClick={() => setIsAddLoopSheetOpen(true)}
              className="max-w-[400px]"
            >
              루프 추가하기
            </PrimaryButton>
          )}
        </div>
      </main>

      {/* 루프 추가 바텀 시트 */}
      {teamId && (
        <AddTeamLoopSheet
          isOpen={isAddLoopSheetOpen}
          onClose={() => setIsAddLoopSheetOpen(false)}
          teamId={Number(teamId)}
          defaultStartDate={
            activeTab === "calendar" && selectedDate
              ? selectedDate.format("YYYY-MM-DD")
              : undefined
          }
          onCreated={() => {
            setIsAddLoopSheetOpen(false);

            // 팀 상세 정보 새로고침 (myTotalProgress, teamTotalProgress 업데이트)
            const loadTeamDetail = async () => {
              if (!teamId) return;
              try {
                const teamData = await fetchTeamDetail(Number(teamId));
                setTeam(teamData);
              } catch (err) {
                console.error("팀 정보 조회 실패", err);
              }
            };

            // 루프 리스트 새로고침
            const loadTeamLoops = async () => {
              if (!teamId) return;
              try {
                setIsLoadingLoops(true);
                const date =
                  activeTab === "calendar" && selectedDate
                    ? selectedDate.format("YYYY-MM-DD")
                    : undefined;
                const loops = await fetchTeamLoops(Number(teamId), date);
                setTeamLoops(loops);
              } catch (err) {
                console.error("팀 루프 리스트 조회 실패", err);
                setTeamLoops([]);
              } finally {
                setIsLoadingLoops(false);
              }
            };

            // 루프 캘린더 새로고침 (캘린더 탭인 경우)
            const loadTeamCalendarLoops = async () => {
              if (!teamId || activeTab !== "calendar") return;
              try {
                const year = visibleMonth.year();
                const month = visibleMonth.month() + 1;
                const loopDaysMap = await fetchTeamCalendarLoops(
                  Number(teamId),
                  year,
                  month,
                );
                setLoopDays(loopDaysMap);
              } catch (err) {
                console.error("팀 루프 캘린더 조회 실패", err);
                setLoopDays(new Map());
              }
            };

            loadTeamDetail();
            loadTeamLoops();
            loadTeamCalendarLoops();
          }}
        />
      )}

      {/* 플로팅 버튼들 */}
      <TeamLoopFAB
        onClick={() => router.push(`/team/${teamId}/chat`)}
        imageSrc="/team/GroupFAB.svg"
        imageAlt="팀 채팅"
        imageWidth={24}
        imageHeight={24}
        ariaLabel="팀 채팅"
        right="right-4"
        bottom="bottom-70"
      />
    </div>
  );
}
