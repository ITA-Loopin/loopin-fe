"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/common/Modal";
import { apiFetch } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import type { User } from "@/types/auth";

type SignupSession = {
  email: string;
  provider: string;
  providerId: string;
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
        accessToken: string;
      }>("/rest-api/v1/auth/signup-login", {
        method: "POST",
        json: {
          email: signupData.email,
          provider: signupData.provider,
          providerId: signupData.providerId,
          nickname,
        },
      });

      const fallbackUser: User = {
        id: signupData.providerId,
        email: signupData.email,
        nickname,
        kakaoId: Number.isNaN(Number(signupData.providerId))
          ? 0
          : Number(signupData.providerId),
      };

      dispatch(
        setCredentials({
          user: data.user || fallbackUser,
          accessToken: data.accessToken,
        })
      );

      sessionStorage.removeItem("signup_data");
      setIsModalOpen(false);
      router.replace("/home");
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
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-[#FF5741]/20 ${
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
              className="flex-1 border-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="닉네임"
            />
            <button
              type="button"
              onClick={checkNicknameDuplicate}
              disabled={isChecking || nickname.length === 0}
              className="shrink-0 rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isChecking ? "확인 중..." : "중복확인"}
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            한글/영문 조합 가능, 최대 10자
          </p>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="w-full max-w-xs rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7661] to-[#FFB199]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="#fff"
              className="h-12 w-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>

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
            className="mt-8 w-full rounded-full bg-[#2C2C2C] px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "처리 중..." : "Loopin 시작하기"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
