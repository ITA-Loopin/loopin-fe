"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EXAMPLE_PROMPTS,
  INITIAL_MESSAGE,
  LOOP_RETRY_PROMPT,
  LOOP_RESULT_PROMPT,
} from "../constants";
import type { ChatMessage, RecommendationSchedule } from "../types";
import { generateId } from "../utils";
import { useAppSelector } from "@/store/hooks";
import {
  createChatSocket,
  fetchChatMessages,
  type ChatMessageDto,
} from "@/lib/chat";

type AppendStatus = "none" | "assistant" | "recommendations";

function isChatMessageDtoLike(value: Record<string, unknown>) {
  return (
    "tempId" in value ||
    "id" in value ||
    "authorType" in value ||
    "content" in value ||
    "recommendations" in value
  );
}

function normalizeChatMessages(input: unknown): ChatMessageDto[] {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((item) => normalizeChatMessages(item));
  }

  if (typeof input === "object") {
    const record = input as Record<string, unknown>;
    let collected: ChatMessageDto[] = [];

    if ("chatMessageDto" in record) {
      const { chatMessageDto } = record as { chatMessageDto?: unknown };
      if (chatMessageDto != null) {
        collected = collected.concat(normalizeChatMessages(chatMessageDto));
      }
    }

    if ("data" in record) {
      const { data } = record as { data?: unknown };
      if (data != null) {
        collected = collected.concat(normalizeChatMessages(data));
      }
    }

    if (collected.length > 0) {
      return collected;
    }

    if (isChatMessageDtoLike(record)) {
      return [record as ChatMessageDto];
    }

    return [];
  }

  return [];
}

