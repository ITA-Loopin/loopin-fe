"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import { TeamListSection } from "@/components/team/TeamListSection";
import { TeamCard } from "@/components/team/TeamCard";
import { TeamLoopFAB } from "@/components/team/TeamLoopFAB";
import type { TeamItem } from "@/components/team/types";
import { fetchMyTeamList } from "@/lib/team";

const mockRecommendedTeams: TeamItem[] = [
  {
    id: 2,
    category: "STUDY",
    title: "필라테스 독학",
    description: "모두같이 필라테스 독학하자^^",
    startDate: "2025.12.3",
    endDate: "2026.2.26",
  },
  {
    id: 3,
    category: "STUDY",
    title: "정처기 도전",
    description: "한 번에 붙어봅시다!",
    startDate: "2025.12.3",
    endDate: "2026.2.26",
  },
  {
    id: 4,
    category: "STUDY",
    title: "독서 왕 되기",
    description: "매일매일 책을 읽어보아요",
    startDate: "2025.12.3",
    endDate: "2026.2.26",
  },
];

export default function TeamLoopPage() {
  const router = useRouter();
  const [myTeams, setMyTeams] = useState<TeamItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadMyTeams = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchMyTeamList();

        if (!cancelled) {
          setMyTeams(result.teams);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "팀 리스트를 불러오는데 실패했습니다");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadMyTeams();

    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative">
        <Header leftType="none" rightType="user" />
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-base font-semibold leading-[150%] tracking-[-0.32px] text-[#3A3D40]">
          팀 루프
        </h1>
      </div>

      <div className="flex w-full flex-col items-start gap-[6px] px-[16px] pb-6 pt-6">
        <h2 className="text-[14px] font-medium leading-[150%] tracking-[-0.28px] text-[var(--primary-main,#FF543F)]">
          TEAM LOOP</h2>
        <p className="text-[20px] font-bold leading-[140%] tracking-[-0.4px] text-[var(--gray-black,#121212)]">
          팀과 함께 루프를 완성해보세요!</p>
      </div>

      <main className="flex-1 space-y-8 py-6 px-[16px]">
        {/* 내 팀 목록 */}
        <div className="flex w-full flex-col items-start gap-4">
          <TeamListSection title="내 팀 목록" viewAllHref="/teamloop/my">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-[#A0A9B1]">로딩 중...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : myTeams.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-[#A0A9B1]">참여한 팀이 없습니다</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex gap-4">
                  {myTeams.map((team) => (
                    <div key={team.id} className="shrink-0 w-[calc(100vw-64px)] w-full snap-start">
                      <TeamCard team={team} variant="my" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TeamListSection>
        </div>

        {/* 다른 팀에 참여해보세요! */}
        <TeamListSection
          title="다른 팀에 참여해보세요!"
          viewAllHref="/teamloop/recommended"
        >
          <div className="flex w-full flex-col items-start gap-4">
            {mockRecommendedTeams.map((team) => (
              <TeamCard key={team.id} team={team} variant="recommended" />
            ))}
          </div>
        </TeamListSection>
      </main>

      <TeamLoopFAB onClick={() => router.push("/teamloop/create")} />
    </div>
  );
}
