import { api, apiPage, type Page } from "@/lib/api";
import type { PageResponse } from "@/interfaces/response/ApiResponse";

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

export type NotificationListResponse = PageResponse<Notification>;

export type NotificationReadRequest = {
  notificationIdList: number[];
};

export type NotificationReadResponse = {
  success: boolean;
  code: string;
  message: string;
  data: Record<string, never>;
  page?: {
    size: number;
    hasNext: boolean;
    nextCursor: string | null;
  };
  timestamp?: string;
  traceId?: string;
};

/**
 * 알림 목록 조회
 */
export async function fetchNotifications(params?: {
  cursor?: string | null;
  size?: number;
}): Promise<Page<Notification>> {
  const searchParams: Record<string, string> = {};

  if (params?.cursor) {
    searchParams.cursor = params.cursor;
  }
  if (params?.size !== undefined) {
    searchParams.size = String(params.size);
  }

  return apiPage<Notification>(
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
export async function markNotificationsAsRead(notificationIds: number[]): Promise<void> {
  await api<void>(
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
export async function rejectTeamInvitation(invitationId: number): Promise<void> {
  await api<void>(
    `/rest-api/v1/teams/invitations/${invitationId}/reject`,
    {
      method: "POST",
    }
  );
}

/**
 * 팀 초대 수락
 */
export async function acceptTeamInvitation(invitationId: number): Promise<void> {
  await api<void>(
    `/rest-api/v1/teams/invitations/${invitationId}/accept`,
    {
      method: "POST",
    }
  );
}
