"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import { TeamListSection } from "@/components/team/TeamListSection";
import { TeamCard } from "@/components/team/TeamCard";
import { TeamLoopFAB } from "@/components/team/TeamLoopFAB";
import type { TeamItem } from "@/components/team/types";
import { fetchMyTeamList, fetchRecruitingTeams } from "@/lib/team";

export default function TeamLoopPage() {
  const router = useRouter();
  const [myTeams, setMyTeams] = useState<TeamItem[]>([]);
  const [recruitingTeams, setRecruitingTeams] = useState<TeamItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecruiting, setIsLoadingRecruiting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recruitingError, setRecruitingError] = useState<string | null>(null);

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
          setError(
            err instanceof Error
              ? err.message
              : "팀 리스트를 불러오는데 실패했습니다"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    const loadRecruitingTeams = async () => {
      try {
        setIsLoadingRecruiting(true);
        setRecruitingError(null);
        const teams = await fetchRecruitingTeams();

        if (!cancelled) {
          setRecruitingTeams(teams);
        }
      } catch (err) {
        if (!cancelled) {
          setRecruitingError(
            err instanceof Error
              ? err.message
              : "모집 중인 팀 리스트를 불러오는데 실패했습니다"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRecruiting(false);
        }
      }
    };

    loadMyTeams();
    loadRecruitingTeams();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <Header leftType="none" rightType="user" centerTitle="팀 루프" />

      {/* 팀 루프 홈 타이틀 */}
      <div className="flex w-full flex-col items-start gap-[6px] px-[16px] pb-6 pt-6">
        <h2 className="text-body-2-m text-[var(--primary-main)]">TEAM LOOP</h2>
        <p className="text-title-2-b text-[var(--gray-black)]">
          팀과 함께 루프를 완성해보세요!
        </p>
      </div>

      <main className="flex-1 space-y-8 py-6 pl-4 pr-4">
        {/* 내 팀 목록 */}
        <div className="flex w-full flex-col items-start gap-4">
          <TeamListSection title="내 팀 목록" viewAllHref="/teamloop/my">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-caption-m text-[var(--gray-500)]">
                  로딩 중...
                </p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-caption-m text-red-500">{error}</p>
              </div>
            ) : myTeams.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-body-2-sb text-[var(--gray-500)] text-center">
                  아직 참여 중인 팀이 없어요 <br /> 새로운 팀을 생성해보세요!
                </p>
              </div>
            ) : (
              // main의 좌우 padding(16px)을 이 섹션에서만 상쇄
              <div className="-mx-4">
                <div
                  className="w-full scroll-pl-4 overflow-x-auto scroll-smooth snap-x snap-mandatory
                             [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  <div className="flex gap-[10px] pl-4">
                    {myTeams.map((team) => (
                      <div
                        key={team.id}
                        className="shrink-0 w-[calc(100%-32px)] snap-start"
                      >
                        <TeamCard team={team} variant="my" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TeamListSection>
        </div>

        {/* 모집 중인 팀 목록 */}
        <TeamListSection
          title="다른 팀에 참여해보세요!"
          viewAllHref="/teamloop/recruiting"
        >
          {isLoadingRecruiting ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-caption-m text-[var(--gray-500)]">
                로딩 중...
              </p>
            </div>
          ) : recruitingError ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-caption-m text-red-500">{recruitingError}</p>
            </div>
          ) : recruitingTeams.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-body-2-sb text-[var(--gray-500)] text-center">
                모집 중인 팀이 없어요
              </p>
            </div>
          ) : (
            <div className="flex w-full flex-col items-start gap-4">
              {recruitingTeams.slice(0, 3).map((team) => (
                <TeamCard key={team.id} team={team} variant="recruiting" />
              ))}
            </div>
          )}
        </TeamListSection>
      </main>

      {/* 팀 루프 홈 FAB */}
      <TeamLoopFAB
        onClick={() => router.push("/teamloop/create")}
        imageSrc="/team/plus_white.png"
        imageAlt="팀 루프 생성"
        imageWidth={18}
        imageHeight={18}
        ariaLabel="팀 루프 생성"
        right="right-4"
      />
    </div>
  );
}
