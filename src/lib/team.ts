import { apiFetch } from "./api";
import type { TeamItem, TeamCategoryString } from "@/components/team/types";

// API 응답 타입
export type TeamApiItem = {
  teamId: number;
  category: TeamCategoryString;
  name: string;
  goal: string;
  totalProgress: number;
};

export type TeamListApiResponse = {
  success: boolean;
  code: string;
  message: string;
  data: TeamApiItem[];
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
};

// API 응답을 TeamItem으로 변환
function mapTeamApiItemToTeamItem(apiItem: TeamApiItem): TeamItem {
  return {
    id: apiItem.teamId,
    category: apiItem.category, // 문자열 그대로 사용
    title: apiItem.name,
    description: apiItem.goal,
    progress: apiItem.totalProgress,
  };
}

/**
 * 나의 팀 리스트 조회 API
 */
export async function fetchMyTeamList(params?: {
  page?: number;
  size?: number;
}): Promise<{
  teams: TeamItem[];
  pageInfo: TeamListApiResponse["page"];
}> {
  const response = await apiFetch<TeamListApiResponse>(
    "/rest-api/v1/teams/my",
    {
      searchParams: params,
    }
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "팀 리스트 조회에 실패했습니다");
  }

  return {
    teams: response.data.map(mapTeamApiItemToTeamItem),
    pageInfo: response.page,
  };
}

/**
 * 팀 생성 API 요청 타입
 */
export type CreateTeamRequest = {
  category: TeamCategoryString;
  name: string;
  goal: string;
  invitedNicknames: string[];
};

/**
 * 팀 생성 API
 */
export async function createTeam(
  data: CreateTeamRequest
): Promise<{ success: boolean; message?: string }> {

  try {
    const response = await apiFetch<{
      success: boolean;
      code: string;
      message: string;
      data?: unknown;
    }>("/rest-api/v1/teams", {
      method: "POST",
      json: data,
    });

    if (!response.success) {
      throw new Error(response.message || "팀 생성에 실패했습니다");
    }

    return {
      success: true,
      message: response.message,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * 모집 중인 팀 API 응답 타입
 */
export type RecruitingTeamApiItem = {
  teamId: number;
  category: TeamCategoryString;
  name: string;
  goal: string;
  currentMemberCount: number;
};

export type RecruitingTeamListApiResponse = {
  success: boolean;
  code: string;
  message: string;
  data: RecruitingTeamApiItem[];
  timestamp: string;
  traceId: string;
};

/**
 * 모집 중인 팀 리스트 조회 API
 */
export async function fetchRecruitingTeams(): Promise<TeamItem[]> {
  const response = await apiFetch<RecruitingTeamListApiResponse>(
    "/rest-api/v1/teams/recruiting"
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "모집 중인 팀 리스트 조회에 실패했습니다");
  }

  // category, name, goal만 사용하여 TeamItem으로 변환
  return response.data.map((item) => ({
    id: item.teamId,
    category: item.category,
    title: item.name,
    description: item.goal,
  }));
}

