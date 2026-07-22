"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/common/Button";
import { fetchMemberProfile, type MemberProfile } from "@/services/member";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileEditPage() {
  const { logout, loading: logoutLoading } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetchMemberProfile();
        if (response) {
          setProfile(response);
        }
      } catch (error) {
        console.error("프로필 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
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
      <div className="flex h-full flex-col bg-gray-white">
        <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-6 pb-6">
          <div className="flex flex-col gap-2">
            <label className="text-caption-r text-gray-500">닉네임</label>
            <div className="w-full rounded-[10px] border border-gray-300 px-4 py-[13px]">
              <p className="text-body-1-m text-gray-800">
                {profile?.nickname || "닉네임"}
              </p>
            </div>
          </div>

          <div className="mt-auto flex justify-center pt-6">
            <Button
              variant="tonal"
              onClick={() => setIsLogoutModalOpen(true)}
              disabled={logoutLoading}
              className="bg-primary-100"
            >
              <Image
                src="/my-page/icon_exit.png"
                alt=""
                width={16}
                height={16}
              />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title={`${profile?.nickname || "루핑"}님, 로그아웃 하시겠어요?`}
        confirmText="로그아웃"
        cancelText="취소"
        variant="danger"
      />
    </>
  );
}
