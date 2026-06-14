"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { PageBackground } from "@/components/common/PageBackground";

// 랜딩과 동일한 그라데이션. safe-area-inset 보정으로 main 영역에서 원래 54% stop 분포 유지.
const ENTRY_GRADIENT = `linear-gradient(
  136deg,
  #FF5741 0%,
  #FF5741 env(safe-area-inset-top),
  #FF5741 calc(env(safe-area-inset-top) + (100% - env(safe-area-inset-top) - env(safe-area-inset-bottom)) * 0.54),
  #FFE4E0 calc(100% - env(safe-area-inset-bottom)),
  #FFE4E0 100%
)`;

function EntryStep({ onNext }: { onNext: () => void }) {
  const [showIllust, setShowIllust] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const illustTimer = setTimeout(() => setShowIllust(true), 600);
    const buttonTimer = setTimeout(() => setShowButton(true), 1000);
    return () => {
      clearTimeout(illustTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <PageBackground background={ENTRY_GRADIENT}>
      <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden">
      {/* 장식 Ellipse - 좌상단 */}
      <div
        className="absolute -left-[60px] -top-[258px] h-[539px] w-[619px] rounded-full bg-white opacity-40"
        style={{ filter: "blur(230px)" }}
      />
      {/* 장식 Ellipse - 좌하단 */}
      <div
        className="absolute -left-[326px] top-[369px] h-[596px] w-[506px] rounded-full bg-white opacity-60"
        style={{ filter: "blur(220px)" }}
      />
      {/* 장식 Ellipse - 우상단 (연두) */}
      <div
        className="absolute left-[120px] -top-[96px] h-[233px] w-[403px] rounded-full opacity-40 bg-sub-mint blur-[234px]"
      />
      {/* 장식 Ellipse - 우하단 (연두) */}
      <div
        className="absolute left-[120px] top-[559px] h-[383px] w-[394px] rounded-full opacity-40 bg-sub-mint blur-[194px]"
      />

      {/* 텍스트 영역 - 즉시 표시 */}
      <div className="relative z-10 mt-[113px] flex flex-col items-center gap-3 px-6 animate-bounce-in">
        <style>{`
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-bounce-in {
            animation: fadeInDown 0.5s ease-out;
          }
        `}</style>
        <h1 className="text-title-2-b text-white">
          이제 Loopin을 시작해볼까요?
        </h1>
        <p className="text-body-1-sb text-white">당신만의 루프를 채워보세요</p>
      </div>

      {/* 일러스트 영역*/}
      <div
        className={`absolute inset-0 z-[1] flex items-center justify-end transition-all duration-700 ${
          showIllust ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        style={{ top: "10%" }}
      >
        <div className="relative mr-[-80px] h-[520px] w-[520px]">
          <Image
            src="/onboarding/entry-illustration.png"
            alt="Loopin"
            fill
            className="object-contain"
            sizes="480px"
          />
        </div>
      </div>

      {/* CTA 버튼 - 마지막에 페이드인 */}
      <div
        className={`relative z-10 w-full px-6 pb-12 transition-all duration-500 ${
          showButton ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <Button
          variant="primary"
          onClick={onNext}
           
          className="w-full h-auto rounded-full py-4 px-0 text-body-1-sb bg-primary-500 hover:bg-primary-500"
        >
          루핀 시작하기
        </Button>
      </div>
      </div>
    </PageBackground>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const progressWidth = `${(step / total) * 100}%`;
  return (
    <div className="absolute left-4 right-4 top-[69px] h-1 rounded-[10px] bg-gray-400">
      <div
         
        className="h-full rounded-[10px] bg-primary-500 transition-all duration-300"
        style={{ width: progressWidth }}
      />
    </div>
  );
}

function OnboardingSlide({
  step,
  title,
  subtitle,
  children,
  onNext,
}: {
  step: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onNext: () => void;
}) {
  return (
    <div className="relative flex h-full w-full flex-col bg-white">
      <ProgressBar step={step} total={3} />

      {/* 텍스트 영역 */}
      <div className="mt-[105px] flex flex-col items-center gap-3 px-10">
        { }
        <h2 className="text-title-2-b whitespace-pre-line text-center text-gray-black">
          {title}
        </h2>
        { }
        <p className="text-caption-r whitespace-pre-line text-center text-gray-600">
          {subtitle}
        </p>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="relative flex flex-1 items-center justify-center">
        {children}
      </div>

      {/* CTA 버튼 */}
      <div className="w-full px-6 pb-12">
        <Button
          variant="primary"
          onClick={onNext}
           
          className="w-full h-auto rounded-full py-4 px-0 text-body-1-sb bg-primary-500 hover:bg-primary-500"
        >
          다음
        </Button>
      </div>
    </div>
  );
}

function PhoneMockup({
  screenSrc,
  className = "",
  children,
}: {
  screenSrc: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative mx-auto h-[440px] w-[210px] ${className}`}>
      {/* 폰 프레임 */}
      { }
      <div className="absolute inset-0 rounded-[24px] border-[6px] border-gray-800 bg-black shadow-xl">
        {/* 노치 */}
        { }
        <div className="absolute left-1/2 top-0 z-[1] h-[18px] w-[60px] -translate-x-1/2 rounded-b-[10px] bg-gray-800" />
        {/* 스크린 */}
        <div className="absolute inset-[2px] overflow-hidden rounded-[18px]">
          <Image
            src={screenSrc}
            alt="앱 스크린"
            fill
            className="object-cover object-top"
            sizes="180px"
          />
        </div>
      </div>
      {children}
    </div>
  );
}

function ChatCard({
  message,
  position = "left",
}: {
  message: string;
  position?: "left" | "right";
}) {
  return (
    <div
      className={`absolute top-[-10px] z-10 rounded-lg bg-white p-2 ${position === "left" ? "-left-[60px]" : "-right-[60px]"}`}
      style={{
        // eslint-disable-next-line no-restricted-syntax
        boxShadow: "0px 2px 35px rgba(94, 94, 94, 0.2)",
        width: "190px",
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="relative h-7 w-7">
          <Image
            src="/onboarding/loopin-character.png"
            alt="loopin"
            fill
            className="object-contain"
            sizes="28px"
          />
        </div>
        { }
        <span className="text-[11px] font-semibold text-primary-500">loopin</span>
      </div>
      <div className="rounded-md">
        <p className="whitespace-pre-line text-[11px] font-semibold">
          {message}
        </p>
      </div>
    </div>
  );
}

function TeamChatGroup() {
  return (
    <div
      className="absolute -left-[40px] -right-[40px] top-[-20px] z-10 rounded-lg bg-white px-3 py-2.5"
      // eslint-disable-next-line no-restricted-syntax
      style={{ boxShadow: "0px 2px 35px rgba(94, 94, 94, 0.15)" }}
    >
      {/* 공지 카드 */}
      {/* eslint-disable-next-line no-restricted-syntax */}
      <div className="mb-2 flex items-start gap-1.5 rounded-md border border-[#F0F0F0] bg-[#FAFAFA] px-2.5 py-2">
        <Image
          src="/onboarding/icon-pin.svg"
          alt=""
          width={10}
          height={10}
          className="mt-0.5 shrink-0"
        />
        { }
        <p className="text-[10px] font-medium leading-[1.4] text-gray-800">
          각자 맡은 파트 루프 완료하기 해주시고, 채팅방에 파일 공유해주세요!
        </p>
      </div>

      {/* 발신 메시지 (오른쪽) */}
      <div className="mb-2 flex justify-end">
        { }
        <div className="rounded-lg bg-primary-200 px-2.5 py-1.5">
          { }
          <p className="text-[10px] font-semibold leading-[1.4] text-gray-800">
            오늘까지 스터디 자료 완료해봐요!
          </p>
        </div>
      </div>

      {/* 수신 메시지 (왼쪽) */}
      <div className="flex items-start gap-1.5">
        { }
        <div className="h-5 w-5 flex-shrink-0 rounded-full bg-gray-400" />
        <div>
          <div className="mb-0.5 flex items-center gap-1.5">
            { }
            <span className="text-[9px] font-semibold text-gray-800">
              루핑
            </span>
            { }
            <span className="text-[8px] text-gray-400">12:00</span>
          </div>
          {/* eslint-disable-next-line no-restricted-syntax */}
          <div className="rounded-lg bg-[#F3F4F6] px-2.5 py-1.5">
            { }
            <p className="text-[10px] font-semibold text-gray-800">
              넵 파이팅!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackCard({
  message,
  placement,
}: {
  message: string;
  placement: "upper-left" | "lower-right";
}) {
  return (
    <div
      className={`absolute z-10 rounded-md bg-white p-2.5 ${
        placement === "upper-left"
          ? "-left-[20px] -top-[30px]"
          : "-right-[20px] top-[410px]"
      }`}
      style={{
        // eslint-disable-next-line no-restricted-syntax
        boxShadow: "0px 2px 35px rgba(94, 94, 94, 0.19)",
        width: "200px",
      }}
    >
      { }
      <p className="text-[10px] font-semibold leading-[1.5] text-gray-800">
        {message}
      </p>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace("/home");
    }
  };

  return (
    <div className="relative h-full w-full">
      {currentStep === 0 && (
        <OnboardingSlide
          step={1}
          title={"루프를 만들어\n루틴으로 채워보세요!"}
          subtitle={
            "어려울 땐 AI 플래너 '루핑이'가 도와줘요\n10초면 첫 루프를 시작할 수 있어요"
          }
          onNext={handleNext}
        >
          <PhoneMockup screenSrc="/onboarding/screen-loop.png" className="mt-[60px]">
            <ChatCard
              message={
                "새 루프를 시작해볼까요?\n해야 할 일, 종료일, 반복 주기 등을 적어주세요!"
              }
              position="left"
            />
          </PhoneMockup>
        </OnboardingSlide>
      )}

      {currentStep === 1 && (
        <OnboardingSlide
          step={2}
          title={"팀을 만들어\n공통의 루틴을 만들어보세요!"}
          subtitle={
            "팀원들과 대화하며 함께 팀 루프를 채울 수 있어요\n서로의 진행을 가볍게 체크해요"
          }
          onNext={handleNext}
        >
          <PhoneMockup screenSrc="/onboarding/screen-calendar.png" className="mt-[50px]">
            <TeamChatGroup />
          </PhoneMockup>
        </OnboardingSlide>
      )}

      {currentStep === 2 && (
        <OnboardingSlide
          step={3}
          title={"루프 리포트로 나의 루틴 상태를\n피드백 받아보세요!"}
          subtitle={
            "달성률/연속 기록을 한눈에 보고\n잘 되는 루틴과 막힌 루틴을 알려줘요"
          }
          onNext={handleNext}
        >
          <PhoneMockup screenSrc="/onboarding/screen-report.png" className="mt-[40px]">
            <FeedbackCard
              message="완벽하진 않았지만, 루프가 이어지고 있어요 지금 상태로도 충분하지만, 조금 채워봐요!"
              placement="upper-left"
            />
            <FeedbackCard
              message="요즘 루프가 조금 버겁게 느껴졌을 수 있어요 지금보다 가벼운 루프를 만들어볼까요?"
              placement="lower-right"
            />
          </PhoneMockup>
        </OnboardingSlide>
      )}

      {currentStep === 3 && <EntryStep onNext={handleNext} />}
    </div>
  );
}
