"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";

export default function Home() {
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

  const handleLoginSuccess = useCallback(
    async (accessToken: string, _refreshToken: string) => {
      const sanitizedAccessToken = accessToken.replace(/\s/g, "+").trim();

      try {
        const response = await fetch("/api-proxy/rest-api/v1/member", {
          headers: {
            Authorization: `Bearer ${sanitizedAccessToken}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error("사용자 정보 요청 실패", response.status, errorBody);
          throw new Error(errorBody || "사용자 정보를 가져올 수 없습니다.");
        }

        const userData = await response.json();

        dispatch(
          setCredentials({
            user: userData,
            accessToken: sanitizedAccessToken,
          })
        );

        router.replace("/home");
      } catch (error) {
        console.error("로그인 처리 실패:", error);
        alert("로그인 처리 중 오류가 발생했습니다.");
      }
    },
    [dispatch, router]
  );

  const handleKakaoLogin = async () => {
    try {
      const response = await fetch(
        "/api-proxy/rest-api/v1/oauth/redirect-url/kakao"
      );

      if (!response.ok) {
        throw new Error("리다이렉션 URL을 가져올 수 없습니다.");
      }

      const data = await response.json();
      const redirectUrl = data.data || data.redirectUrl || data.url;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error(
          `리다이렉션 URL을 찾을 수 없습니다. 응답: ${JSON.stringify(data)}`
        );
      }
    } catch (error) {
      console.error("카카오 로그인 실패:", error);
      alert(
        `카카오 로그인에 실패했습니다.\n${
          error instanceof Error ? error.message : "다시 시도해주세요."
        }`
      );
    }
  };

  useEffect(() => {
    const status = searchParams.get("status");
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (status === "LOGIN_SUCCESS" && accessToken) {
      handleLoginSuccess(accessToken, refreshToken || "");
      return;
    }

    if (status === "SIGNUP_REQUIRED") {
      const email = searchParams.get("email");
      const provider = searchParams.get("provider");
      const providerId = searchParams.get("providerId");

      if (email && provider && providerId) {
        sessionStorage.setItem(
          "signup_data",
          JSON.stringify({ email, provider, providerId })
        );
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
        <img
          src="/loading-logo.svg"
          alt="Loopin loading emblem"
          width={70}
          className="mb-6 drop-shadow-lg animate-[spin_10s_linear_infinite]"
        />
        <img
          src="/loopin-logo.svg"
          alt="Loopin logo"
          width={180}
          height={70}
          className="drop-shadow-lg"
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
              <img src="/kakao-icon.svg" alt="Kakao" width={24} height={24} />
              카카오 로그인
            </span>
          </button>

          {/* <button
            onClick={handleNaverLogin}
            className="flex w-full items-center justify-between rounded-full bg-[#03C75A] px-6 py-4 text-left font-semibold text-white shadow-lg shadow-black/10"
          >
            <span className="flex items-center gap-3">
              <img src="/naver-icon.svg" alt="Naver" width={24} height={24} />
              네이버 로그인
            </span>
            <span className="text-sm text-white/70">준비중</span>
          </button>

          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-between rounded-full bg-white px-6 py-4 text-left font-semibold text-[#1F1F1F] shadow-lg shadow-black/10"
          >
            <span className="flex items-center gap-3">
              <img src="/google-icon.svg" alt="Google" width={24} height={24} />
              구글 로그인
            </span>
            <span className="text-sm text-[#1F1F1F]/60">준비중</span>
          </button> */}
        </div>
      </div>
    </div>
  );
}
