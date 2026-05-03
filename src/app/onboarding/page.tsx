"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // 4번째 이미지 클릭 시 홈화면으로 이동
      router.replace("/home");
    }
  };

  return (
    <div
      className="relative"
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
      }}
    >
      <button
        onClick={handleNext}
        className="relative h-full w-full cursor-pointer border-none bg-transparent p-0 outline-none"
        style={{
          width: "100%",
          height: "100%",
        }}
        aria-label={`온보딩 ${currentStep}단계`}
      >
        <Image
          src={`/onboarding/onboarding${currentStep}.png`}
          alt={`온보딩 ${currentStep}단계`}
          fill
          className="object-fill"
          priority
          quality={100}
          sizes="100vw"
        />
      </button>
    </div>
  );
}
