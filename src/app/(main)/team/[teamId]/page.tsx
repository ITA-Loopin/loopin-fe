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
import { TeamLoopFAB } from "@/components/team/TeamLoopFAB";
import {
  fetchTeamDetail,
  fetchTeamLoops,
  type TeamLoopApiItem,
} from "@/lib/team";
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
              : "팀 정보를 불러오는데 실패했습니다"
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
    <div className="flex flex-col">
      <Header
        leftType="back"
        rightType="user"
        onBack={() => router.back()}
        centerTitle={teamName}
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

      <main className="flex-1 px-4 py-6">
        {/* 날짜 */}
        <div className="mb-[6px]">
          <p className="text-body-2-m text-[var(--gray-600)]">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>

        {/* 목표 */}
        <div className="mb-6">
          <h2 className="text-title-2-b text-[var(--gray-black)]">{goal}</h2>
        </div>

        {/* 루프 프로그레스 또는 캘린더 */}
        {activeTab === "calendar" ? (
          <div className="flex justify-center mb-6">
            <MonthCalendar
              visibleMonth={visibleMonth}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onChangeMonth={(offset) => {
                setVisibleMonth((prev) => prev.add(offset, "month"));
              }}
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
            <div className="rounded-[10px] bg-[var(--gray-white)] px-4 py-3">
              <p className="text-body-2-m text-[var(--gray-800)] text-center">
                오늘 하루의 루프를 모두 채워보세요!
              </p>
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
                // TODO: 팀 활동 기록보기 페이지로 이동
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
          onCreated={() => {
            setIsAddLoopSheetOpen(false);
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
            loadTeamLoops();
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
