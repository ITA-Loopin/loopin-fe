"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MessageBubble } from "./components/MessageBubble";
import { LoadingMessage } from "./components/LoadingMessage";
import { RecommendationCard } from "./components/RecommendationCard";
import { LoopinSpeakerIndicator } from "./components/LoopinSpeakerIndicator";
import { usePlannerChat } from "./hooks/usePlannerChat";
import { fetchChatRooms, type ChatRoomStatus } from "@/lib/chat";
import { AddLoopSheet } from "@/components/loop/add-loop/AddLoopSheet";
import { LoopGroupEditSheet } from "@/components/loop/LoopGroupEditSheet";
import {
  recommendationToAddLoopDefaults,
  recommendationToLoopDetail,
} from "./utils";
import type { RecommendationSchedule } from "./types";
import GroupIcon from "@/../public/Group.svg";
import RetryIcon from "@/../public/retry.svg";
import Header from "@/components/common/header/Header";

const MESSAGE_EXTRA_SPACE = 32;
const INPUT_CONTAINER_HEIGHT = 192;

export default function PlannerChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatRoomId = params?.id ? Number(params.id) : null;
  const [chatRoomTitle, setChatRoomTitle] = useState<string>("채팅방 이름");
  const [chatRoomStatus, setChatRoomStatus] =
    useState<ChatRoomStatus>("DEFAULT");
  const [isAddLoopSheetOpen, setIsAddLoopSheetOpen] = useState(false);
  const [isLoopGroupEditSheetOpen, setIsLoopGroupEditSheetOpen] =
    useState(false);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RecommendationSchedule | null>(null);

  const {
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
  } = usePlannerChat(chatRoomId, chatRoomStatus);

  const isUpdateChatRoom =
    chatRoomStatus === "BEFORE_CLICK_UPDATE_LOOP" ||
    chatRoomStatus === "AFTER_CLICK_UPDATE_LOOP";
  const canOpenUpdateSheet = chatRoomStatus === "AFTER_CLICK_UPDATE_LOOP";

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
    const fetchChatRoomInfo = async () => {
      if (!chatRoomId) return;

      try {
        const response = await fetchChatRooms("AI");
        if (response.data?.chatRooms) {
          const chatRoom = response.data.chatRooms.find(
            (room) => room.id === chatRoomId,
          );
          if (chatRoom) {
            setChatRoomTitle(chatRoom.title || "채팅방 이름");
            setChatRoomStatus(chatRoom.chatRoomStatus ?? "DEFAULT");
          }
        }
      } catch (error) {
        console.error("채팅방 정보 불러오기 실패", error);
      }
    };

    fetchChatRoomInfo();
  }, [chatRoomId]);

  const handleSelectRecommendation = (
    recommendation: RecommendationSchedule,
  ) => {
    setSelectedRecommendation(recommendation);
    setIsAddLoopSheetOpen(true);
  };

  const messageListPadding = isInputVisible
    ? MESSAGE_EXTRA_SPACE + INPUT_CONTAINER_HEIGHT
    : MESSAGE_EXTRA_SPACE;

  return (
    <div className="flex min-h-screen flex-col bg-gray-100/40">
      <Header
        left={<Header.BackButton />}
        center={<Header.Title>{chatRoomTitle}</Header.Title>}
      />

      <section className="flex min-h-0 flex-1 flex-col">
        <div
          ref={messageListRef}
          className="flex-1 overflow-y-auto px-6 pt-6"
          style={{
            paddingBottom: `calc(${messageListPadding}px)`,
          }}
        >
          <div>
            {messages.map((message, index) => {
              const isAssistant = message.author === "assistant";
              const showIndicator = index === 0 && isAssistant;

              return (
                <div key={message.id}>
                  {showIndicator && <LoopinSpeakerIndicator />}
                  <MessageBubble
                    message={message}
                    className={showIndicator ? "-mt-2" : ""}
                  />
                </div>
              );
            })}
            {isLoading ? <LoadingMessage /> : null}
          </div>

          {recommendations.length > 0 ? (
            <div>
              {recommendations.map((recommendation, index) => (
                <RecommendationCard
                  key={recommendation.title}
                  recommendation={recommendation}
                  index={index + 1}
                  onSelect={handleSelectRecommendation}
                  chatRoomLoopSelect={isUpdateChatRoom}
                />
              ))}

              <div
                className={`mt-4 flex w-fit justify-self-center rounded-sm px-4 py-3 ${
                  canOpenUpdateSheet ? "bg-primary-200" : "bg-gray-200"
                } gap-2`}
              >
                {!canOpenUpdateSheet && (
                  <Image
                    src={isUpdateChatRoom ? RetryIcon : GroupIcon}
                    alt=""
                    width={12}
                    height={12}
                  />
                )}
                <button
                  type="button"
                  onClick={async () => {
                    if (canOpenUpdateSheet) {
                      setIsLoopGroupEditSheetOpen(true);
                    } else if (isUpdateChatRoom) {
                      const didRequestUpdate = await handleUpdateLoop();
                      if (didRequestUpdate) {
                        setChatRoomStatus("AFTER_CLICK_UPDATE_LOOP");
                      }
                    } else {
                      handleRetry();
                    }
                  }}
                  className={`text-sm font-semibold ${
                    canOpenUpdateSheet ? "text-primary-main" : "text-gray-600"
                  }`}
                >
                  {canOpenUpdateSheet
                    ? "루프 수정 완료하기"
                    : isUpdateChatRoom
                      ? "루프 수정하기"
                      : "다시 생성하기"}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {isInputVisible &&
        (showUpdateMessage || recommendations.length === 0) ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
            <div className="pointer-events-auto w-full max-w-xl bg-white p-4 pb-6">
              {exampleLabel ? (
                <p className="mb-2 text-xs text-gray-500">{exampleLabel}</p>
              ) : null}
              <form
                onSubmit={formHandleSubmit(async (values) => {
                  if (values.prompt?.trim()) {
                    await handleSubmit(values.prompt.trim());
                    reset({ prompt: "" });
                  }
                })}
                className="flex items-center rounded-2xl bg-gray-100 px-3 py-2"
              >
                <textarea
                  {...register("prompt")}
                  placeholder={
                    isUpdateChatRoom
                      ? "수정하고 싶은 루프 내용을 입력해주세요."
                      : "만들고 싶은 루프를 입력해주세요."
                  }
                  rows={1}
                  className="max-h-32 flex-1 resize-none border-none text-sm text-gray-800 outline-none"
                  aria-label="루프 생성 요청 입력란"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const form = e.currentTarget.form;
                      if (form) {
                        form.requestSubmit();
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
        chatRoomId={chatRoomId}
        onCreated={() => {
          setIsAddLoopSheetOpen(false);
          setSelectedRecommendation(null);
          router.push("/home");
        }}
      />

      {updateRecommendation && (
        <LoopGroupEditSheet
          isOpen={isLoopGroupEditSheetOpen}
          loop={recommendationToLoopDetail(updateRecommendation)}
          onClose={() => {
            setIsLoopGroupEditSheetOpen(false);
          }}
          chatRoomId={chatRoomId}
          onUpdated={() => {
            setIsLoopGroupEditSheetOpen(false);
            router.push("/home");
          }}
        />
      )}
    </div>
  );
}
