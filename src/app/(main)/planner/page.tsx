"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { MessageBubble } from "./components/MessageBubble";
import { LoadingMessage } from "./components/LoadingMessage";
import { RecommendationCard } from "./components/RecommendationCard";
import { LoopinSpeakerIndicator } from "./components/LoopinSpeakerIndicator";
import { usePlannerChat } from "./hooks/usePlannerChat";

const BOTTOM_TAB_HEIGHT = 70;
const BOTTOM_TAB_GAP = 24;
const MESSAGE_EXTRA_SPACE = 32;
const INPUT_CONTAINER_HEIGHT = 192;

export default function PlannerPage() {
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
    handleSelectRecommendation,
    handleRetry,
  } = usePlannerChat();

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

  const basePadding = BOTTOM_TAB_HEIGHT + BOTTOM_TAB_GAP + MESSAGE_EXTRA_SPACE;
  const messageListPadding = isInputVisible
    ? basePadding + INPUT_CONTAINER_HEIGHT
    : basePadding;
  const inputBottomOffset = BOTTOM_TAB_HEIGHT + BOTTOM_TAB_GAP;
  const lastMessageAuthor = messages[messages.length - 1]?.author;
  const isLoopinSpeaking = isLoading || lastMessageAuthor === "assistant";

  return (
    <section className="flex flex-1 min-h-0 flex-col bg-[#FFEFEA]/40">
      <div
        ref={messageListRef}
        className="flex-1 overflow-y-auto px-6 pt-6"
        style={{
          paddingBottom: `calc(${messageListPadding}px )`,
        }}
      >
        <div className="space-y-4">
          {isLoopinSpeaking ? <LoopinSpeakerIndicator /> : null}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading ? <LoadingMessage /> : null}
        </div>

        {recommendations.length > 0 ? (
          <div className="mt-6 space-y-4">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.title}
                recommendation={recommendation}
                onSelect={handleSelectRecommendation}
              />
            ))}
            <button
              type="button"
              onClick={handleRetry}
              className="w-full rounded-xl border border-[#FF5A45] px-4 py-3 text-sm font-semibold text-[#FF5A45] transition hover:bg-[#FFEFEA]"
            >
              다시 만들기
            </button>
          </div>
        ) : null}
      </div>

      {isInputVisible ? (
        <div
          className="pointer-events-none fixed inset-x-0 z-40 flex justify-center pb-6"
          style={{
            bottom: `calc(${inputBottomOffset}px)`,
          }}
        >
          <div className="pointer-events-auto w-full max-w-xl bg-white p-4 ">
            {exampleLabel ? (
              <p className="mb-2 text-xs text-[#8F8A87]">{exampleLabel}</p>
            ) : null}
            <form
              onSubmit={formHandleSubmit(async (values) => {
                await handleSubmit(values.prompt);
                reset({ prompt: "" });
              })}
              className="flex items-center  rounded-2xl px-3 py-2 bg-[#F8F8F9]"
            >
              <textarea
                {...register("prompt")}
                placeholder="만들고 싶은 루프를 입력해주세요."
                rows={1}
                className="max-h-32 flex-1 border-none text-sm text-[#2C2C2C] outline-none"
                aria-label="루프 생성 요청 입력란"
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
  );
}
