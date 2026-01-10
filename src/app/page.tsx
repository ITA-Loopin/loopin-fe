"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { apiFetch } from "@/lib/api";
import {
  buildUserFromMemberProfile,
  fetchMemberProfile,
  type MemberResponse,
} from "@/lib/member";
import type { User } from "@/types/auth";

export const dynamic = "force-dynamic";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = useCallback(async () => {
    try {
      const memberResponse = await fetchMemberProfile();


      const fallbackUser: User = {
        id: "user",
        nickname: "루프인",
      };


      const userData = buildUserFromMemberProfile(
        memberResponse.data,
        fallbackUser
      );

      dispatch(
        setCredentials({
          user: userData,
        })
      );

      router.replace("/home");
    } catch (error) {
      console.error("로그인 처리 실패:", error);
      alert("로그인 처리 중 오류가 발생했습니다.");
    }
  }, [dispatch, router]);

  const handleKakaoLogin = () => {
    window.location.href =
      "https://api.loopin.co.kr/oauth2/authorization/kakao";
  };

  const handleNaverLogin = () => {
    window.location.href =
      "https://api.loopin.co.kr/oauth2/authorization/naver";
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "https://api.loopin.co.kr/oauth2/authorization/google";
  };

  useEffect(() => {
    const status = searchParams.get("status");

    if (status === "LOGIN_SUCCESS") {
      handleLoginSuccess();
      return;
    }

    if (status === "SIGNUP_REQUIRED") {
      const ticket = searchParams.get("ticket");

      if (ticket) {
        sessionStorage.setItem("signup_data", JSON.stringify({ ticket }));
        router.push("/auth/onboarding");
      }

      return;
    }

    if (!status && isAuthenticated) {
      router.replace("/home");
    }
  }, [searchParams, handleLoginSuccess, router, isAuthenticated]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background:
            "linear-gradient(136deg, #FF5741 54.38%, #FFE4E0 118.92%)",
        }}
      >
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-6 py-14 text-white"
      style={{
        background: "linear-gradient(136deg, #FF5741 54.38%, #FFE4E0 118.92%)",
      }}
    >
      <div className="relative z-10 flex w-full flex-row items-center justify-center gap-6 text-center">
        <Image
          src="/loading-logo.svg"
          alt="Loopin loading emblem"
          width={70}
          height={70}
          className="mb-6 drop-shadow-lg animate-[spin_10s_linear_infinite]"
          priority
        />
        <Image
          src="/loopin-logo.svg"
          alt="Loopin logo"
          width={180}
          height={70}
          className="drop-shadow-lg"
          priority
        />
      </div>
      <div
        className={`relative z-10 mt-16 w-full max-w-sm transition-all duration-700 ${
          showContent ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <p className="mb-10 text-center text-base font-medium">
          간편 로그인으로 지금 바로 Loopin을 시작해보세요!
        </p>

        <div className="space-y-3">
          <button
            onClick={handleKakaoLogin}
            className="flex w-full items-center justify-between rounded-full bg-[#FEE500] px-6 py-4 text-left font-semibold text-[#191919] shadow-lg shadow-black/10"
          >
            <span className="flex items-center gap-3">
              <Image
                src="/kakao-icon.svg"
                alt="Kakao"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              카카오 로그인
            </span>
          </button>

          <button
            onClick={handleNaverLogin}
            className="flex w-full items-center justify-between rounded-full bg-[#03C75A] px-6 py-4 text-left font-semibold text-white shadow-lg shadow-black/10"
          >
            <span className="flex items-center gap-3">
              네이버 로그인
            </span>
          </button>

          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-between rounded-full bg-white px-6 py-4 text-left font-semibold text-[#1F1F1F] shadow-lg shadow-black/10"
          >
            <span className="flex items-center gap-3">
              구글 로그인
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
