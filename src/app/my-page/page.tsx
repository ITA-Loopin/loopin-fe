"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/common/header/Header";
import { fetchMemberProfile, type MemberProfile } from "@/lib/member";

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        left={<Header.BackButton />}
        center={<Header.Title>마이페이지</Header.Title>}
      />
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* 사용자 정보 섹션 */}
        { }
        <div className="mb-8 p-4 flex flex-row items-center bg-gray-100 rounded-lg gap-2">
          <div className="relative">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-white">
              {profile?.profileImageUrl ? (
                <Image
                  src={profile.profileImageUrl}
                  alt="프로필"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-300">
                  <span className="text-2xl text-gray-400">👤</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-800">
            {profile?.nickname || "닉네임"}
          </p>
          <div className="">
            <p className="text-sm text-gray-600">
              {profile?.email || "이메일"}
            </p>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="space-y-2">
          <button
            onClick={() => router.push("/my-page/profile-edit")}
            className="w-full px-4 py-4 text-left text-base font-medium text-gray-800 hover:bg-gray-50"
          >
            프로필 편집
          </button>
          <button
            onClick={() => router.push("/my-page/account")}
            className="w-full px-4 py-4 text-left text-base font-medium text-gray-800 hover:bg-gray-50"
          >
            계정 관리
          </button>
        </div>
      </div>
    </div>
  );
}
