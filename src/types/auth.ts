export interface KakaoUser {
  id: number;
  connected_at: string;
  kakao_account: {
    profile: {
      nickname: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
    email?: string;
  };
}

export interface User {
  id: string;
  email?: string;
  nickname: string;
  profileImage?: string;
  kakaoId: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}
