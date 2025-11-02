"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout, setLoading } from "@/store/slices/authSlice";

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    if (!confirm("정말로 Loopin 회원을 탈퇴하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    dispatch(setLoading(true));

    try {
      if (!accessToken) {
        throw new Error("인증 정보가 없습니다. 다시 로그인해주세요.");
      }

      const response = await fetch("/api-proxy/rest-api/v1/member", {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "회원 탈퇴에 실패했습니다.");
      }

      dispatch(logout());
      alert("회원 탈퇴가 완료되었습니다.");
      router.replace("/");
    } catch (err) {
      console.error("회원 탈퇴 실패", err);
      setError(
        err instanceof Error ? err.message : "회원 탈퇴에 실패했습니다."
      );
    } finally {
      setIsDeleting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Loopin 홈</h1>
      </div>

      {user ? (
        <div className="flex w-full max-w-sm flex-col items-stretch gap-6">
          <div className="rounded-xl border border-border bg-card px-6 py-4 text-left shadow-sm">
            <p className="text-lg font-medium">
              {user.nickname || user.email || "사용자"}님, 환영합니다!
            </p>
            {user.email && (
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            )}
          </div>

          <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-6 py-5 text-left">
            <h2 className="text-base font-semibold text-destructive">
              회원 탈퇴
            </h2>
            <p className="mt-1 text-sm text-destructive/70">
              탈퇴 시 계정과 모든 데이터가 영구적으로 삭제됩니다.
            </p>

            <button
              type="button"
              onClick={handleWithdraw}
              disabled={isDeleting}
              className="mt-4 w-full rounded-lg bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? "탈퇴 처리 중..." : "회원 탈퇴하기"}
            </button>

            {error && (
              <p className="mt-3 text-sm text-destructive-foreground/80">
                {error}
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          사용자 정보를 불러오는 중입니다...
        </p>
      )}
    </div>
  );
}
