"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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
import { saveFCMTokenApi, setupNativeFCMTokenListener } from "@/lib/fcm";
import { authFetch } from "@/utils/fetch";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PageBackground } from "@/components/common/PageBackground";

// safe-area-inset 영역엔 시작/끝 색을 단색으로 연장. main 영역(안전영역 안쪽)에서
// 원래 54% stop이 보이도록 stop position을 보정 — viewport 전체에 깔려도 main 안에서의
// 색 분포가 원본과 동일하게 유지됨.
const LANDING_GRADIENT = `linear-gradient(
  136deg,
  #FF5741 0%,
  #FF5741 env(safe-area-inset-top),
  #FF5741 calc(env(safe-area-inset-top) + (100% - env(safe-area-inset-top) - env(safe-area-inset-bottom)) * 0.54),
  #FFE4E0 calc(100% - env(safe-area-inset-bottom)),
  #FFE4E0 100%
)`;

const LANDING_LOADING_GRADIENT = `linear-gradient(
  136deg,
  #FF5741 0%,
  #FF5741 env(safe-area-inset-top),
  #FF5741 calc(env(safe-area-inset-top) + (100% - env(safe-area-inset-top) - env(safe-area-inset-bottom)) * 0.5438),
  #FFE4E0 calc(100% - env(safe-area-inset-bottom) + (100% - env(safe-area-inset-top) - env(safe-area-inset-bottom)) * 0.1892),
  #FFE4E0 100%
)`;

const API_BASE_URL = "https://api.loopin.co.kr";
const MEMBER_URL = `${API_BASE_URL}/rest-api/v1/member`;
const REFRESH_URL = `${API_BASE_URL}/rest-api/v1/auth/refresh-token`;

export const dynamic = "force-dynamic";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showContent, setShowContent] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isAndroidApp, setIsAndroidApp] = useState(false);
  const loginProcessedRef = useRef(false);
  const restoreAttemptedRef = useRef(false);

  useEffect(() => {
    setIsAndroidApp(!!(window as any).AndroidBridge);
  }, []);

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

  // 쿠키 기반 세션 자동 복원. Redux 메모리 휘발(앱 강제 종료) 후에도
  // access_token/refresh_token 쿠키가 살아있으면 그 쿠키로 사용자 정보를 다시 가져와
  // Redux를 복원하고 /home으로 보낸다. apiFetch는 401 시 자동 "/"로 리다이렉트하기 때문에
  // 무한 루프 방지를 위해 여기서는 직접 fetch를 사용한다.
  const tryRestoreSession = useCallback(async () => {
    if (restoreAttemptedRef.current) return;
    restoreAttemptedRef.current = true;
    setIsRestoring(true);

    try {
      let res = await fetch(MEMBER_URL, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (res.status === 401) {
        const refreshRes = await fetch(REFRESH_URL, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!refreshRes.ok) {
          setIsRestoring(false);
          return;
        }
        res = await fetch(MEMBER_URL, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
      }

      if (!res.ok) {
        setIsRestoring(false);
        return;
      }

      const memberResponse: MemberResponse = await res.json();
      const fallbackUser: User = { id: "user", nickname: "루프인" };
      const userData = buildUserFromMemberProfile(
        memberResponse.data,
        fallbackUser
      );

      dispatch(setCredentials({ user: userData }));

      try {
        await saveFCMTokenApi(authFetch);
      } catch (error) {
        console.error("FCM 토큰 저장 실패:", error);
      }

      router.replace("/home");
    } catch (error) {
      console.error("세션 자동 복원 실패:", error);
      setIsRestoring(false);
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

  const handleAppleLogin = () => {
    window.location.href =
      "https://api.loopin.co.kr/oauth2/authorization/apple";
  };

  // 네이티브 FCM 토큰 리프레시 리스너 등록
  useEffect(() => {
    setupNativeFCMTokenListener(authFetch);
  }, []);

  useEffect(() => {
    const status = searchParams.get("status");

    if (status === "LOGIN_SUCCESS") {
      if (loginProcessedRef.current) return;
      loginProcessedRef.current = true;
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

    if (!status) {
      if (isAuthenticated) {
        router.replace("/home");
      } else {
        tryRestoreSession();
      }
    }
  }, [
    searchParams,
    handleLoginSuccess,
    router,
    isAuthenticated,
    tryRestoreSession,
  ]);

  if (isLoading || isRestoring) {
    return (
      <PageBackground background={LANDING_LOADING_GRADIENT}>
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner width={96} height={96} />
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground background={LANDING_GRADIENT}>
      {/* 장식 Ellipse — viewport 전체에 fixed로 깔아야 status bar 영역까지 흰색 blur가 도달.
          main 안에만 두면 main 영역만 흰색이 입혀져 그라데이션과 단색 경계가 보임. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
      >
        <div
          className="absolute -left-[60px] -top-[258px] h-[539px] w-[619px] rounded-full bg-white opacity-40"
          style={{ filter: "blur(230px)" }}
        />
        <div
          className="absolute -left-[326px] top-[369px] h-[596px] w-[506px] rounded-full bg-white opacity-60"
          style={{ filter: "blur(220px)" }}
        />
        <div className="absolute left-[120px] -top-[96px] h-[233px] w-[403px] rounded-full opacity-40 bg-sub-mint blur-[234px]" />
        <div className="absolute left-[120px] top-[559px] h-[383px] w-[394px] rounded-full opacity-40 bg-sub-mint blur-[194px]" />
      </div>

      <div className="relative flex h-full flex-col items-center overflow-hidden text-white">
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
          <Button
            variant="icon"
            onClick={handleKakaoLogin}
            aria-label="카카오 로그인"
             
            className="h-10 w-10 bg-brand-kakao"
          >
            <Image
              src="/kakao-icon.svg"
              alt="Kakao"
              width={24}
              height={24}
            />
          </Button>
          <Button
            variant="icon"
            onClick={handleGoogleLogin}
            aria-label="구글 로그인"
            className="h-10 w-10 bg-white"
          >
            <Image
              src="/google-simple.png"
              alt="Google"
              width={24}
              height={24}
            />
          </Button>
          <Button
            variant="icon"
            onClick={handleNaverLogin}
            aria-label="네이버 로그인"
             
            className="h-10 w-10 bg-brand-naver"
          >
            <Image
              src="/naver-simple.png"
              alt="Naver"
              width={22}
              height={22}
            />
          </Button>
          {!isAndroidApp && (
            <Button
              variant="icon"
              onClick={handleAppleLogin}
              aria-label="애플 로그인"
              className="h-10 w-10 bg-black"
            >
              <Image
                src="/icon-apple.png"
                alt="Apple"
                width={24}
                height={24}
              />
            </Button>
          )}
        </div>
      </div>
      </div>
    </PageBackground>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
