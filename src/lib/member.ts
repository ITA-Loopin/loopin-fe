import { apiFetch } from "@/lib/api";
import type { User } from "@/types/auth";

export type MemberProfile = {
  id?: number | string;
  email?: string;
  nickname?: string;
  profileImageUrl?: string;
  profileImage?: string;
  followMemberCount?: number;
  followedMemberCount?: number;
  chatRoomId?: number;
  kakaoId?: number;
  providerId?: string;
};

export type MemberResponse = {
  success?: boolean;
  data?: MemberProfile;
};

export function buildUserFromMemberProfile(
  profile: MemberProfile | undefined,
  fallback: Partial<User> & { id: string }
): User {
  const resolvedId =
    profile?.id !== undefined && profile?.id !== null
      ? String(profile.id)
      : profile?.providerId
        ? String(profile.providerId)
        : fallback.id;

  return {
    id: resolvedId,
    email: profile?.email ?? fallback.email,
    nickname: profile?.nickname ?? fallback.nickname ?? "루프인",
    profileImage:
      profile?.profileImageUrl ??
      profile?.profileImage ??
      fallback.profileImage,
    profileImageUrl:
      profile?.profileImageUrl ??
      fallback.profileImageUrl ??
      fallback.profileImage,
    kakaoId: profile?.kakaoId ?? fallback.kakaoId,
    followMemberCount: profile?.followMemberCount ?? fallback.followMemberCount,
    followedMemberCount:
      profile?.followedMemberCount ?? fallback.followedMemberCount,
    chatRoomId: profile?.chatRoomId ?? fallback.chatRoomId,
  };
}

export async function fetchMemberProfile() {
  return apiFetch<MemberResponse>("/rest-api/v1/member");
}
