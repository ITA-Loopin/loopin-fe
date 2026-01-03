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
  title: string;
  loopSelect: boolean;
  lastMessageAt?: string;
  lastReadAt?: string;
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

export async function fetchChatRooms() {
  return apiFetch<ChatRoomListResponse>("/rest-api/v1/chat-room");
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
  });
}

function resolveSseBaseUrl() {
  if (typeof window === "undefined") {
    const configured = process.env.NEXT_PUBLIC_CHAT_SSE_URL;

    if (configured && configured.length > 0) {
      return configured;
    }

    return "https://api.loopin.co.kr/rest-api/v1/sse/subscribe";
  }

  return "https://api.loopin.co.kr/rest-api/v1/sse/subscribe";
}

export type CreateChatSocketOptions = {
  chatRoomId: number;
  lastEventId?: string;
  onMessage?: (event: SSEMessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
};

export type SSEMessageEvent = {
  id: string | null;
  event: string | null;
  data: string;
};

export function createChatSocket({
  chatRoomId,
  lastEventId,
  onMessage,
  onError,
  onOpen,
}: CreateChatSocketOptions): AbortController {
  const base = resolveSseBaseUrl();

  if (!base) {
    throw new Error("SSE 베이스 URL이 설정되지 않았습니다.");
  }

  const url = `${base}/${chatRoomId}`;

  const abortController = new AbortController();

  // apiFetch 래퍼를 사용하여 SSE 연결
  // parseJson: false로 설정하여 Response 객체를 직접 받아서 스트림 처리
  apiFetch<Response>(url, {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
    },
    parseJson: false, // SSE는 JSON이 아닌 스트림이므로
    signal: abortController.signal,
  })
    .then(async (response: Response) => {
      if (!response.ok) {
        throw new Error(`SSE 연결 실패: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("응답 본문이 없습니다.");
      }

      onOpen?.();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent: SSEMessageEvent = {
        id: null,
        event: null,
        data: "",
      };

      const processLine = (line: string) => {
        if (line === "") {
          // 빈 줄은 메시지 구분자
          if (currentEvent.data || currentEvent.id || currentEvent.event) {
            onMessage?.(currentEvent);
          }
          currentEvent = { id: null, event: null, data: "" };
          return;
        }

        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) {
          return;
        }

        const field = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();

        // 값의 첫 공백 제거 (SSE 스펙)
        if (value.startsWith(" ")) {
          value = value.slice(1);
        }

        switch (field) {
          case "id":
            currentEvent.id = value;
            break;
          case "event":
            currentEvent.event = value;
            break;
          case "data":
            currentEvent.data += (currentEvent.data ? "\n" : "") + value;
            break;
        }
      };

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // 마지막 버퍼 처리
          if (buffer) {
            buffer.split("\n").forEach(processLine);
            // 마지막 이벤트가 완전하지 않을 수 있지만, SSE 스펙상 빈 줄로 끝나므로 처리하지 않음
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 마지막 불완전한 라인은 버퍼에 유지

        lines.forEach(processLine);
      }

      // 마지막 이벤트가 완료되지 않은 경우 (빈 줄 없이 끝난 경우)
      if (currentEvent.data || currentEvent.id || currentEvent.event) {
        onMessage?.(currentEvent);
      }
    })
    .catch((error) => {
      if (error.name === "AbortError") {
        // 정상적인 종료
        return;
      }
      onError?.(error);
    });

  return abortController;
}