export function usePlannerChat() {
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: generateId(), author: "assistant", content: INITIAL_MESSAGE },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(true);
  const [recommendations, setRecommendations] = useState<
    RecommendationSchedule[]
  >([]);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const pendingUserMessageIdsRef = useRef<Map<string, string[]>>(new Map());
  const previousChatRoomIdRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const isSocketOpenRef = useRef(false);
  const socketListenersRef = useRef<{
    onOpen?: (event: Event) => void;
    onMessage?: (event: MessageEvent) => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (event: Event) => void;
  }>({});

  const plannerChatRoomId = useMemo(() => {
    if (user?.chatRoomId === undefined || user.chatRoomId === null) {
      return null;
    }
    const parsed = Number(user.chatRoomId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [user?.chatRoomId]);

  const currentUserQuery = useMemo(() => {
    if (!user) return undefined;

    const fallbackId =
      typeof user.id === "string" ? Number(user.id) : Number(user.id);
    const numericIdCandidate =
      typeof user.kakaoId === "number" && !Number.isNaN(user.kakaoId)
        ? user.kakaoId
        : fallbackId;
    const numericId = Number.isFinite(numericIdCandidate)
      ? numericIdCandidate
      : undefined;

    return {
      id: numericId,
      email: user.email,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl ?? user.profileImage,
      role: "ROLE_USER",
      provider: "KAKAO",
      providerId: user.id,
    };
  }, [user]);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [messages, isLoading, recommendations]);

  useEffect(() => {
    if (!plannerChatRoomId) {
      return;
    }

    if (previousChatRoomIdRef.current === plannerChatRoomId) {
      return;
    }

    previousChatRoomIdRef.current = plannerChatRoomId;
    seenMessageIdsRef.current.clear();
    setMessages([
      { id: generateId(), author: "assistant", content: INITIAL_MESSAGE },
    ]);
    setRecommendations([]);
  }, [plannerChatRoomId]);

  const exampleLabel = useMemo(() => {
    if (!isInputVisible || inputValue) return null;
    return `ex. ${EXAMPLE_PROMPTS.join(" / ")}`;
  }, [inputValue, isInputVisible]);

  const appendNewMessages = useCallback((rawMessages?: unknown) => {
    const apiMessages = normalizeChatMessages(rawMessages);

    if (!apiMessages.length) {
      return "none" as AppendStatus;
    }

    const sorted = [...apiMessages].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    });

    const newlyAdded: ChatMessage[] = [];
    let recommendationsToApply: RecommendationSchedule[] | null = null;
    let status: AppendStatus = "none";

    sorted.forEach((message) => {
      const dedupeKeyRaw =
        message.tempId ??
        (message.id !== undefined ? String(message.id) : message.createdAt);

      if (!dedupeKeyRaw) {
        return;
      }

      const dedupeKey = String(dedupeKeyRaw);
      if (seenMessageIdsRef.current.has(dedupeKey)) {
        return;
      }

      const hasRecommendations =
        Array.isArray(message.recommendations) &&
        message.recommendations.length > 0;
      const isUser = message.authorType === "USER";
      const trimmedContent = (message.content ?? "").trim();

      if (isUser && trimmedContent) {
        const queue = pendingUserMessageIdsRef.current.get(trimmedContent);
        if (queue && queue.length > 0) {
          const localId = queue.shift();

          if (queue.length === 0) {
            pendingUserMessageIdsRef.current.delete(trimmedContent);
          }

          if (localId) {
            seenMessageIdsRef.current.add(localId);
          }

          seenMessageIdsRef.current.add(dedupeKey);
          return;
        }
      }

      if (!hasRecommendations && !trimmedContent) {
        seenMessageIdsRef.current.add(dedupeKey);
        return;
      }

      const author = hasRecommendations
        ? ("assistant" as const)
        : isUser
          ? ("user" as const)
          : ("assistant" as const);

      if (author === "assistant") {
        status = hasRecommendations ? "recommendations" : "assistant";
      }

      const bubbleContent =
        hasRecommendations && !trimmedContent
          ? LOOP_RESULT_PROMPT
          : trimmedContent;

      if (bubbleContent) {
        newlyAdded.push({
          id:
            message.tempId ??
            (message.id !== undefined ? String(message.id) : generateId()),
          author,
          content: bubbleContent,
        });
      }

      if (hasRecommendations) {
        recommendationsToApply = message.recommendations!.map((item) => ({
          title: item.title,
          content: item.content,
          scheduleType: item.scheduleType,
          specificDate: item.specificDate,
          daysOfWeek: item.daysOfWeek,
          startDate: item.startDate,
          endDate: item.endDate,
          checklists: item.checklists,
        }));
      }

      seenMessageIdsRef.current.add(dedupeKey);
    });

    if (newlyAdded.length) {
      setMessages((prev) => [...prev, ...newlyAdded]);
    }

    if (recommendationsToApply) {
      setRecommendations(recommendationsToApply);
    }

    return status;
  }, []);

  const handleSocketMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data) as
          | ChatMessageDto
          | { messageType?: string; data?: unknown };

        if (
          parsed &&
          typeof parsed === "object" &&
          "messageType" in parsed &&
          parsed.messageType === "RECOMMENDATION_RESULT" &&
          Array.isArray(parsed.data)
        ) {
          setRecommendations(parsed.data as RecommendationSchedule[]);
          setIsLoading(false);
          setIsInputVisible(true);
          return;
        }

        const status = appendNewMessages(parsed);

        if (status === "assistant" || status === "recommendations") {
          setIsLoading(false);
          setIsInputVisible(true);
        }
      } catch (error) {
        console.error("웹소켓 메시지 파싱 실패", error);
      }
    },
    [appendNewMessages]
  );

  const cleanupSocket = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) {
      return;
    }

    const listeners = socketListenersRef.current;

    if (listeners.onOpen) {
      socket.removeEventListener("open", listeners.onOpen);
    }
    if (listeners.onMessage) {
      socket.removeEventListener("message", listeners.onMessage);
    }
    if (listeners.onClose) {
      socket.removeEventListener("close", listeners.onClose);
    }
    if (listeners.onError) {
      socket.removeEventListener("error", listeners.onError);
    }

    socket.close();

    socketRef.current = null;
    isSocketOpenRef.current = false;
    socketListenersRef.current = {};
  }, []);

  const attachSocketListeners = useCallback(
    (socket: WebSocket) => {
      const onOpen = () => {
        console.info("웹소켓 연결 성공", {
          url: socket.url,
          readyState: socket.readyState,
        });
        isSocketOpenRef.current = true;
      };

      const onMessage = (event: MessageEvent) => {
        console.debug("웹소켓 수신", event.data);
        handleSocketMessage(event);
      };

      const onClose = (event: CloseEvent) => {
        console.warn("웹소켓 종료", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        isSocketOpenRef.current = false;
        socketRef.current = null;
      };

      const onError = (event: Event) => {
        console.error("웹소켓 오류", event);
      };

      const listeners = socketListenersRef.current;

      if (listeners.onOpen) {
        socket.removeEventListener("open", listeners.onOpen);
      }
      if (listeners.onMessage) {
        socket.removeEventListener("message", listeners.onMessage);
      }
      if (listeners.onClose) {
        socket.removeEventListener("close", listeners.onClose);
      }
      if (listeners.onError) {
        socket.removeEventListener("error", listeners.onError);
      }

      socket.addEventListener("open", onOpen);
      socket.addEventListener("message", onMessage);
      socket.addEventListener("close", onClose);
      socket.addEventListener("error", onError);

      socketListenersRef.current = {
        onOpen,
        onMessage,
        onClose,
        onError,
      };
    },
    [handleSocketMessage]
  );

  const initializeSocket = useCallback(() => {
    if (!plannerChatRoomId || !accessToken || !currentUserQuery) {
      return null;
    }

    const existing = socketRef.current;
    if (
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING)
    ) {
      return existing;
    }

    cleanupSocket();

    try {
      const socket = createChatSocket({
        chatRoomId: plannerChatRoomId,
        accessToken,
      });

      socketRef.current = socket;
      attachSocketListeners(socket);

      return socket;
    } catch (error) {
      console.error("웹소켓 연결 실패", error);
      return null;
    }
  }, [
    plannerChatRoomId,
    accessToken,
    currentUserQuery,
    attachSocketListeners,
    cleanupSocket,
  ]);

  useEffect(() => {
    if (!plannerChatRoomId || !accessToken || !currentUserQuery) {
      return;
    }

    let isCancelled = false;

    const loadHistory = async () => {
      try {
        const response = await fetchChatMessages({
          chatRoomId: plannerChatRoomId,
          accessToken,
          currentUser: currentUserQuery,
          page: 0,
          size: 20,
        });

        if (!isCancelled) {
          appendNewMessages(response.data);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("채팅 기록 불러오기 실패", error);
        }
      }
    };

    loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [plannerChatRoomId, accessToken, currentUserQuery, appendNewMessages]);

  useEffect(() => {
    initializeSocket();

    return () => {
      cleanupSocket();
    };
  }, [initializeSocket, cleanupSocket]);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleSubmit = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = {
        id: generateId(),
        author: "user",
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setRecommendations([]);
      seenMessageIdsRef.current.add(userMessage.id);

      const queue = pendingUserMessageIdsRef.current.get(trimmed) ?? [];
      pendingUserMessageIdsRef.current.set(trimmed, [...queue, userMessage.id]);

      if (!accessToken || !currentUserQuery || !plannerChatRoomId) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            author: "assistant",
            content: "루프 추천을 사용하려면 로그인 후 다시 시도해주세요.",
          },
        ]);
        return;
      }

      let socket = socketRef.current;
      if (!socket || socket.readyState === WebSocket.CLOSING) {
        socket = initializeSocket();
      }

      if (!socket) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            author: "assistant",
            content: "연결 상태를 확인한 뒤 다시 시도해주세요.",
          },
        ]);
        const queueAfterFailure = pendingUserMessageIdsRef.current.get(trimmed);
        if (queueAfterFailure) {
          const updatedQueue = queueAfterFailure.filter(
            (pendingId) => pendingId !== userMessage.id
          );
          if (updatedQueue.length > 0) {
            pendingUserMessageIdsRef.current.set(trimmed, updatedQueue);
          } else {
            pendingUserMessageIdsRef.current.delete(trimmed);
          }
        }
        return;
      }

      setIsLoading(true);
      setIsInputVisible(false);

      try {
        const payload = JSON.stringify({
          messageType: "MESSAGE",
          chatRoomId: plannerChatRoomId,
          chatMessageDto: {
            tempId: userMessage.id,
            content: trimmed,
          },
        });

        if (socket.readyState === WebSocket.OPEN) {
          socket.send(payload);
        } else if (socket.readyState === WebSocket.CONNECTING) {
          const handleOpen = () => {
            try {
              socket.send(payload);
            } catch (sendError) {
              console.error("웹소켓 전송 실패", sendError);
              setMessages((prev) => [
                ...prev,
                {
                  id: generateId(),
                  author: "assistant",
                  content: "메시지 전송에 실패했습니다. 다시 시도해주세요.",
                },
              ]);
              setIsInputVisible(true);
              setIsLoading(false);
            } finally {
              socket.removeEventListener("open", handleOpen);
            }
          };

          socket.addEventListener("open", handleOpen);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              author: "assistant",
              content: "연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.",
            },
          ]);
          setIsInputVisible(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("루프 추천 요청 실패", error);
        const message =
          error instanceof Error
            ? error.message
            : "루프 추천 중 오류가 발생했습니다.";
        setMessages((prev) => [
          ...prev,
          { id: generateId(), author: "assistant", content: message },
        ]);
        setIsInputVisible(true);
        setIsLoading(false);
      }
    },
    [
      isLoading,
      accessToken,
      currentUserQuery,
      plannerChatRoomId,
      initializeSocket,
    ]
  );

  const handleSelectRecommendation = useCallback(
    (item: RecommendationSchedule) => {
      // TODO: 추후 바텀시트 구현 후 연결
      alert(`선택한 루프: ${item.title}`);
    },
    []
  );

  const handleRetry = useCallback(() => {
    setRecommendations([]);
    setIsLoading(false);
    setIsInputVisible(true);
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        author: "assistant",
        content: LOOP_RETRY_PROMPT,
      },
    ]);
  }, []);

  return {
    messages,
    inputValue,
    isLoading,
    isInputVisible,
    recommendations,
    exampleLabel,
    messageListRef,
    handleInputChange,
    handleSubmit,
    handleSelectRecommendation,
    handleRetry,
  };
}

export type UsePlannerChatReturn = ReturnType<typeof usePlannerChat>;
