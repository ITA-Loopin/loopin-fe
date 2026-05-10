"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EXAMPLE_PROMPTS } from "../constants";
import type { ChatMessage, RecommendationSchedule } from "../types";
import { generateId } from "../utils";
import { useAppSelector } from "@/store/hooks";
import {
  createChatSocket,
  fetchChatMessages,
  sendChatMessage,
  type ChatMessageDto,
  type ChatRoomStatus,
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
  chatRoomStatus: ChatRoomStatus = "DEFAULT",
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
  const [callUpdateLoop, setCallUpdateLoop] = useState<boolean>(false);
  const [isWaitingForRecreateInput, setIsWaitingForRecreateInput] =
    useState(false);
  const hasSentRecreateLoopRef = useRef(false);
  const hasSentBeforeUpdateLoopRef = useRef(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const pendingUserMessageIdsRef = useRef<Map<string, string[]>>(new Map());
  const previousChatRoomIdRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lastEventIdRef = useRef<string | null>(null);
  const isConnectedRef = useRef(false);
  const isUpdateChatRoom =
    chatRoomStatus === "BEFORE_CLICK_UPDATE_LOOP" ||
    chatRoomStatus === "AFTER_CLICK_UPDATE_LOOP";

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
    hasSentRecreateLoopRef.current = false;
    hasSentBeforeUpdateLoopRef.current = false;
    setCallUpdateLoop(false);
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

        if (trimmedContent) {
          newlyAdded.push({
            id:
              message.tempId ??
              (message.id !== undefined ? String(message.id) : generateId()),
            author,
            content: trimmedContent,
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
          return [...prev, ...newlyAdded];
        });
      }

      if (recommendationsToApply) {
        const recs: RecommendationSchedule[] = recommendationsToApply;
        // BEFORE_UPDATE_LOOP인 경우 첫 번째 추천을 updateRecommendation에 저장하고 showUpdateMessage를 true로 설정
        // UPDATE_LOOP인 경우 첫 번째 추천을 updateRecommendation에 저장하지만 추천도 표시
        if (isUpdateChatRoom && recs.length > 0) {
          setUpdateRecommendation(recs[0]);
          setRecommendations(recs); // 추천도 무조건 표시
          // BEFORE_UPDATE_LOOP 응답인지 확인 (BEFORE_UPDATE_LOOP를 보낸 후 recommendations가 1개인 경우)
          if (hasSentBeforeUpdateLoopRef.current && recs.length === 1) {
            setShowUpdateMessage(true);
            hasSentBeforeUpdateLoopRef.current = false; // 플래그 초기화
          } else {
            setShowUpdateMessage(false);
          }
        } else {
          setRecommendations(recs);
          setShowUpdateMessage(false);
        }
      }

      return status;
    },
    [isUpdateChatRoom]
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
              setShowUpdateMessage(false);
              return;
            }

            // RECREATE_LOOP 후 텍스트 응답 체크 (추천이 없는 텍스트 메시지면 입력 요청)
            const content = messageData.content || "";
            const hasRecommendations =
              Array.isArray(messageData.recommendations) &&
              messageData.recommendations.length > 0;

            // RECREATE_LOOP를 보낸 후 텍스트 응답을 받았고 추천이 없으면 입력 필드 표시
            if (
              hasSentRecreateLoopRef.current &&
              !hasRecommendations &&
              content.trim() &&
              messageData.authorType === "BOT"
            ) {
              setIsWaitingForRecreateInput(true);
              setIsLoading(false);
              setIsInputVisible(true);
              hasSentRecreateLoopRef.current = false; // 플래그 초기화
            }

            // callUpdateLoop 필드 처리
            if (messageData.callUpdateLoop !== undefined) {
              setCallUpdateLoop(messageData.callUpdateLoop);
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
  }, [plannerChatRoomId, appendNewMessages, chatRoomStatus]);

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
        // RECREATE_LOOP 후 입력 요청 메시지를 받았으면 CREATE_LOOP로 전송
        const messageType = isWaitingForRecreateInput
          ? "CREATE_LOOP"
          : isUpdateChatRoom
            ? "UPDATE_LOOP"
            : "CREATE_LOOP";

        await sendChatMessage({
          chatRoomId: plannerChatRoomId,
          clientMessageId: userMessage.id,
          content: trimmed,
          messageType,
        });

        // 메시지 전송 후 플래그 초기화
        if (isWaitingForRecreateInput) {
          setIsWaitingForRecreateInput(false);
          hasSentRecreateLoopRef.current = false; // RECREATE_LOOP 플래그도 초기화
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
    [
      isLoading,
      plannerChatRoomId,
      initializeSSE,
      isUpdateChatRoom,
      isWaitingForRecreateInput,
    ]
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
    setIsWaitingForRecreateInput(false);

    const retryMessageId = generateId();

    try {
      // RECREATE_LOOP 메시지 타입으로 전송
      hasSentRecreateLoopRef.current = true; // RECREATE_LOOP 전송 플래그 설정
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

  const handleUpdateLoop = useCallback(async () => {
    if (!plannerChatRoomId) {
      return false;
    }

    // SSE 연결 확인
    const eventSource = eventSourceRef.current;
    if (!eventSource || eventSource.readyState !== EventSource.OPEN) {
      initializeSSE();
      return false;
    }

    setIsLoading(true);
    setIsInputVisible(false);

    const updateMessageId = generateId();

    try {
      // BEFORE_UPDATE_LOOP 메시지 타입으로 전송
      hasSentBeforeUpdateLoopRef.current = true; // BEFORE_UPDATE_LOOP 전송 플래그 설정
      await sendChatMessage({
        chatRoomId: plannerChatRoomId,
        clientMessageId: updateMessageId,
        content: "content",
        messageType: "BEFORE_UPDATE_LOOP",
      });
      return true;
    } catch (error) {
      console.error("루프 수정 요청 실패", error);
      setIsInputVisible(true);
      setIsLoading(false);
      hasSentBeforeUpdateLoopRef.current = false; // 실패 시 플래그 초기화
      return false;
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
    handleUpdateLoop,
    showUpdateMessage,
    callUpdateLoop,
  };
}

export type UsePlannerChatReturn = ReturnType<typeof usePlannerChat>;
