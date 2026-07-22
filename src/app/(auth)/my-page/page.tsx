"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMemberProfile, type MemberProfile } from "@/services/member";

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* 사용자 정보 섹션 */}
        <div className="mb-8 p-4 flex flex-col bg-gray-100 rounded-lg gap-1">
          <p className="text-lg font-semibold text-gray-800">
            {profile?.nickname || "닉네임"}
          </p>
          <p className="text-sm text-gray-600">
            {profile?.email || "이메일"}
          </p>
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
