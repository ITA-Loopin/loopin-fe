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
    }>("/rest-api/v1/teams/", {
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

/**
 * 팀 상세 정보 조회 API 응답 타입
 */
export type TeamDetailApiResponse = {
  teamId: number;
  currentDate: string;
  category: TeamCategoryString;
  name: string;
  goal: string;
  leaderId: number;
  createdAt: string;
  visibility: "PUBLIC" | "PRIVATE";
  totalLoopCount: number;
  teamTotalProgress: number;
  myLoopCount: number;
  myTotalProgress: number;
};

/**
 * 팀 상세 정보 조회 API
 */
export async function fetchTeamDetail(teamId: number): Promise<TeamItem & { 
  myTotalProgress: number; 
  teamTotalProgress: number;
  leaderId: number;
  createdAt: string;
  visibility: "PUBLIC" | "PRIVATE";
  totalLoopCount: number;
}> {
  const response = await apiFetch<{
    success: boolean;
    code: string;
    message: string;
    data: TeamDetailApiResponse;
    timestamp: string;
  }>(`/rest-api/v1/teams/${teamId}`);

  if (!response.success || !response.data) {
    throw new Error(response.message || "팀 정보 조회에 실패했습니다");
  }

  const data = response.data;
  return {
    id: data.teamId,
    category: data.category,
    title: data.name,
    description: data.goal,
    progress: data.myTotalProgress, // 내 루프 진행률 사용
    myTotalProgress: data.myTotalProgress,
    teamTotalProgress: data.teamTotalProgress,
    leaderId: data.leaderId,
    createdAt: data.createdAt,
    visibility: data.visibility,
    totalLoopCount: data.totalLoopCount,
  };
}

/**
 * 팀 루프 리스트 API 응답 타입
 */
export type TeamLoopApiItem = {
  id: number;
  title: string;
  loopDate: string;
  type: "COMMON" | "INDIVIDUAL";
  importance: "HIGH" | "MEDIUM" | "LOW";
  teamProgress: number;
  personalProgress: number;
  isParticipating: boolean;
  repeatCycle?: string;
};

export type TeamLoopListApiResponse = {
  success: boolean;
  code: string;
  message: string;
  data: TeamLoopApiItem[];
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

/**
 * 팀 루프 리스트 조회 API
 */
export async function fetchTeamLoops(
  teamId: number,
  date?: string,
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
): Promise<TeamLoopApiItem[]> {
  const searchParams = new URLSearchParams();
  
  if (date) {
    searchParams.append("date", date);
  }
  
  if (status) {
    searchParams.append("status", status);
  }
  
  const queryString = searchParams.toString();
  const url = queryString
    ? `/rest-api/v1/teams/${teamId}/loops?${queryString}`
    : `/rest-api/v1/teams/${teamId}/loops`;
  
  const response = await apiFetch<TeamLoopListApiResponse>(url);

  if (!response.success || !response.data) {
    throw new Error(response.message || "팀 루프 리스트 조회에 실패했습니다");
  }

  return response.data;
}

/**
 * 팀원 정보 타입
 */
export type TeamMember = {
  memberId: number;
  nickname: string;
  profileImage: string;
};

/**
 * 팀원 목록 API 응답 타입
 */
export type TeamMemberListApiResponse = {
  success: boolean;
  code: string;
  message: string;
  data: TeamMember[];
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

/**
 * 팀원 목록 조회 API
 */
export async function fetchTeamMembers(teamId: number): Promise<TeamMember[]> {
  const response = await apiFetch<TeamMemberListApiResponse>(
    `/rest-api/v1/teams/${teamId}/members`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "팀원 목록 조회에 실패했습니다");
  }

  return response.data;
}

/**
 * 팀 루프 체크리스트 API 응답 타입
 */
export type TeamLoopChecklistApiItem = {
  id: number;
  content: string;
  isChecked: boolean;
};

export type TeamLoopChecklistApiResponse = {
  success: boolean;
  code: string;
  message: string;
  data: TeamLoopChecklistApiItem[];
  timestamp: string;
};

/**
 * 팀 루프 체크리스트 조회 API
 */
export async function fetchTeamLoopChecklists(
  loopId: number
): Promise<TeamLoopChecklistApiItem[]> {
  const response = await apiFetch<TeamLoopChecklistApiResponse>(
    `/rest-api/v1/teams/loops/${loopId}/checklists`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "팀 루프 체크리스트 조회에 실패했습니다");
  }

  return response.data;
}

/**
 * 팀 목록 순서 변경 API 요청 타입
 */
export type UpdateTeamOrderRequest = {
  teamId: number;
  newPosition: number;
};

/**
 * 팀 목록 순서 변경 API
 */
export async function updateTeamOrder(
  data: UpdateTeamOrderRequest
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiFetch<{
      success: boolean;
      code: string;
      message: string;
      data?: unknown;
    }>("/rest-api/v1/teams/order", {
      method: "PUT",
      json: data,
    });

    if (!response.success) {
      throw new Error(response.message || "팀 순서 변경에 실패했습니다");
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
 * 팀 루프 상세 조회 (내 루프) API 응답 타입
 */
export type TeamLoopMyDetailApiResponse = {
  success: boolean;
  code: string;
  message: string;
  data: {
    id: number;
    title: string;
    loopDate: string;
    type: "COMMON" | "INDIVIDUAL";
    repeatCycle: string;
    importance: "HIGH" | "MEDIUM" | "LOW";
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    personalProgress: number;
    totalChecklistCount: number;
    checklists: Array<{
      checklistId: number;
      content: string;
      isCompleted: boolean;
    }>;
  };
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

/**
 * 팀 루프 상세 조회 (내 루프) API
 */
export async function fetchTeamLoopMyDetail(
  teamId: number,
  loopId: number
): Promise<TeamLoopMyDetailApiResponse["data"]> {
  const response = await apiFetch<TeamLoopMyDetailApiResponse>(
    `/rest-api/v1/teams/${teamId}/loops/${loopId}/my`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "팀 루프 상세 정보 조회에 실패했습니다");
  }

  return response.data;
}

/**
 * 팀 루프 상세 조회 (팀 루프) API 응답 타입
 */
export type TeamLoopAllDetailApiResponse = {
  success: boolean;
  code: string;
  message: string;
  data: {
    id: number;
    title: string;
    loopDate: string;
    type: "COMMON" | "INDIVIDUAL";
    repeatCycle: string;
    importance: "HIGH" | "MEDIUM" | "LOW";
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    teamProgress: number;
    totalChecklistCount: number;
    checklists: Array<{
      checklistId: number;
      content: string;
    }>;
    memberProgresses: Array<{
      memberId: number;
      nickname: string;
      status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
      progress: number;
    }>;
  };
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

/**
 * 팀 루프 상세 조회 (팀 루프) API
 */
export async function fetchTeamLoopAllDetail(
  teamId: number,
  loopId: number
): Promise<TeamLoopAllDetailApiResponse["data"]> {
  const response = await apiFetch<TeamLoopAllDetailApiResponse>(
    `/rest-api/v1/teams/${teamId}/loops/${loopId}/all`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "팀 루프 상세 정보 조회에 실패했습니다");
  }

  return response.data;
}

/**
 * 팀 루프 체크리스트 추가 API
 */
export async function createTeamLoopChecklist(
  loopId: number,
  content: string
): Promise<{ id: number; content: string; completed: boolean }> {
  try {
    const response = await apiFetch<{
      success: boolean;
      code: string;
      message: string;
      data: {
        id: number;
        content: string;
        completed: boolean;
      };
    }>(`/rest-api/v1/teams/loops/${loopId}/checklists`, {
      method: "POST",
      json: { content },
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || "체크리스트 추가에 실패했습니다");
    }

    return response.data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "체크리스트 추가에 실패했습니다";
    throw new Error(errorMessage);
  }
}

/**
 * 팀 루프 체크리스트 체크/해제 API
 */
export async function toggleTeamLoopChecklist(
  checklistId: number
): Promise<{ id: number; content: string; isChecked: boolean }> {
  try {
    const response = await apiFetch<{
      success: boolean;
      code: string;
      message: string;
      data: {
        id: number;
        content: string;
        isChecked: boolean;
      };
    }>(`/rest-api/v1/teams/loops/checklists/${checklistId}/check`, {
      method: "PATCH",
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || "체크리스트 상태 변경에 실패했습니다");
    }

    return response.data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "체크리스트 상태 변경에 실패했습니다";
    throw new Error(errorMessage);
  }
}

/**
 * 팀 루프 체크리스트 삭제 API
 */
export async function deleteTeamLoopChecklist(
  checklistId: number
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiFetch<{
      success: boolean;
      code: string;
      message: string;
      data?: unknown;
    }>(`/rest-api/v1/teams/loops/checklists/${checklistId}`, {
      method: "DELETE",
    });

    if (!response.success) {
      throw new Error(response.message || "체크리스트 삭제에 실패했습니다");
    }

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "체크리스트 삭제에 실패했습니다";
    throw new Error(errorMessage);
  }
}

/**
 * 팀 루프 멤버 체크리스트 조회 API 응답 타입
 */
export type TeamLoopMemberChecklistApiResponse = {
  success: boolean;
  code: string;
  message: string;
  data: {
    memberId: number;
    nickname: string;
    progress: number;
    checklists: Array<{
      id: number;
      content: string;
      isChecked: boolean;
    }>;
  };
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

/**
 * 팀 루프 멤버 체크리스트 조회 API
 */
export async function fetchTeamLoopMemberChecklist(
  loopId: number,
  memberId?: number
): Promise<TeamLoopMemberChecklistApiResponse["data"]> {
  const url = memberId
    ? `/rest-api/v1/teams/loops/${loopId}/checklists?memberId=${memberId}`
    : `/rest-api/v1/teams/loops/${loopId}/checklists`;
  
  const response = await apiFetch<TeamLoopMemberChecklistApiResponse>(url);

  if (!response.success || !response.data) {
    throw new Error(response.message || "팀원 체크리스트 조회에 실패했습니다");
  }

  return response.data;
}


/**
 * 팀 삭제 API
 */
export async function deleteTeam(
  teamId: number
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiFetch<{
      success: boolean;
      code: string;
      message: string;
      data?: unknown;
    }>(`/rest-api/v1/teams/${teamId}`, {
      method: "DELETE",
    });

    if (!response.success) {
      throw new Error(response.message || "팀 삭제에 실패했습니다");
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
 * 팀 활동 조회 API 응답 타입
 */
export type TeamMemberActivitiesApiResponse = {
  success: boolean;
  code: string;
  message: string;
  data: {
    memberActivities: Array<{
      memberId: number;
      nickname: string;
      isMe: boolean;
      statusStats: {
        NOT_STARTED?: number;
        IN_PROGRESS?: number;
        COMPLETED?: number;
      };
      typeStats: {
        COMMON?: number;
        INDIVIDUAL?: number;
      };
      overallProgress: number;
      lastActivity?: {
        actionType: string;
        targetName: string;
        timestamp: string;
      };
    }>;
    recentTeamActivities: Array<{
      memberId: number;
      nickname: string;
      actionType: string;
      targetName: string;
      timestamp: string;
    }>;
  };
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

/**
 * 팀 활동 조회 API
 */
export async function fetchTeamMemberActivities(
  teamId: number
): Promise<TeamMemberActivitiesApiResponse["data"]> {
  const response = await apiFetch<TeamMemberActivitiesApiResponse>(
    `/rest-api/v1/teams/${teamId}/member-activities`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "팀 활동 조회에 실패했습니다");
  }

  return response.data;
}


