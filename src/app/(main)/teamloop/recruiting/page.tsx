"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import { TeamCard } from "@/components/team/TeamCard";
import type { TeamItem } from "@/components/team/types";
import { fetchRecruitingTeams } from "@/lib/team";

export default function RecruitingTeamListPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadTeams = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchRecruitingTeams();
        if (!cancelled) {
          setTeams(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "모집 중인 팀 리스트를 불러오는데 실패했습니다");
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
        <Header leftType="back" rightType="user" onBack={() => router.back()} centerTitle="모집 중인 팀" />
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
            <p className="text-sm text-[#A0A9B1]">모집 중인 팀이 없습니다</p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-4">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} variant="recruiting" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

