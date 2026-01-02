import { useState } from "react";
import { apiFetch } from "@/lib/api";

type TeamMember = {
  id: number;
  nickname: string;
  email: string;
};

export function useSearchMembers() {
  const [searchResults, setSearchResults] = useState<TeamMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchMembers = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiFetch<{
        success: boolean;
        code: string;
        message: string;
        data?: Array<{
          id: number;
          email: string;
          nickname: string;
          profileImageUrl: string;
        }>;
        page: {
          page: number;
          size: number;
          totalPages: number;
          totalElements: number;
          first: boolean;
          last: boolean;
          hasNext: boolean;
        };
        timestamp: string;
        traceId: string;
      }>("/rest-api/v1/member/search", {
        searchParams: {
          keyword: keyword.trim(),
          page: 0,
          size: 15,
        },
      });

      if (response.success && response.data) {
        setSearchResults(
          response.data.map((item) => ({
            id: item.id,
            nickname: item.nickname,
            email: item.email || "",
          }))
        );
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearchResults = () => {
    setSearchResults([]);
  };

  return {
    searchResults,
    isSearching,
    searchMembers,
    clearSearchResults,
  };
}

