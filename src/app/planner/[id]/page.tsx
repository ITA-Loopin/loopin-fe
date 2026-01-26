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
import { LoopGroupEditSheet } from "@/components/loop/LoopGroupEditSheet";
import {
  recommendationToAddLoopDefaults,
  recommendationToLoopDetail,
} from "./utils";
import type { RecommendationSchedule } from "./types";
import GroupIcon from "@/../public/Group.svg";
import RetryIcon from "@/../public/retry.svg";
import Header from "@/components/common/Header";

const MESSAGE_EXTRA_SPACE = 32;
const INPUT_CONTAINER_HEIGHT = 192;

export default function PlannerChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatRoomId = params?.id ? Number(params.id) : null;
  const [chatRoomTitle, setChatRoomTitle] = useState<string>("채팅방 이름");
  const [chatRoomLoopSelect, setChatRoomLoopSelect] = useState<boolean>(false);
  const [chatRoomCallUpdateLoop, setChatRoomCallUpdateLoop] =
    useState<boolean>(false);
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
    callUpdateLoop: sseCallUpdateLoop,
  } = usePlannerChat(chatRoomId, chatRoomLoopSelect);

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
            (room) => room.id === chatRoomId
          );
          if (chatRoom) {
            if (chatRoom.title) {
              setChatRoomTitle(chatRoom.title);
            } else {
              setChatRoomTitle("채팅방 이름");
            }
            setChatRoomLoopSelect(chatRoom.loopSelect);
            setChatRoomCallUpdateLoop(chatRoom.callUpdateLoop ?? false);
          }
        }
      } catch (error) {
        console.error("채팅방 정보 불러오기 실패", error);
      }
    };

    fetchChatRoomInfo();
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

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F8F9]/40">
      {/* Header */}
      <Header leftType="back" centerTitle={chatRoomTitle} rightType="none" />
      {/* <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-6 py-4 shadow-sm">
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
   
        </button>
      </header> */}

      <section className="flex flex-1 min-h-0 flex-col">
        <div
          ref={messageListRef}
          className="flex-1 overflow-y-auto px-6 pt-6"
          style={{
            paddingBottom: `calc(${messageListPadding}px)`,
          }}
        >
          <div className="">
            {messages.map((message, index) => {
              const isAssistant = message.author === "assistant";
              const showIndicator = index === 0 && isAssistant;

              return (
                <div key={message.id}>
                  {showIndicator && <LoopinSpeakerIndicator />}
                  <MessageBubble message={message} className={showIndicator ? "-mt-2" : ""} />
                </div>
              );
            })}
            {isLoading ? <LoadingMessage /> : null}
          </div>

          {recommendations.length > 0 ? (
            <div className="">
              {recommendations.map((recommendation, index) => (
                <RecommendationCard
                  key={recommendation.title}
                  recommendation={recommendation}
                  index={index + 1}
                  onSelect={handleSelectRecommendation}
                  chatRoomLoopSelect={chatRoomLoopSelect}
                />
              ))}

              {(
                <div className={`mt-4 flex gap-2 rounded-sm ${chatRoomLoopSelect && (chatRoomCallUpdateLoop || sseCallUpdateLoop) ? "bg-[#FFE4E0]" : "bg-[#DDE0E3]"} px-4 py-3 w-fit justify-self-center`}>
                  {!(chatRoomLoopSelect && (chatRoomCallUpdateLoop || sseCallUpdateLoop)) && (
                    <Image
                      src={chatRoomLoopSelect ? RetryIcon : GroupIcon}
                      alt=""
                      width={12}
                      height={12}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (chatRoomLoopSelect && (chatRoomCallUpdateLoop || sseCallUpdateLoop)) {
                        setIsLoopGroupEditSheetOpen(true);
                      } else if (chatRoomLoopSelect) {
                        handleUpdateLoop();
                      } else {
                        handleRetry();
                      }
                    }}
                    className={`text-sm font-semibold ${chatRoomLoopSelect && (chatRoomCallUpdateLoop || sseCallUpdateLoop) ? "text-[#FF543F] font-semibold" : "text-[#737980] font-semibold"}`}
                  >
                    {chatRoomLoopSelect && (chatRoomCallUpdateLoop || sseCallUpdateLoop)
                      ? "루프 수정 완료하기"
                      : chatRoomLoopSelect
                        ? "루프 수정하기"
                        : "다시 생성하기"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {isInputVisible &&
        (showUpdateMessage || recommendations.length === 0) ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
            <div className="pointer-events-auto w-full max-w-xl bg-white p-4 pb-6">
              {exampleLabel ? (
                <p className="mb-2 text-xs text-[#8F8A87]">{exampleLabel}</p>
              ) : null}
              <form
                onSubmit={formHandleSubmit(async (values) => {
                  if (values.prompt?.trim()) {
                    await handleSubmit(values.prompt.trim());
                    reset({ prompt: "" });
                  }
                })}
                className="flex items-center rounded-2xl px-3 py-2 bg-[#F8F8F9]"
              >
                <textarea
                  {...register("prompt")}
                  placeholder={
                    chatRoomLoopSelect
                      ? "수정하고 싶은 루프 내용을 입력해주세요."
                      : "만들고 싶은 루프를 입력해주세요."
                  }
                  rows={1}
                  className="max-h-32 flex-1 border-none text-sm text-[#2C2C2C] outline-none resize-none"
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
