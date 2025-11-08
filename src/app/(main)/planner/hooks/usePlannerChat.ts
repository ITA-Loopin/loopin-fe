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

export function usePlannerChat() {
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: generateId(), author: "system", content: INITIAL_MESSAGE },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(true);
  const [recommendations, setRecommendations] = useState<
    RecommendationSchedule[]
  >([]);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const previousChatRoomIdRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const isSocketOpenRef = useRef(false);

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
      { id: generateId(), author: "system", content: INITIAL_MESSAGE },
    ]);
    setRecommendations([]);
  }, [plannerChatRoomId]);

  const exampleLabel = useMemo(() => {
    if (!isInputVisible || inputValue) return null;
    return `ex. ${EXAMPLE_PROMPTS.join(" / ")}`;
  }, [inputValue, isInputVisible]);

  const appendNewMessages = useCallback((apiMessages?: ChatMessageDto[]) => {
    if (!apiMessages?.length) {
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
          | { data?: ChatMessageDto[] };

        if ("data" in parsed && Array.isArray(parsed.data)) {
          const status = appendNewMessages(parsed.data);

          if (status === "assistant" || status === "recommendations") {
            setIsLoading(false);
            setIsInputVisible(true);
          }
          return;
        }

        const status = appendNewMessages([parsed as ChatMessageDto]);

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
    if (!plannerChatRoomId || !accessToken || !currentUserQuery) {
      return undefined;
    }

    try {
      const socket = createChatSocket({
        chatRoomId: plannerChatRoomId,
        accessToken,
        currentUser: currentUserQuery,
      });

      socketRef.current = socket;

      socket.addEventListener("open", () => {
        isSocketOpenRef.current = true;
      });

      socket.addEventListener("message", handleSocketMessage);

      socket.addEventListener("close", () => {
        isSocketOpenRef.current = false;
        socketRef.current = null;
      });

      socket.addEventListener("error", (event) => {
        console.error("웹소켓 오류", event);
      });
    } catch (error) {
      console.error("웹소켓 연결 실패", error);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.removeEventListener("message", handleSocketMessage);
        socketRef.current.close();
        socketRef.current = null;
      }
      isSocketOpenRef.current = false;
    };
  }, [plannerChatRoomId, currentUserQuery, handleSocketMessage]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(event.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = inputValue.trim();
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

      const socket = socketRef.current;

      if (!socket || socket.readyState === WebSocket.CLOSING) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            author: "assistant",
            content: "연결 상태를 확인한 뒤 다시 시도해주세요.",
          },
        ]);
        return;
      }

      setIsLoading(true);
      setIsInputVisible(false);

      try {
        const payload = JSON.stringify({
          chatRoomId: plannerChatRoomId,
          content: trimmed,
          tempId: userMessage.id,
          authorType: "USER",
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
    [inputValue, isLoading, accessToken, currentUserQuery, plannerChatRoomId]
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
        author: "system",
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
