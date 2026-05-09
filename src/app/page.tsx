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
import { saveFCMTokenApi } from "@/lib/fcm";
import { authFetch } from "@/utils/fetch";

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

      // 로그인 성공 후 FCM 토큰 저장
      try {
        await saveFCMTokenApi(authFetch);
      } catch (error) {
        console.error("FCM 토큰 저장 실패:", error);
        // FCM 토큰 저장 실패는 로그인 플로우를 중단하지 않음
      }

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
      className="relative flex min-h-screen flex-col items-center overflow-hidden text-white"
      style={{
        background: "linear-gradient(136deg, #FF5741 54%, #FFE4E0 100%)",
      }}
    >
      {/* 장식 Ellipse */}
      <div
        className="absolute -left-[60px] -top-[258px] h-[539px] w-[619px] rounded-full bg-white opacity-40"
        style={{ filter: "blur(230px)" }}
      />
      <div
        className="absolute -left-[326px] top-[369px] h-[596px] w-[506px] rounded-full bg-white opacity-60"
        style={{ filter: "blur(220px)" }}
      />
      <div
        className="absolute left-[120px] -top-[96px] h-[233px] w-[403px] rounded-full opacity-40"
        style={{ background: "#E7FFBA", filter: "blur(234px)" }}
      />
      <div
        className="absolute left-[120px] top-[559px] h-[383px] w-[394px] rounded-full opacity-40"
        style={{ background: "#E7FFBA", filter: "blur(194px)" }}
      />

      {/* 로고 영역 */}
      <div className="relative z-10 mt-[21%] flex items-center gap-3">
        <style>{`
          @keyframes gentleSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <Image
          src="/loading-logo.svg"
          alt="Loopin loading emblem"
          width={70}
          height={70}
          className="drop-shadow-lg"
          style={{ animation: "gentleSpin 20s ease-in-out infinite" }}
          priority
        />
        <Image
          src="/loopin-logo.svg"
          alt="Loopin logo"
          width={180}
          height={76}
          className="drop-shadow-lg"
          priority
        />
      </div>

      {/* 하단 영역 */}
      <div
        className={`relative z-10 mt-auto flex flex-col items-center gap-5 pb-14 transition-all duration-700 ${
          showContent ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <p className="text-body-2-sb text-center text-white">
          간편 로그인으로 지금 바로 Loopin을 시작해보세요!
        </p>

        <div className="flex items-center gap-7">
          <button
            onClick={handleKakaoLogin}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEDC2C]"
          >
            <Image
              src="/kakao-icon.svg"
              alt="Kakao"
              width={24}
              height={24}
            />
          </button>
          <button
            onClick={handleGoogleLogin}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Image
              src="/google-simple.png"
              alt="Google"
              width={24}
              height={24}
            />
          </button>
          <button
            onClick={handleNaverLogin}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#03C75A]"
          >
            <Image
              src="/naver-simple.png"
              alt="Naver"
              width={22}
              height={22}
            />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black"
          >
            <Image
              src="/icon-apple.png"
              alt="Apple"
              width={24}
              height={24}
            />
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
