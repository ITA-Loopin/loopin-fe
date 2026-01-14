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
    `/rest-api/v1/chat-message/${chatRoomId}`,
    {
      searchParams: buildQueryParams({
        page,
        size,
        currentUser,
      }),
    }
  );
}

export type MessageType =
  | "CONNECT"
  | "MESSAGE"
  | "CREATE_LOOP"
  | "UPDATE_LOOP"
  | "READ_UP_TO";

export type SendChatMessageParams = {
  chatRoomId: number;
  clientMessageId: string; // required, uuid format
  content: string; // required, >= 1 characters
  messageType: MessageType; // required
};

export async function sendChatMessage({
  chatRoomId,
  clientMessageId,
  content,
  messageType,
}: SendChatMessageParams) {
  return apiFetch<{ success: boolean; message?: string }>(
    `/rest-api/v1/chat-message/${chatRoomId}/chat`,
    {
      method: "POST",
      json: {
        content,
        clientMessageId,
        messageType,
      },
    }
  );
}

export type ChatRoom = {
  id: number;
  ownerId: number;
  title: string | null;
  loopSelect: boolean;
  lastMessageAt?: string | null;
  lastReadAt?: string | null;
};

export type ChatRoomListResponse = {
  success?: boolean;
  code?: string;
  message?: string;
  data?: {
    chatRooms?: ChatRoom[];
  };
  page?: {
    page?: number;
    size?: number;
    totalPages?: number;
    totalElements?: number;
    first?: boolean;
    last?: boolean;
    hasNext?: boolean;
  };
  timestamp?: string;
  traceId?: string;
};

export async function fetchChatRooms(
  chatRoomType: "ALL" | "TEAM" | "AI" = "AI"
) {
  return apiFetch<ChatRoomListResponse>("/rest-api/v1/chat-room", {
    searchParams: {
      chatRoomType,
    },
  });
}

export type CreateChatRoomResponse = {
  success?: boolean;
  code?: string;
  message?: string;
  data?: ChatRoom;
  timestamp?: string;
  traceId?: string;
};

export type CreateChatRoomParams = {
  title: string;
  loopSelect?: boolean;
};

export async function createChatRoom(params: CreateChatRoomParams) {
  return apiFetch<CreateChatRoomResponse>("/rest-api/v1/chat-room/create", {
    method: "POST",
    json: params,
  });
}

function resolveSseBaseUrl() {
  if (typeof window === "undefined") {
    const configured = process.env.NEXT_PUBLIC_CHAT_SSE_URL;

    if (configured && configured.length > 0) {
      return configured;
    }

    return "https://api.loopin.co.kr";
  }

  return "https://api.loopin.co.kr";
}

export type SSEEventType = "CONNECT" | "MESSAGE";

export type SSEEvent = {
  id: string;
  event: SSEEventType;
  data: string | ChatMessageDto;
};

export type CreateSSEOptions = {
  chatRoomId: number;
  lastEventId?: string;
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
};

export function createChatSocket({
  chatRoomId,
  lastEventId,
  onMessage,
  onError,
  onOpen,
}: CreateSSEOptions): EventSource {
  const baseUrl = resolveSseBaseUrl();
  let url = `${baseUrl}/rest-api/v1/sse/subscribe/${chatRoomId}`;

  // EventSource는 커스텀 헤더를 설정할 수 없으므로,
  // Last-Event-ID가 필요한 경우 fetch를 사용해야 하지만,
  // EventSource의 간편함을 위해 일단 EventSource를 사용하고
  // 재연결 시 자동으로 lastEventId가 사용되도록 합니다.
  // 초기 연결 시 lastEventId가 필요한 경우를 위해
  // URL 파라미터로 전달하는 방법도 있지만, 표준은 헤더입니다.

  // EventSource는 withCredentials를 지원하므로 쿠키가 자동으로 전송됩니다.
  const eventSource = new EventSource(url, {
    withCredentials: true,
  });

  // EventSource는 재연결 시 자동으로 lastEventId를 사용하지만,
  // 초기 연결 시에는 설정할 수 없습니다.
  // 필요시 fetch + ReadableStream으로 변경할 수 있습니다.

  // CONNECT 이벤트 처리
  eventSource.addEventListener("CONNECT", (event: MessageEvent) => {
      onOpen?.();
  });

  // MESSAGE 이벤트 처리
  eventSource.addEventListener("MESSAGE", (event: MessageEvent) => {
    onMessage?.(event);
  });

  // 기본 message 이벤트도 처리 (이벤트 타입이 없는 경우)
  eventSource.onmessage = (event: MessageEvent) => {
    // event.type이 없으면 기본 message 이벤트
    // 하지만 서버에서 명시적으로 event를 보내므로 이 핸들러는 거의 사용되지 않을 것입니다.
    onMessage?.(event);
  };

  eventSource.onerror = (error: Event) => {
    onError?.(error);
  };

  eventSource.onopen = () => {
    onOpen?.();
  };

  return eventSource;
}
