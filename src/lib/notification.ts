import { apiFetch } from "@/lib/api";
import type { ApiPageResponse } from "@/interfaces/response/ApiResponse";

export type NotificationTargetObject = "Follow" | "TeamInvite" | string;

export type Notification = {
  id: number;
  senderId: number;
  senderNickname: string;
  senderProfileUrl: string;
  receiverId: number;
  objectId: number;
  content: string;
  isRead: boolean;
  targetObject: NotificationTargetObject;
  createdAt: string;
};

export type NotificationListResponse = ApiPageResponse<Notification>;

export type NotificationReadRequest = {
  notificationIdList: number[];
};

export type NotificationReadResponse = {
  success: boolean;
  code: string;
  message: string;
  data: Record<string, never>;
  page?: {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
  };
  timestamp?: string;
  traceId?: string;
};

/**
 * 알림 목록 조회
 */
export async function fetchNotifications(params?: {
  page?: number;
  size?: number;
}) {
  const searchParams: Record<string, string> = {};
  
  if (params?.page !== undefined) {
    searchParams.page = String(params.page);
  }
  if (params?.size !== undefined) {
    searchParams.size = String(params.size);
  }

  return apiFetch<NotificationListResponse>(
    "/rest-api/v1/notification",
    {
      method: "GET",
      searchParams: Object.keys(searchParams).length > 0 ? searchParams : undefined,
    }
  );
}

/**
 * 알림 읽음 처리
 */
export async function markNotificationsAsRead(notificationIds: number[]) {
  return apiFetch<NotificationReadResponse>(
    "/rest-api/v1/notification",
    {
      method: "PATCH",
      json: {
        notificationIdList: notificationIds,
      },
    }
  );
}

/**
 * 팀 초대 거절
 */
export async function rejectTeamInvitation(invitationId: number) {
  return apiFetch<NotificationReadResponse>(
    `/rest-api/v1/teams/invitations/${invitationId}/reject`,
    {
      method: "POST",
    }
  );
}

/**
 * 팀 초대 수락
 */
export async function acceptTeamInvitation(invitationId: number) {
  return apiFetch<NotificationReadResponse>(
    `/rest-api/v1/teams/invitations/${invitationId}/accept`,
    {
      method: "POST",
    }
  );
}
