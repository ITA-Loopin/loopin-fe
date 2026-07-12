"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/common/Button";
import { fetchMemberProfile, type MemberProfile } from "@/lib/member";
import { useAccount } from "@/hooks/useAccount";

export default function AccountPage() {
  const { deleteMember, loading: withdrawLoading } = useAccount();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchMemberProfile();
        if (response.data) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error("프로필 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleWithdraw = async () => {
    setIsWithdrawModalOpen(false);
    await deleteMember();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex-1 flex flex-col overflow-y-auto px-4 py-6">
          <div className="mb-8 flex flex-col items-center">
            {/* 닉네임 정보 */}
            <div className="mb-4 w-full max-w-md">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                닉네임
              </label>
              <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-base text-gray-800">
                  {profile?.nickname || "닉네임"}
                </p>
              </div>
            </div>

            {/* 이메일 정보 */}
            <div className="w-full max-w-md">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                이메일
              </label>
              <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-base text-gray-800">
                  {profile?.email || "이메일"}
                </p>
              </div>
            </div>
          </div>

          {/* 탈퇴 버튼 */}
          <div className="mt-auto flex justify-center mb-[11px]">
            <Button
              variant="tonal"
              onClick={() => setIsWithdrawModalOpen(true)}
              disabled={withdrawLoading}
            >
              <Image
                src="/my-page/icon_delete_small.png"
                alt="탈퇴하기"
                width={20}
                height={20}
              />
              탈퇴하기
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={handleWithdraw}
        title={`${profile?.nickname}님, 정말 회원 탈퇴 하시겠어요?`}
        confirmText="탈퇴하기"
        cancelText="취소"
        variant="danger"
      />
    </>
  );
}
