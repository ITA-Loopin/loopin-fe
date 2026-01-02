"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import { TeamCard } from "@/components/team/TeamCard";
import type { TeamItem } from "@/components/team/types";
import { fetchMyTeamList } from "@/lib/team";

export default function MyTeamListPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadTeams = async () => {
      try {
        setIsLoading(true);
        const result = await fetchMyTeamList();
        if (!cancelled) {
          setTeams(result.teams);
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

    loadTeams();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative">
        <Header leftType="back" rightType="user" onBack={() => router.back()} />
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-base font-semibold leading-[150%] tracking-[-0.32px] text-[#3A3D40]">
          내 팀 목록
        </h1>
      </div>

      <main className="flex-1 px-[16px] py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#A0A9B1]">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#A0A9B1]">참여한 팀이 없습니다</p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-4">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} variant="my" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

