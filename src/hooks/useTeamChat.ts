"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { fetchTeamChatRoom, fetchTeamChatMessages, type TeamChatMessageDto } from "@/lib/chat";
import { v4 as uuidv4 } from "uuid";

export type TeamChatMessage = {
  id: string;
  memberId?: number;
  nickname?: string;
  profileImageUrl?: string | null;
  content?: string;
  authorType?: "USER" | "SYSTEM";
  createdAt?: string;
  isMine?: boolean;
};

type WebSocketMessage = {
  messageType: "MESSAGE" | "READ_UP_TO" | "DELETE";
  chatRoomId?: number;
  clientMessageId?: string;
  teamChatMessageResponse?: {
    id: string;
    memberId: number;
    nickname: string;
    profileImageUrl: string | null;
    content: string;
    attachments?: unknown[];
    recommendations?: unknown;
    loopRuleId?: number | null;
    authorType: "USER" | "SYSTEM";
    createdAt: string;
  };
  memberId?: number | null;
  lastReadAt?: string | null;
  deleteId?: string | null;
};

export function useTeamChat(teamId: number | null) {
  const { user } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const pendingMessageIdsRef = useRef<Map<string, string>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // 채팅방 ID 가져오기
  useEffect(() => {
    if (!teamId) return;

    let cancelled = false;

    const loadChatRoom = async () => {
      try {
        setIsLoading(true);
        const response = await fetchTeamChatRoom(teamId);
        if (!cancelled && response.success && response.data?.id) {
          setChatRoomId(response.data.id);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("채팅방 조회 실패", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadChatRoom();

    return () => {
      cancelled = true;
    };
  }, [teamId]);

  // 메시지 히스토리 로드
  useEffect(() => {
    if (!chatRoomId) return;

    let cancelled = false;

    const loadHistory = async () => {
      try {
        const response = await fetchTeamChatMessages({
          chatRoomId,
          page: 0,
          size: 50,
        });

        if (!cancelled && response.data) {
          const historyMessages: TeamChatMessage[] = response.data
            .map((msg: TeamChatMessageDto) => ({
              id: msg.id,
              memberId: msg.memberId,
              nickname: msg.nickname,
              profileImageUrl: msg.profileImageUrl || null,
              content: msg.content,
              authorType: "USER" as const,
              createdAt: msg.createdAt,
              isMine: msg.isMine,
            }))
            .reverse();

          setMessages(historyMessages);
          historyMessages.forEach((msg) => {
            if (msg.id) {
              seenMessageIdsRef.current.add(msg.id);
            }
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error("메시지 히스토리 로드 실패", error);
        }
      }
    };

    loadHistory();
  }, [chatRoomId, user?.id]);

  // WebSocket 연결
  useEffect(() => {
    if (!chatRoomId) return;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(
          `wss://api.loopin.co.kr/ws/chat?chatRoomId=${chatRoomId}`
        );

        ws.onopen = () => {
          console.log("WebSocket 연결됨");
          setIsConnected(true);
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);

            if (data.messageType === "MESSAGE" && data.teamChatMessageResponse) {
              const msg = data.teamChatMessageResponse;
              const messageId = msg.id;

              // 중복 메시지 체크
              if (seenMessageIdsRef.current.has(messageId)) {
                return;
              }

              // pending 메시지 업데이트
              if (data.clientMessageId && pendingMessageIdsRef.current.has(data.clientMessageId)) {
                const tempId = pendingMessageIdsRef.current.get(data.clientMessageId);
                pendingMessageIdsRef.current.delete(data.clientMessageId);

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === tempId
                      ? {
                          ...m,
                          id: messageId,
                          memberId: msg.memberId,
                          nickname: msg.nickname,
                          profileImageUrl: msg.profileImageUrl,
                          content: msg.content,
                          createdAt: msg.createdAt,
                          isMine: msg.memberId === Number(user?.id),
                        }
                      : m
                  )
                );
                seenMessageIdsRef.current.add(messageId);
                return;
              }

              // 새 메시지 추가
              const newMessage: TeamChatMessage = {
                id: messageId,
                memberId: msg.memberId,
                nickname: msg.nickname,
                profileImageUrl: msg.profileImageUrl,
                content: msg.content,
                authorType: msg.authorType,
                createdAt: msg.createdAt,
                isMine: msg.memberId === Number(user?.id),
              };

              setMessages((prev) => [...prev, newMessage]);
              seenMessageIdsRef.current.add(messageId);
            } else if (data.messageType === "DELETE" && data.deleteId) {
              setMessages((prev) => prev.filter((m) => m.id !== data.deleteId));
            }
          } catch (error) {
            console.error("WebSocket 메시지 파싱 실패", error);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket 에러", error);
          setIsConnected(false);
        };

        ws.onclose = () => {
          console.log("WebSocket 연결 종료");
          setIsConnected(false);

          // 재연결 시도
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            reconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket();
            }, delay);
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error("WebSocket 연결 실패", error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [chatRoomId, user?.id]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (content: string) => {
      if (!chatRoomId || !content.trim() || !isConnected) return;

      const clientMessageId = uuidv4();
      const tempId = `temp-${clientMessageId}`;

      // 임시 메시지 추가
      const tempMessage: TeamChatMessage = {
        id: tempId,
        content: content.trim(),
        authorType: "USER",
        isMine: true,
        nickname: user?.nickname,
        memberId: Number(user?.id),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, tempMessage]);
      pendingMessageIdsRef.current.set(clientMessageId, tempId);

      try {
        const message = {
          messageType: "MESSAGE" as const,
          clientMessageId,
          teamChatMessageResponse: {
            content: content.trim(),
          },
        };

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(message));
        }
      } catch (error) {
        console.error("메시지 전송 실패", error);
        // 실패 시 임시 메시지 제거
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        pendingMessageIdsRef.current.delete(clientMessageId);
      }
    },
    [chatRoomId, isConnected, user]
  );

  // 읽음 처리
  const markAsRead = useCallback(() => {
    if (!chatRoomId || !isConnected || !user?.id) return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.createdAt) return;

    try {
      const message = {
        messageType: "READ_UP_TO" as const,
        memberId: String(user.id),
        lastReadAt: lastMessage.createdAt,
      };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error("읽음 처리 실패", error);
    }
  }, [chatRoomId, isConnected, messages, user?.id]);

  // 메시지 삭제
  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!chatRoomId || !isConnected) return;

      try {
        const message = {
          messageType: "DELETE" as const,
          deleteId: messageId,
        };

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(message));
        }
      } catch (error) {
        console.error("메시지 삭제 실패", error);
      }
    },
    [chatRoomId, isConnected]
  );

  // 스크롤을 맨 아래로
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isConnected,
    chatRoomId,
    messageListRef,
    sendMessage,
    markAsRead,
    deleteMessage,
  };
}
