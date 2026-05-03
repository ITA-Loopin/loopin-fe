"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Modal from "@/components/common/Modal";
import { apiFetch } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import type { User } from "@/types/auth";
import { buildUserFromMemberProfile, fetchMemberProfile } from "@/lib/member";
import { saveFCMTokenApi } from "@/lib/fcm";
import { authFetch } from "@/utils/fetch";

type SignupSession = {
  ticket: string;
};

type AlertState = {
  type: "error" | "success";
  message: string;
};

const MAX_LENGTH = 10;
const DUPLICATE_MESSAGE = "중복된 닉네임입니다. 다른 닉네임으로 시도해볼까요?";
const AVAILABLE_MESSAGE = "사용 가능한 닉네임이에요!";
const LENGTH_MESSAGE = "닉네임은 최대 10자까지 입력할 수 있어요";

export default function OnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [nickname, setNickname] = useState("");
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [signupData, setSignupData] = useState<SignupSession | null>(null);

  useEffect(() => {
    const signupDataStr = sessionStorage.getItem("signup_data");

    if (!signupDataStr) {
      router.replace("/");
      return;
    }

    try {
      const parsed = JSON.parse(signupDataStr) as SignupSession;
      setSignupData(parsed);
    } catch (error) {
      console.error("회원가입 세션 파싱 실패", error);
      sessionStorage.removeItem("signup_data");
      router.replace("/");
    }
  }, [router]);

  const hasAlert = useMemo(() => Boolean(alert), [alert]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;

      if (value.length > MAX_LENGTH) {
        setAlert({ type: "error", message: LENGTH_MESSAGE });
        return;
      }

      setNickname(value);
      setAlert(null);
      setModalError(null);
      setIsModalOpen(false);
    },
    []
  );

  const checkNicknameDuplicate = useCallback(async () => {
    if (!nickname) {
      setAlert({ type: "error", message: "닉네임을 입력해주세요." });
      return;
    }

    setIsChecking(true);
    setAlert(null);
    setModalError(null);

    try {
      const data = await apiFetch<{
        success?: boolean;
        data?: { available?: boolean };
      }>("/rest-api/v1/member/available", {
        searchParams: { nickname },
        skipCredentials: true, // 인증이 필요 없는 공개 엔드포인트
      });

      const isAvailable =
        data?.success !== false &&
        (data?.data?.available === undefined || data?.data?.available === true);

      if (isAvailable) {
        setAlert({ type: "success", message: AVAILABLE_MESSAGE });
        setModalError(null);
        setIsModalOpen(true);
      } else {
        setNickname("");
        setAlert({ type: "error", message: DUPLICATE_MESSAGE });
      }
    } catch (error) {
      console.error("닉네임 중복 확인 실패", error);
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "닉네임 중복 확인 중 오류가 발생했습니다.",
      });
    } finally {
      setIsChecking(false);
    }
  }, [nickname]);

  const handleCompleteSignup = useCallback(async () => {
    if (!signupData) {
      setModalError("회원가입 데이터가 없습니다. 다시 로그인해주세요.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const data = await apiFetch<{
        user?: User;
      }>("/rest-api/v1/auth/signup-login", {
        method: "POST",
        json: {
          nickname,
          ticket: signupData.ticket,
        },
        skipCredentials: false, // 회원가입 시에는 쿠키가 아직 없음
      });

      const fallbackUser: User = {
        id: "user",
        nickname,
      };

      const baseUser: User = data.user
        ? {
            ...data.user,
            id: data.user.id || "user",
          }
        : fallbackUser;

      let finalUser = baseUser;

      try {
        const memberResponse = await fetchMemberProfile();
        finalUser = buildUserFromMemberProfile(memberResponse.data, {
          ...baseUser,
          id: baseUser.id || "user",
        });
      } catch (memberError) {
        console.error("회원 정보 동기화 실패", memberError);
      }

      dispatch(
        setCredentials({
          user: finalUser,
        })
      );

      // 회원가입/로그인 성공 후 FCM 토큰 저장
      try {
        await saveFCMTokenApi(authFetch);
      } catch (error) {
        console.error("FCM 토큰 저장 실패:", error);
        // FCM 토큰 저장 실패는 회원가입 플로우를 중단하지 않음
      }

      sessionStorage.removeItem("signup_data");
      setIsModalOpen(false);
      router.replace("/onboarding");
    } catch (error) {
      console.error("회원가입 처리 실패", error);
      setModalError(
        error instanceof Error
          ? error.message
          : "회원가입 처리 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, nickname, router, signupData]);

  const closeModal = useCallback(() => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  }, [isSubmitting]);

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 py-12">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="space-y-1 text-left">
          <p className="text-2xl font-semibold text-foreground">
            Loopin에서 부를
          </p>
          <p className="text-2xl font-semibold text-foreground">
            당신의 이름은 무엇인가요?
          </p>
        </div>

        <div className="mt-12 space-y-4">
          <div className="min-h-[24px]">
            {hasAlert && (
              <p
                className={`text-sm ${
                  alert?.type === "success"
                    ? "text-emerald-500"
                    : "text-destructive"
                }`}
              >
                {alert?.message}
              </p>
            )}
          </div>

          <div
            className={`flex items-center gap-3 rounded-[10px] border px-4 py-3 ${
              alert?.type === "error"
                ? "border-destructive"
                : alert?.type === "success"
                  ? "border-emerald-400"
                  : "border-border"
            }`}
          >
            <input
              autoFocus
              value={nickname}
              onChange={handleInputChange}
              placeholder="닉네임을 입력해주세요"
              className="w-full flex-1 border-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="닉네임"
            />
            <button
              type="button"
              onClick={checkNicknameDuplicate}
              disabled={isChecking || nickname.length === 0}
              className="shrink-0 rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition"
            >
              {isChecking ? "확인 중..." : "중복확인"}
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            한글/영문 조합 가능, 최대 10자
          </p>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} className="w-[90%]">
        <div className="rounded-3xl bg-white p-4 text-center  flex flex-col items-center justify-center">
            <Image
              src="/onboarding/graphic_complete.svg"
              alt="완료"
              width={136}
              height={136}
            />

          <div className="mt-8 space-y-2">
            <p className="text-lg font-semibold text-foreground">
              {nickname || "닉네임"}님
            </p>
            <p className="text-sm text-muted-foreground">
              이제 Loopin을 시작해볼까요?
            </p>
          </div>

          {modalError && (
            <p className="mt-4 text-sm text-destructive">{modalError}</p>
          )}

          <button
            type="button"
            onClick={handleCompleteSignup}
            disabled={isSubmitting}
            className="mt-8 w-full rounded-full bg-[#2C2C2C] px-4 py-3 text-sm font-semibold text-white transition"
          >
            {isSubmitting ? "처리 중..." : "Loopin 시작하기"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
