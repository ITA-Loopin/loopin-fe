"use client";

import Image from "next/image";
import { MessageBubble } from "./components/MessageBubble";
import { LoadingMessage } from "./components/LoadingMessage";
import { RecommendationCard } from "./components/RecommendationCard";
import { usePlannerChat } from "./hooks/usePlannerChat";

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

  return (
    <section className="flex min-h-[calc(100dvh-6rem)] flex-col bg-[#FFEFEA]/40">
      <header className="px-6">
        <div className="flex items-center gap-2 rounded-3xl bg-white px-4 py-3 shadow-sm">
          <Image
            src="/loopin-logo.svg"
            alt="Loopin"
            width={28}
            height={28}
            className="h-7 w-7"
            priority
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#FF5A45]">loopin</span>
            <span className="text-xs text-[#8F8A87]">
              당신의 루프 메이킹 파트너
            </span>
          </div>
        </div>
      </header>

      <div
        ref={messageListRef}
        className="mt-6 flex-1 overflow-y-auto px-6 pb-32"
      >
        <div className="space-y-4">
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
        <div className="sticky bottom-0 z-30 mt-auto w-full bg-gradient-to-t from-[#FFEFEA]/80 to-transparent px-6 pb-6 pt-6">
          <div className="mx-auto w-full max-w-xl rounded-3xl bg-white p-4 shadow-[0px_20px_40px_rgba(0,0,0,0.08)]">
            {exampleLabel ? (
              <p className="mb-2 text-xs text-[#8F8A87]">{exampleLabel}</p>
            ) : null}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 rounded-2xl border border-[#FFDBD3] bg-[#FFF6F4] px-3 py-2"
            >
              <textarea
                value={inputValue}
                onChange={handleInputChange}
                placeholder="만들고 싶은 루프를 입력해주세요.."
                rows={1}
                className="max-h-32 flex-1 resize-none border-none bg-transparent text-sm text-[#2C2C2C] outline-none placeholder:text-[#C2B8B4]"
                aria-label="루프 생성 요청 입력란"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5A45] text-white transition hover:bg-[#ff432a] disabled:cursor-not-allowed disabled:bg-[#FFB7AB]"
                aria-label="루프 생성 요청 보내기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12H4.5m0 0l-1.5 4.5M4.5 12L3 7.5m0 0l18-4.5-4.5 18-6.35-6.35a1 1 0 00-.53-.28L3 7.5z"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
