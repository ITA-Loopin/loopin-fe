"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  sendChatMessage,
  fetchChatRooms,
  createChatRoom,
  type ChatMessageDto,
  type SSEMessageEvent,
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
  const { user } = useAppSelector((state) => state.auth);
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
  const sseAbortControllerRef = useRef<AbortController | null>(null);
  const isSseConnectedRef = useRef(false);
  const lastEventIdRef = useRef<string | null>(null);

  const [resolvedChatRoomId, setResolvedChatRoomId] = useState<number | null>(
    null
  );

  // v1/chat-room API에서 항상 planner 채팅방 찾기
  useEffect(() => {
    if (!user) {
      return;
    }

    let isCancelled = false;

    const loadChatRooms = async () => {
      try {
        console.log("[DEBUG] 채팅방 목록 조회 시작");
        const response = await fetchChatRooms();

        if (isCancelled) return;

        console.log("[DEBUG] 채팅방 목록 응답:", response);
        const chatRooms = response.data?.chatRooms || [];
        console.log("[DEBUG] 채팅방 목록:", chatRooms);

        // loopSelect가 true인 채팅방 찾기 (planner 채팅방)
        const plannerRoom = chatRooms.find((room) => room.loopSelect === true);
        console.log("[DEBUG] planner 채팅방:", plannerRoom);

        if (plannerRoom) {
          console.log("[DEBUG] planner 채팅방 ID 설정:", plannerRoom.id);
          setResolvedChatRoomId(plannerRoom.id);
          return;
        }

        if (chatRooms.length > 0) {
          // planner 채팅방이 없으면 첫 번째 채팅방 사용
          console.log("[DEBUG] 첫 번째 채팅방 ID 설정:", chatRooms[0].id);
          setResolvedChatRoomId(chatRooms[0].id);
          return;
        }

        // 채팅방이 없으면 새로 생성
        console.log("[DEBUG] 채팅방이 없어서 새로 생성합니다");
        try {
          const createResponse = await createChatRoom({
            title: "플래너", // planner 채팅방 제목
            loopSelect: true, // planner 채팅방으로 생성
          });
          if (isCancelled) return;

          console.log("[DEBUG] 채팅방 생성 응답:", createResponse);
          if (createResponse.data?.id) {
            console.log(
              "[DEBUG] 생성된 채팅방 ID 설정:",
              createResponse.data.id
            );
            setResolvedChatRoomId(createResponse.data.id);
          }
        } catch (createError) {
          if (!isCancelled) {
            console.error("[DEBUG] 채팅방 생성 실패", createError);
            console.error("[DEBUG] 에러 상세:", {
              message:
                createError instanceof Error
                  ? createError.message
                  : String(createError),
              error: createError,
            });
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("[DEBUG] 채팅방 목록 불러오기 실패", error);
        }
      }
    };

    loadChatRooms();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const plannerChatRoomId = resolvedChatRoomId;

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

  const handleSSEMessage = useCallback(
    (event: SSEMessageEvent) => {
      try {
        // Last-Event-ID 저장
        if (event.id) {
          lastEventIdRef.current = event.id;
        }

        // CONNECT 이벤트 처리
        if (event.event === "CONNECT") {
          console.info("SSE 연결 성공", event.data);
          isSseConnectedRef.current = true;
          return;
        }

        // MESSAGE 이벤트 처리
        if (event.event === "MESSAGE") {
          let parsed: ChatMessageDto | { messageType?: string; data?: unknown };

          try {
            parsed = JSON.parse(event.data);
          } catch {
            // data가 이미 객체인 경우
            parsed = event.data as ChatMessageDto;
          }

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
        }
      } catch (error) {
        console.error("SSE 메시지 처리 실패", error);
      }
    },
    [appendNewMessages]
  );

  const cleanupSSE = useCallback(() => {
    const abortController = sseAbortControllerRef.current;
    if (abortController) {
      abortController.abort();
      sseAbortControllerRef.current = null;
    }
    isSseConnectedRef.current = false;
  }, []);

  const initializeSSE = useCallback(() => {
    if (!plannerChatRoomId || !currentUserQuery) {
      return;
    }

    // 이미 연결되어 있는 경우 재연결하지 않음
    if (isSseConnectedRef.current && sseAbortControllerRef.current) {
      return;
    }

    cleanupSSE();

    try {
      const abortController = createChatSocket({
        chatRoomId: plannerChatRoomId,
        lastEventId: lastEventIdRef.current || undefined,
        onOpen: () => {
          console.info("SSE 연결 시작", {
            chatRoomId: plannerChatRoomId,
            lastEventId: lastEventIdRef.current,
          });
        },
        onMessage: (event) => {
          console.debug("SSE 수신", event);
          handleSSEMessage(event);
        },
        onError: (error) => {
          console.error("SSE 오류", error);
          isSseConnectedRef.current = false;

          // 재연결 시도 (Last-Event-ID 포함)
          setTimeout(() => {
            if (!isSseConnectedRef.current) {
              initializeSSE();
            }
          }, 3000);
        },
      });

      sseAbortControllerRef.current = abortController;
    } catch (error) {
      console.error("SSE 연결 실패", error);
      isSseConnectedRef.current = false;
    }
  }, [plannerChatRoomId, currentUserQuery, handleSSEMessage, cleanupSSE]);

  // 채팅 기록은 SSE를 통해 자동으로 받아오므로 별도로 불러올 필요 없음
  // Last-Event-ID를 사용하면 이전 메시지도 자동으로 받아올 수 있음
  // useEffect(() => {
  //   if (!plannerChatRoomId || !currentUserQuery) {
  //     return;
  //   }

  //   let isCancelled = false;

  //   const loadHistory = async () => {
  //     try {
  //       const response = await fetchChatMessages({
  //         chatRoomId: plannerChatRoomId,
  //         currentUser: currentUserQuery,
  //         page: 0,
  //         size: 20,
  //       });

  //       if (!isCancelled) {
  //         appendNewMessages(response.data);
  //       }
  //     } catch (error) {
  //       if (!isCancelled) {
  //         console.error("채팅 기록 불러오기 실패", error);
  //       }
  //     }
  //   };

  //   loadHistory();

  //   return () => {
  //     isCancelled = true;
  //   };
  // }, [plannerChatRoomId, currentUserQuery, appendNewMessages]);

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

      console.log("[DEBUG] handleSubmit 호출");
      console.log("[DEBUG] currentUserQuery:", currentUserQuery);
      console.log("[DEBUG] plannerChatRoomId:", plannerChatRoomId);

      if (!currentUserQuery || !plannerChatRoomId) {
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

      // SSE 연결 확인 및 재연결
      if (!isSseConnectedRef.current || !sseAbortControllerRef.current) {
        initializeSSE();
      }

      setIsLoading(true);
      setIsInputVisible(false);

      try {
        // 첫 사용자 메시지인지 확인 (기존 사용자 메시지가 있는지 체크)
        const hasPreviousUserMessage = messages.some(
          (msg) => msg.author === "user"
        );
        const messageType = hasPreviousUserMessage
          ? "UPDATE_LOOP"
          : "CREATE_LOOP";

        // SSE는 단방향이므로 HTTP API로 메시지 전송
        await sendChatMessage({
          chatRoomId: plannerChatRoomId,
          clientMessageId: userMessage.id,
          content: trimmed,
          messageType,
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
    [isLoading, currentUserQuery, plannerChatRoomId, initializeSSE]
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
