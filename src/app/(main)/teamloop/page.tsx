"use client";

import Header from "@/components/common/Header";
import { TeamListSection } from "@/components/team/TeamListSection";
import { TeamCard } from "@/components/team/TeamCard";
import { TeamLoopFAB } from "@/components/team/TeamLoopFAB";
import type { TeamItem } from "@/components/team/types";

// TODO: API에서 데이터 가져오기
const mockMyTeams: TeamItem[] = [
  {
    id: 1,
    category: "스터디",
    title: "에펙 마스터",
    description: "3개월 동안 에펙 초보 탈출하기",
    startDate: "2025.12.3",
    endDate: "2026.2.26",
    progress: 75,
  },
];

const mockRecommendedTeams: TeamItem[] = [
  {
    id: 2,
    category: "스터디",
    title: "필라테스 독학",
    description: "모두같이 필라테스 독학하자^^",
    startDate: "2025.12.3",
    endDate: "2026.2.26",
  },
  {
    id: 3,
    category: "스터디",
    title: "정처기 도전",
    description: "한 번에 붙어봅시다!",
    startDate: "2025.12.3",
    endDate: "2026.2.26",
  },
  {
    id: 4,
    category: "스터디",
    title: "독서 왕 되기",
    description: "매일매일 책을 읽어보아요",
    startDate: "2025.12.3",
    endDate: "2026.2.26",
  },
];

export default function TeamLoopPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative">
        <Header leftType="none" rightType="user" />
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-base font-semibold leading-[150%] tracking-[-0.32px] text-[#3A3D40]">
          팀 루프
        </h1>
      </div>

      <main className="flex-1 space-y-8 py-6">
        {/* 내 팀 목록 */}
        <TeamListSection title="내 팀 목록" viewAllHref="/teamloop/my">
          <div className="overflow-x-auto">
            <div className="flex gap-4">
              {mockMyTeams.map((team) => (
                <TeamCard key={team.id} team={team} variant="my" />
              ))}
            </div>
          </div>
        </TeamListSection>

        {/* 다른 팀에 참여해보세요! */}
        <TeamListSection
          title="다른 팀에 참여해보세요!"
          viewAllHref="/teamloop/recommended"
        >
          <div className="flex flex-col">
            {mockRecommendedTeams.map((team) => (
              <TeamCard key={team.id} team={team} variant="recommended" />
            ))}
          </div>
        </TeamListSection>
      </main>

      <TeamLoopFAB />
    </div>
  );
}
