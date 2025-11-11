import { apiFetch } from "@/lib/api";

type Primitive = string | number | boolean | null | undefined;

export type ChatRecommendationDto = {
  title: string;
  content: string;
  scheduleType: string;
  specificDate?: string;
  daysOfWeek?: string[];
  startDate?: string;
  endDate?: string;
  checklists?: string[];
};

export type ChatMessageDto = {
  id?: number;
  tempId?: string;
  chatRoomId?: number;
  memberId?: number;
  nickname?: string;
  profileImageUrl?: string;
  content?: string;
  authorType?: string;
  recommendations?: ChatRecommendationDto[];
  createdAt?: string;
};

export type ChatRoomMessagesResponse = {
  success?: boolean;
  code?: string;
  message?: string;
  data?: ChatMessageDto[];
};

type PageInfo = {
  page?: number;
  size?: number;
};

export type CurrentUserQuery = {
  id?: number;
  email?: string;
  nickname?: string;
  profileImageUrl?: string;
  state?: string;
  role?: string;
  provider?: string;
  providerId?: string;
};

type BuildParamsOptions = {
  page?: number;
  size?: number;
  currentUser?: CurrentUserQuery;
  chatRoomId?: number;
};

function buildQueryParams(options: BuildParamsOptions = {}) {
  const { page, size, currentUser, chatRoomId } = options;
  const params: Record<string, Primitive> = {};

  const requestPayload: Record<string, Primitive> = {};
  if (page !== undefined) {
    requestPayload.page = page;
  }
  if (size !== undefined) {
    requestPayload.size = size;
  }

  if (Object.keys(requestPayload).length > 0) {
    params.request = JSON.stringify(requestPayload);
  }

  if (currentUser) {
    const sanitizedCurrentUser: Record<string, Primitive> = {};
    Object.entries(currentUser).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        sanitizedCurrentUser[key] = value;
      }
    });

    if (Object.keys(sanitizedCurrentUser).length > 0) {
      params.currentUser = JSON.stringify(sanitizedCurrentUser);
    }
  }

  if (chatRoomId !== undefined) {
    params.chatRoomId = chatRoomId;
  }

  return params;
}

export type FetchChatMessagesParams = PageInfo & {
  chatRoomId: number;
  accessToken?: string | null;
  currentUser?: CurrentUserQuery;
};

export async function fetchChatMessages({
  chatRoomId,
  accessToken,
  page,
  size,
  currentUser,
}: FetchChatMessagesParams) {
  return apiFetch<ChatRoomMessagesResponse>(
    `/rest-api/v1/chatmessage/${chatRoomId}`,
    {
      accessToken: accessToken ?? undefined,
      searchParams: buildQueryParams({
        page,
        size,
        currentUser,
      }),
    }
  );
}

function resolveWsBaseUrl() {
  if (typeof window === "undefined") {
    const configured = process.env.NEXT_PUBLIC_CHAT_WS_URL;

    if (configured && configured.length > 0) {
      return configured;
    }

    return "";
  }

  const origin = window.location.origin.replace(/^http/, "ws");
  return `${origin}/api-proxy/ws/chat`;
}

export type CreateChatSocketOptions = {
  chatRoomId: number;
  accessToken: string;
};

export function createChatSocket({
  chatRoomId,
  accessToken,
}: CreateChatSocketOptions) {
  const base = resolveWsBaseUrl();

  if (!base) {
    throw new Error("웹소켓 베이스 URL이 설정되지 않았습니다.");
  }

  const rawParams = buildQueryParams({ chatRoomId });
  const params = new URLSearchParams();

  Object.entries(rawParams).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.set(key, String(value));
  });

  if (accessToken) {
    params.set("accessToken", accessToken);
  }

  const separator = base.includes("?") ? "&" : "?";
  const url = `${base}${separator}${params.toString()}`;
  return new WebSocket(url);
}
