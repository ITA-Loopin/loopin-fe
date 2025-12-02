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
  currentUser?: CurrentUserQuery;
};

export async function fetchChatMessages({
  chatRoomId,
  page,
  size,
  currentUser,
}: FetchChatMessagesParams) {
  return apiFetch<ChatRoomMessagesResponse>(
    `/rest-api/v1/chatmessage/${chatRoomId}`,
    {
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

    return "wss://api.loopin.co.kr/ws/chat";
  }

  return "wss://api.loopin.co.kr/ws/chat";
}

export type CreateChatSocketOptions = {
  chatRoomId: number;
};

export function createChatSocket({ chatRoomId }: CreateChatSocketOptions) {
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

  const separator = base.includes("?") ? "&" : "?";
  const url = `${base}${separator}${params.toString()}`;

  // WebSocket은 같은 도메인(또는 서브도메인)이면 쿠키가 자동으로 전송됩니다.
  // 쿠키의 Domain 속성이 .loopin.co.kr로 설정되어 있다면,
  // local.loopin.co.kr에서 api.loopin.co.kr로 연결할 때도 쿠키가 자동 전송됩니다.
  return new WebSocket(url);
}
