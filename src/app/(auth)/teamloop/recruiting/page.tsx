"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/common/Button";
import { TeamCard } from "@/components/team/TeamCard";
import { fetchRecruitingTeams } from "@/services/team";

export default function RecruitingTeamListPage() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["teams", "recruiting"],
    queryFn: ({ pageParam }) =>
      fetchRecruitingTeams({ cursor: pageParam, size: 20 }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNext ? lastPage.pageInfo.nextCursor : undefined,
  });

  const teams = data?.pages.flatMap((page) => page.teams) ?? [];

  const loadMoreButton = hasNextPage ? (
    <Button
      variant="outline"
      className="w-full"
      disabled={isFetchingNextPage}
      onClick={() => fetchNextPage()}
    >
      {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
    </Button>
  ) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-red-500">{error.message}</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500">모집 중인 팀이 없습니다.</p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-4">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} variant="recruiting" />
            ))}
            {loadMoreButton}
          </div>
        )}
      </main>
    </div>
  );
}
