import { api, apiPage } from "@/lib/http";
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
    size: number;
    hasNext: boolean;
    nextCursor: string | null;
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
  cursor?: string | null;
  size?: number;
}): Promise<{
  teams: TeamItem[];
  pageInfo: TeamListApiResponse["page"];
}> {
  const searchParams: Record<string, string | number> = {};
  if (params?.cursor) {
    searchParams.cursor = params.cursor;
  }
  if (params?.size !== undefined) {
    searchParams.size = params.size;
  }

  const { items, page } = await apiPage<TeamApiItem>("/rest-api/v1/teams/my", {
    searchParams: Object.keys(searchParams).length > 0 ? searchParams : undefined,
  });

  return {
    teams: items.map(mapTeamApiItemToTeamItem),
    pageInfo: page,
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
  await api<void>("/rest-api/v1/teams/", { method: "POST", json: data });
  return { success: true };
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
  page: {
    size: number;
    hasNext: boolean;
    nextCursor: string | null;
  };
  timestamp: string;
  traceId: string;
};

/**
 * 모집 중인 팀 리스트 조회 API
 */
export async function fetchRecruitingTeams(params?: {
  cursor?: string | null;
  size?: number;
}): Promise<{
  teams: TeamItem[];
  pageInfo: RecruitingTeamListApiResponse["page"];
}> {
  const searchParams: Record<string, string | number> = {};
  if (params?.cursor) {
    searchParams.cursor = params.cursor;
  }
  if (params?.size !== undefined) {
    searchParams.size = params.size;
  }

  const { items, page } = await apiPage<RecruitingTeamApiItem>(
    "/rest-api/v1/teams/recruiting",
    {
      searchParams: Object.keys(searchParams).length > 0 ? searchParams : undefined,
    },
  );

  // category, name, goal만 사용하여 TeamItem으로 변환
  return {
    teams: items.map((item) => ({
      id: item.teamId,
      category: item.category,
      title: item.name,
      description: item.goal,
    })),
    pageInfo: page,
  };
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
  const data = await api<TeamDetailApiResponse>(`/rest-api/v1/teams/${teamId}`);

  return {
    id: data.teamId,
    category: data.category,
    title: data.name,
    description: data.goal,
    progress: Math.round(Math.min(Math.max(data.myTotalProgress, 0), 100)), // 내 루프 진행률 사용 (정수로 변환)
    myTotalProgress: Math.round(Math.min(Math.max(data.myTotalProgress, 0), 100)),
    teamTotalProgress: Math.round(Math.min(Math.max(data.teamTotalProgress, 0), 100)),
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
  personalStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  teamStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
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
    size: number;
    hasNext: boolean;
    nextCursor: string | null;
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

  return api<TeamLoopApiItem[]>(url);
}

/**
 * 팀 루프 캘린더 API 응답 타입
 */
export type TeamCalendarLoopDay = {
  date: string;
  hasTeamLoop: boolean;
};

export type TeamCalendarLoopsApiResponse = {
  success: boolean;
  code: string;
  message: string;
  data: {
    teamName: string;
    days: TeamCalendarLoopDay[];
  };
  page: {
    size: number;
    hasNext: boolean;
    nextCursor: string | null;
  };
  timestamp: string;
  traceId: string;
};

/**
 * 팀 루프 캘린더 조회 API
 */
export async function fetchTeamCalendarLoops(
  teamId: number,
  year: number,
  month: number
): Promise<Map<string, boolean>> {
  const data = await api<TeamCalendarLoopsApiResponse["data"]>(
    `/rest-api/v1/teams/${teamId}/loops/calendar`,
    {
      searchParams: {
        year,
        month,
        teamId,
      },
    }
  );

  const loopMap = new Map<string, boolean>();
  data.days.forEach((day) => {
    loopMap.set(day.date, day.hasTeamLoop);
  });

  return loopMap;
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
    size: number;
    hasNext: boolean;
    nextCursor: string | null;
  };
  timestamp: string;
  traceId: string;
};

/**
 * 팀원 목록 조회 API
 */
export async function fetchTeamMembers(teamId: number): Promise<TeamMember[]> {
  return api<TeamMember[]>(`/rest-api/v1/teams/${teamId}/members`);
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
  return api<TeamLoopChecklistApiItem[]>(
    `/rest-api/v1/teams/loops/${loopId}/checklists`
  );
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
  await api<void>("/rest-api/v1/teams/order", { method: "PUT", json: data });
  return { success: true };
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
    size: number;
    hasNext: boolean;
    nextCursor: string | null;
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
  return api<TeamLoopMyDetailApiResponse["data"]>(
    `/rest-api/v1/teams/${teamId}/loops/${loopId}/my`
  );
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
    size: number;
    hasNext: boolean;
    nextCursor: string | null;
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
  return api<TeamLoopAllDetailApiResponse["data"]>(
    `/rest-api/v1/teams/${teamId}/loops/${loopId}/all`
  );
}

/**
 * 팀 루프 체크리스트 추가 API
 */
export async function createTeamLoopChecklist(
  loopId: number,
  content: string
): Promise<{ id: number; content: string; completed: boolean }> {
  return api<{ id: number; content: string; completed: boolean }>(
    `/rest-api/v1/teams/loops/${loopId}/checklists`,
    { method: "POST", json: { content } }
  );
}

/**
 * 팀 루프 체크리스트 체크/해제 API
 */
export async function toggleTeamLoopChecklist(
  checklistId: number
): Promise<{ id: number; content: string; isChecked: boolean }> {
  return api<{ id: number; content: string; isChecked: boolean }>(
    `/rest-api/v1/teams/loops/checklists/${checklistId}/check`,
    { method: "PATCH" }
  );
}

/**
 * 팀 루프 체크리스트 삭제 API
 */
export async function deleteTeamLoopChecklist(
  checklistId: number
): Promise<{ success: boolean; message?: string }> {
  await api<void>(`/rest-api/v1/teams/loops/checklists/${checklistId}`, {
    method: "DELETE",
  });
  return { success: true };
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
    size: number;
    hasNext: boolean;
    nextCursor: string | null;
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

  return api<TeamLoopMemberChecklistApiResponse["data"]>(url);
}


/**
 * 팀 루프 완료 API
 */
export async function completeTeamLoop(
  teamId: number,
  loopId: number
): Promise<{ success: boolean; message?: string }> {
  await api<void>(`/rest-api/v1/teams/${teamId}/loops/${loopId}/complete`, {
    method: "POST",
  });
  return { success: true };
}

/**
 * 팀 삭제 API
 */
export async function deleteTeam(
  teamId: number
): Promise<{ success: boolean; message?: string }> {
  await api<void>(`/rest-api/v1/teams/${teamId}`, { method: "DELETE" });
  return { success: true };
}

/**
 * 팀원 삭제 API
 */
export async function removeTeamMember(
  teamId: number,
  memberId: number
): Promise<{ success: boolean; message?: string }> {
  await api<void>(`/rest-api/v1/teams/${teamId}/members/${memberId}`, {
    method: "DELETE",
  });
  return { success: true };
}

/**
 * 팀 나가기 API
 */
export async function leaveTeam(
  teamId: number
): Promise<{ success: boolean; message?: string }> {
  await api<void>(`/rest-api/v1/teams/${teamId}/leave`, { method: "POST" });
  return { success: true };
}

/**
 * 팀원 초대 API
 */
export async function inviteTeamMember(
  teamId: number,
  memberId: number
): Promise<{ success: boolean; message?: string }> {
  await api<void>(`/rest-api/v1/teams/${teamId}/invitations`, {
    method: "POST",
    json: { inviteeIds: [memberId] },
  });
  return { success: true };
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
      lastActivity: {
        actionType: string;
        targetName: string;
        timestamp: string;
      } | null;
    }>;
    recentTeamActivities: Array<{
      memberId: number;
      nickname: string;
      actionType: string;
      targetName: string;
      timestamp: string;
    }>;
  };
  page?: {
    size: number;
    hasNext: boolean;
    nextCursor: string | null;
  };
  timestamp: string;
  traceId?: string;
};

/**
 * 팀 활동 조회 API
 */
export async function fetchTeamMemberActivities(
  teamId: number
): Promise<TeamMemberActivitiesApiResponse["data"]> {
  return api<TeamMemberActivitiesApiResponse["data"]>(
    `/rest-api/v1/teams/${teamId}/member-activities`
  );
}
