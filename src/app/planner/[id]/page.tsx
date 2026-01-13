"use client";

import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MessageBubble } from "./components/MessageBubble";
import { LoadingMessage } from "./components/LoadingMessage";
import { RecommendationCard } from "./components/RecommendationCard";
import { LoopinSpeakerIndicator } from "./components/LoopinSpeakerIndicator";
import { usePlannerChat } from "./hooks/usePlannerChat";
import { fetchChatRooms } from "@/lib/chat";
import { AddLoopSheet } from "@/components/common/add-loop/AddLoopSheet";
import { recommendationToAddLoopDefaults } from "./utils";
import type { RecommendationSchedule } from "./types";
import { UPDATE_MESSAGE } from "./constants";
import GroupIcon from "@/../public/Group.svg";
import RetryIcon from "@/../public/retry.svg";
const MESSAGE_EXTRA_SPACE = 32;
const INPUT_CONTAINER_HEIGHT = 192;

export default function PlannerChatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatRoomId = params?.id ? Number(params.id) : null;
  const isNewChatRoom = searchParams.get("new") === "true";
  const [chatRoomTitle, setChatRoomTitle] = useState<string>("채팅방 이름");
  const [isAddLoopSheetOpen, setIsAddLoopSheetOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RecommendationSchedule | null>(null);

  const {
    messages,
    inputValue,
    isLoading,
    isInputVisible,
    recommendations,
    exampleLabel,
    messageListRef,
    handleInputChange,
    handleSubmit,
    handleRetry,
    showUpdateMessage,
  } = usePlannerChat(chatRoomId, isNewChatRoom);

  const isExistingChatRoom = !isNewChatRoom;

  type PlannerFormValues = { prompt: string };

  const {
    register,
    handleSubmit: formHandleSubmit,
    watch,
    reset,
  } = useForm<PlannerFormValues>({
    defaultValues: { prompt: inputValue },
  });

  const watchedPrompt = watch("prompt", inputValue);

  useEffect(() => {
    handleInputChange(watchedPrompt ?? "");
  }, [watchedPrompt, handleInputChange]);

  useEffect(() => {
    const fetchChatRoomTitle = async () => {
      if (!chatRoomId) return;

      try {
        const response = await fetchChatRooms("AI");
        if (response.data?.chatRooms) {
          const chatRoom = response.data.chatRooms.find(
            (room) => room.id === chatRoomId
          );
          if (chatRoom?.title) {
            setChatRoomTitle(chatRoom.title);
          } else {
            setChatRoomTitle("채팅방 이름");
          }
        }
      } catch (error) {
        console.error("채팅방 정보 불러오기 실패", error);
      }
    };

    fetchChatRoomTitle();
  }, [chatRoomId]);

  const handleSelectRecommendation = (
    recommendation: RecommendationSchedule
  ) => {
    setSelectedRecommendation(recommendation);
    setIsAddLoopSheetOpen(true);
  };

  const messageListPadding = isInputVisible
    ? MESSAGE_EXTRA_SPACE + INPUT_CONTAINER_HEIGHT
    : MESSAGE_EXTRA_SPACE;
  const lastMessageAuthor = messages[messages.length - 1]?.author;
  const isLoopinSpeaking = isLoading || lastMessageAuthor === "assistant";

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F8F9]/40">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center"
          aria-label="뒤로가기"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="#2C2C2C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-[#2C2C2C]">
          {chatRoomTitle}
        </h1>
        <button
          className="flex h-8 w-8 items-center justify-center"
          aria-label="메뉴"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6H20M4 12H20M4 18H20"
              stroke="#2C2C2C"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <section className="flex flex-1 min-h-0 flex-col">
        <div
          ref={messageListRef}
          className="flex-1 overflow-y-auto px-6 pt-6"
          style={{
            paddingBottom: `calc(${messageListPadding}px)`,
          }}
        >
          <div className="">
            {isLoopinSpeaking ? <LoopinSpeakerIndicator /> : null}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading ? <LoadingMessage /> : null}
          </div>

          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <RecommendationCard
                  key={recommendation.title}
                  recommendation={recommendation}
                  index={index + 1}
                  onSelect={handleSelectRecommendation}
                />
              ))}

              {showUpdateMessage && (
                <MessageBubble
                  message={{
                    id: "update-message",
                    author: "assistant",
                    content: UPDATE_MESSAGE,
                  }}
                />
              )}

              {!showUpdateMessage && (
                <div className="mt-4 flex gap-2 rounded-sm bg-[#DDE0E3] px-4 py-3 w-fit justify-self-center">
                  <Image
                    src={isExistingChatRoom ? RetryIcon : GroupIcon}
                    alt=""
                    width={12}
                    height={12}
                  />
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="text-xs font-semibold text-[#737980]"
                  >
                    {isExistingChatRoom ? "루프 수정하기" : "다시 생성하기"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {isInputVisible && (showUpdateMessage || recommendations.length === 0) ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
            <div className="pointer-events-auto w-full max-w-xl bg-white p-4 pb-6">
              {exampleLabel ? (
                <p className="mb-2 text-xs text-[#8F8A87]">{exampleLabel}</p>
              ) : null}
              <form
                onSubmit={formHandleSubmit(async (values) => {
                  await handleSubmit(values.prompt);
                  reset({ prompt: "" });
                })}
                className="flex items-center rounded-2xl px-3 py-2 bg-[#F8F8F9]"
              >
                <textarea
                  {...register("prompt")}
                  placeholder={
                    isExistingChatRoom
                      ? "수정하고 싶은 루프 내용을 입력해주세요."
                      : "만들고 싶은 루프를 입력해주세요."
                  }
                  rows={1}
                  className="max-h-32 flex-1 border-none text-sm text-[#2C2C2C] outline-none"
                  aria-label={
                    isExistingChatRoom
                      ? "루프 수정 요청 입력란"
                      : "루프 생성 요청 입력란"
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const currentValue = watchedPrompt?.trim();
                      if (currentValue) {
                        formHandleSubmit(async (values) => {
                          await handleSubmit(values.prompt);
                          reset({ prompt: "" });
                        })();
                      }
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!watchedPrompt?.trim()}
                  className="flex h-10 w-10 items-center justify-center text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="루프 생성 요청 보내기"
                >
                  <Image
                    src="/ai-planner/arrows-up.svg"
                    alt="send"
                    width={24}
                    height={24}
                  />
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </section>

      <AddLoopSheet
        isOpen={isAddLoopSheetOpen}
        onClose={() => {
          setIsAddLoopSheetOpen(false);
          setSelectedRecommendation(null);
        }}
        defaultValues={
          selectedRecommendation
            ? recommendationToAddLoopDefaults(selectedRecommendation)
            : undefined
        }
        onCreated={() => {
          setIsAddLoopSheetOpen(false);
          setSelectedRecommendation(null);
          router.push("/home");
        }}
      />
    </div>
  );
}
