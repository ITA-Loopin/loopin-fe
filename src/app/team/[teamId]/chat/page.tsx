"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTeamChat } from "@/hooks/useTeamChat";
import { TeamMessageBubble } from "./components/TeamMessageBubble";
import { fetchTeamDetail } from "@/lib/team";
import Header from "@/components/common/Header";
import { ChatInput } from "@/components/common/ChatInput";

const INPUT_CONTAINER_HEIGHT = 80;

export default function TeamChatPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params?.teamId ? Number(params.teamId) : null;
  const [teamName, setTeamName] = useState<string>("팀 이름");

  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isConnected,
    messageListRef,
    sendMessage,
    markAsRead,
    deleteMessage,
  } = useTeamChat(teamId);

  type ChatFormValues = { message: string };

  const {
    control,
    handleSubmit: formHandleSubmit,
    watch,
    reset,
  } = useForm<ChatFormValues>({
    defaultValues: { message: inputValue },
  });

  const watchedMessage = watch("message", inputValue);

  useEffect(() => {
    setInputValue(watchedMessage ?? "");
  }, [watchedMessage, setInputValue]);

  // 팀 이름 가져오기
  useEffect(() => {
    if (!teamId) return;

    let cancelled = false;

    const loadTeamName = async () => {
      try {
        const team = await fetchTeamDetail(teamId);
        if (!cancelled) {
          setTeamName(team.title);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("팀 정보 불러오기 실패", error);
        }
      }
    };

    loadTeamName();
  }, [teamId]);

  // 메시지 읽음 처리
  useEffect(() => {
    if (messages.length > 0 && isConnected) {
      markAsRead();
    }
  }, [messages.length, isConnected, markAsRead]);

  const handleSubmit = async (values: ChatFormValues) => {
    const trimmed = values.message.trim();
    if (!trimmed || !isConnected) return;

    await sendMessage(trimmed);
    reset({ message: "" });
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("복사 실패", error);
    }
  };

  const handleDelete = (messageId: string) => {
    // TODO: 삭제 API 구현 필요
    deleteMessage(messageId);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F8F9]">
      {/* Header */}
      <Header leftType="back" centerTitle={teamName} rightType="none" />
    

      {/* 메시지 리스트 */}
      <section className="flex flex-1 min-h-0 flex-col">
        <div
          ref={messageListRef}
          className="flex-1 overflow-y-auto px-4 pt-4 pb-6"
          style={{
            paddingBottom: `${INPUT_CONTAINER_HEIGHT + 16}px`,
          }}
        >
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-[var(--gray-500)]">로딩 중...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-[var(--gray-500)]">
                메시지가 없습니다
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <TeamMessageBubble
                  key={message.id}
                  message={message}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-white border-t border-[var(--gray-200)]">
          <div className="pointer-events-auto w-full max-w-xl p-4">
            <form onSubmit={formHandleSubmit(handleSubmit)}>
              <ChatInput
                placeholder="메시지를 입력해주세요"
                disabled={!isConnected}
                // 구현 예정
                showAttachmentButton={false}
                sendButtonIcon="arrow"
                control={control}
                name="message"
                watchedValue={watchedMessage}
                ariaLabel="메시지 입력란"
                sendButtonAriaLabel="메시지 전송"
                onSubmit={() => formHandleSubmit(handleSubmit)()}
              />
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
