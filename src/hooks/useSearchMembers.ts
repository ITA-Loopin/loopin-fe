import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiPage } from "@/lib/api";

type MemberSearchItem = {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string;
};

type TeamMember = Pick<MemberSearchItem, "id" | "nickname" | "email">;

export function useSearchMembers() {
  const [keyword, setKeyword] = useState("");

  const query = useInfiniteQuery({
    queryKey: ["members", "search", keyword],
    queryFn: ({ pageParam }) =>
      apiPage<MemberSearchItem>(
        "/rest-api/v1/member/search",
        {
          searchParams: {
            keyword,
            cursor: pageParam,
            size: 15,
          },
        },
      ),
    enabled: keyword.length > 0,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.page.hasNext ? lastPage.page.nextCursor : undefined,
  });

  const searchResults: TeamMember[] =
    query.data?.pages.flatMap((page) =>
      page.items.map(({ id, nickname, email }) => ({
        id,
        nickname,
        email: email || "",
      })),
    ) ?? [];

  const searchMembers = (nextKeyword: string) => {
    setKeyword(nextKeyword.trim());
  };

  const clearSearchResults = () => {
    setKeyword("");
  };

  return {
    searchResults,
    isSearching: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    loadMore: query.fetchNextPage,
    searchMembers,
    clearSearchResults,
  };
}
