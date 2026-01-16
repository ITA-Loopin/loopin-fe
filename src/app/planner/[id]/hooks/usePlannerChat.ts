"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EXAMPLE_PROMPTS,
  UPDATE_MESSAGE,
  LOOP_RESULT_PROMPT,
} from "../constants";
import type { ChatMessage, RecommendationSchedule } from "../types";
import { generateId } from "../utils";
import { useAppSelector } from "@/store/hooks";
import {
  createChatSocket,
  fetchChatMessages,
  sendChatMessage,
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

export function usePlannerChat(
  chatRoomId?: number | null,
  loopSelect?: boolean
) {
  const { user } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(true);
  const [recommendations, setRecommendations] = useState<
    RecommendationSchedule[]
  >([]);
  const [updateRecommendation, setUpdateRecommendation] =
    useState<RecommendationSchedule | null>(null);
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const pendingUserMessageIdsRef = useRef<Map<string, string[]>>(new Map());
  const previousChatRoomIdRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastEventIdRef = useRef<string | null>(null);
  const isConnectedRef = useRef(false);

  const plannerChatRoomId = useMemo(() => {
    if (chatRoomId !== undefined && chatRoomId !== null) {
      const parsed = Number(chatRoomId);
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (user?.chatRoomId === undefined || user.chatRoomId === null) {
      return null;
    }
    const parsed = Number(user.chatRoomId);
    return Number.isFinite(parsed) ? parsed : null;
  }, [chatRoomId, user?.chatRoomId]);

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
    setMessages([]);
    setRecommendations([]);
  }, [plannerChatRoomId]);

  const exampleLabel = useMemo(() => {
    if (!isInputVisible || inputValue) return null;
    return `ex. ${EXAMPLE_PROMPTS.join(" / ")}`;
  }, [inputValue, isInputVisible]);

  const appendNewMessages = useCallback(
    (rawMessages?: unknown) => {
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
        // deleteMessageId가 있으면 해당 메시지를 숨김
        if (message.deleteMessageId) {
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== message.deleteMessageId)
          );
          // recommendations도 삭제 (RECREATE_LOOP인 경우)
          setRecommendations([]);
          setUpdateRecommendation(null);
          return;
        }

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
            loopRuleId: message.loopRuleId,
          }));
        }

        seenMessageIdsRef.current.add(dedupeKey);
      });

      if (newlyAdded.length) {
        setMessages((prev) => {
          const filteredPrev = prev.filter(
            (msg) => msg.content !== UPDATE_MESSAGE
          );
          return [...filteredPrev, ...newlyAdded];
        });
      }

      if (recommendationsToApply) {
        const recs: RecommendationSchedule[] = recommendationsToApply;
        // UPDATE_LOOP인 경우 첫 번째 추천을 updateRecommendation에 저장하지만 추천도 표시
        if (loopSelect === true && recs.length > 0) {
          setUpdateRecommendation(recs[0]);
          setRecommendations(recs); // 추천도 무조건 표시
        } else {
          setRecommendations(recs);
        }
        // 새로운 추천이 오면 UPDATE_MESSAGE 숨기고 다시 생성하기 버튼 표시
        setShowUpdateMessage(false);
      }

      return status;
    },
    [loopSelect]
  );

  const handleSSEMessage = useCallback(
    (event: MessageEvent) => {
      try {
        // SSE 이벤트의 data는 항상 문자열
        let data: unknown;
        try {
          data = JSON.parse(event.data);
        } catch {
          // 파싱 실패 시 문자열 그대로 사용 (CONNECT 이벤트의 경우)
          data = event.data;
        }

        // Last-Event-ID 저장
        if (event.lastEventId) {
          lastEventIdRef.current = event.lastEventId;
        }

        // CONNECT 이벤트 처리
        if (event.type === "CONNECT" || data === "connected!") {
          console.info("SSE 연결 성공", { eventId: event.lastEventId });
          isConnectedRef.current = true;
          return;
        }

        // MESSAGE 이벤트 처리
        if (event.type === "MESSAGE") {
          // data는 ChatMessageDto 형태의 객체
          if (typeof data === "object" && data !== null) {
            const messageData = data as ChatMessageDto;

            // RECOMMENDATION_RESULT 처리 (서버에서 별도로 오는 경우)
            if (
              "messageType" in messageData &&
              messageData.messageType === "RECOMMENDATION_RESULT" &&
              "data" in messageData &&
              Array.isArray(messageData.data)
            ) {
              setRecommendations(messageData.data as RecommendationSchedule[]);
              setIsLoading(false);
              setIsInputVisible(true);
              // 새로운 추천이 오면 UPDATE_MESSAGE 숨기고 다시 생성하기 버튼 표시
              setShowUpdateMessage(false);
              return;
            }

            // 일반 메시지 처리
            const status = appendNewMessages(messageData);

            if (status === "assistant" || status === "recommendations") {
              setIsLoading(false);
              setIsInputVisible(true);
            }
          }
        }
      } catch (error) {
        console.error("SSE 메시지 파싱 실패", error, { eventData: event.data });
      }
    },
    [appendNewMessages]
  );

  const cleanupSSE = useCallback(() => {
    const eventSource = eventSourceRef.current;
    if (!eventSource) {
      return;
    }

    eventSource.close();
    eventSourceRef.current = null;
    isConnectedRef.current = false;
  }, []);

  const initializeSSE = useCallback(() => {
    if (!plannerChatRoomId) {
      return null;
    }

    const existing = eventSourceRef.current;
    if (existing && existing.readyState === EventSource.OPEN) {
      return existing;
    }

    cleanupSSE();

    try {
      const eventSource = createChatSocket({
        chatRoomId: plannerChatRoomId,
        lastEventId: lastEventIdRef.current || undefined,
        onMessage: handleSSEMessage,
        onError: (error) => {
          console.error("SSE 오류", error);
          isConnectedRef.current = false;
        },
        onOpen: () => {
          console.info("SSE 연결 성공");
          isConnectedRef.current = true;
        },
      });

      eventSourceRef.current = eventSource;

      return eventSource;
    } catch (error) {
      console.error("SSE 연결 실패", error);
      return null;
    }
  }, [plannerChatRoomId, handleSSEMessage, cleanupSSE]);

  useEffect(() => {
    if (!plannerChatRoomId) {
      return;
    }

    let isCancelled = false;

    const loadHistory = async () => {
      try {
        const response = await fetchChatMessages({
          chatRoomId: plannerChatRoomId,
          page: 0,
          size: 20,
        });

        if (!isCancelled) {
          const hasHistory = appendNewMessages(response.data);
          // loopSelect가 true이고 히스토리가 있으면 UPDATE_MESSAGE 추가
          if (loopSelect === true && hasHistory !== "none") {
            setMessages((prev) => {
              const hasUpdateMessage = prev.some(
                (msg) => msg.content === UPDATE_MESSAGE
              );
              if (!hasUpdateMessage) {
                return [
                  ...prev,
                  {
                    id: generateId(),
                    author: "assistant",
                    content: UPDATE_MESSAGE || "content",
                  },
                ];
              }
              return prev;
            });
          }
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
  }, [plannerChatRoomId, appendNewMessages, loopSelect]);

  useEffect(() => {
    initializeSSE();

    return () => {
      cleanupSSE();
    };
  }, [initializeSSE, cleanupSSE]);

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

      if (!plannerChatRoomId) {
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

      // SSE 연결 확인
      const eventSource = eventSourceRef.current;
      if (!eventSource || eventSource.readyState !== EventSource.OPEN) {
        // SSE가 연결되지 않았으면 재연결 시도
        initializeSSE();

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
        // SSE는 단방향이므로 메시지 전송은 REST API 사용
        await sendChatMessage({
          chatRoomId: plannerChatRoomId,
          clientMessageId: userMessage.id,
          content: trimmed,
          messageType: loopSelect === true ? "UPDATE_LOOP" : "CREATE_LOOP",
        });
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

        // 실패 시 큐에서 제거
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
      }
    },
    [isLoading, plannerChatRoomId, initializeSSE, loopSelect]
  );

  const handleRetry = useCallback(async () => {
    if (!plannerChatRoomId) {
      return;
    }

    // SSE 연결 확인
    const eventSource = eventSourceRef.current;
    if (!eventSource || eventSource.readyState !== EventSource.OPEN) {
      initializeSSE();
      return;
    }

    setIsLoading(true);
    setIsInputVisible(false);
    setRecommendations([]);
    setUpdateRecommendation(null);

    const retryMessageId = generateId();

    try {
      // RECREATE_LOOP 메시지 타입으로 전송
      await sendChatMessage({
        chatRoomId: plannerChatRoomId,
        clientMessageId: retryMessageId,
        content: "content",
        messageType: "RECREATE_LOOP",
      });
    } catch (error) {
      console.error("루프 재생성 요청 실패", error);
      setIsInputVisible(true);
      setIsLoading(false);
    }
  }, [plannerChatRoomId, initializeSSE]);

  return {
    messages,
    inputValue,
    isLoading,
    isInputVisible,
    recommendations,
    updateRecommendation,
    exampleLabel,
    messageListRef,
    handleInputChange,
    handleSubmit,
    handleRetry,
    showUpdateMessage,
  };
}

export type UsePlannerChatReturn = ReturnType<typeof usePlannerChat>;
