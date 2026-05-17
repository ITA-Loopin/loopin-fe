"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/common/header/Header";
import ConfirmModal from "@/components/common/ConfirmModal";
import ActionButton from "@/components/common/ActionButton";
import { fetchMemberProfile, type MemberProfile } from "@/lib/member";
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
      <div className="flex h-full flex-col">
        <Header
          left={<Header.BackButton />}
          center={
            <h1 className="whitespace-nowrap text-body-1-sb text-gray-800">
              프로필 편집
            </h1>
          }
        />
        <div className="flex-1 flex flex-col overflow-y-auto px-4 py-6">
          {/* 프로필 사진 영역 */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-full bg-gray-200">
                {profile?.profileImageUrl ? (
                  <Image
                    src={profile.profileImageUrl}
                    alt="프로필"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                    <span className="text-4xl text-gray-400">👤</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-gray-700"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.66667 6.66667H3.33333C3.68696 6.66667 4.02612 6.52619 4.27614 6.27614C4.52619 6.02612 4.66667 5.68696 4.66667 5.33333V4.66667C4.66667 4.31305 4.80619 3.9739 5.05624 3.72386C5.30629 3.47381 5.64543 3.33333 5.99999 3.33333H10C10.3536 3.33333 10.6928 3.47381 10.9428 3.72386C11.1929 3.9739 11.3333 4.31305 11.3333 4.66667V5.33333C11.3333 5.68696 11.4738 6.02612 11.7239 6.27614C11.9739 6.52619 12.3131 6.66667 12.6667 6.66667H13.3333C13.687 6.66667 14.0261 6.80619 14.2761 7.05624C14.5262 7.30629 14.6667 7.64543 14.6667 8V12C14.6667 12.3536 14.5262 12.6928 14.2761 12.9428C14.0261 13.1929 13.687 13.3333 13.3333 13.3333H2.66667C2.31305 13.3333 1.9739 13.1929 1.72386 12.9428C1.47381 12.6928 1.33333 12.3536 1.33333 12V8C1.33333 7.64543 1.47381 7.30629 1.72386 7.05624C1.9739 6.80619 2.31305 6.66667 2.66667 6.66667Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* 닉네임 정보 */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-600">
              닉네임
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-base text-gray-800">
                {profile?.nickname || "닉네임"}
              </p>
            </div>
          </div>

          {/* 로그아웃 버튼 */}
          <div className="mt-auto flex justify-center mb-[11px]">
            <ActionButton
              onClick={() => setIsLogoutModalOpen(true)}
              disabled={logoutLoading}
              icon={
                <Image
                  src="/my-page/icon_exit.png"
                  alt="로그아웃"
                  width={20}
                  height={20}
                />
              }
            >
              로그아웃
            </ActionButton>
          </div>
        </div>
      </div>

      <ConfirmModal
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
