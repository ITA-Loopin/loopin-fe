import { AuthFetch, isSuccess } from "@/utils/fetch";
import { ApiResponse } from "@/interfaces/response/ApiResponse";
import { getFCMToken } from "./firebase";

// FCM 토큰 저장 요청 타입
interface SaveFCMTokenRequest {
  fcmToken: string;
}

// FCM 토큰 저장 API
export const saveFCMTokenApi = async (
  authFetch: AuthFetch
): Promise<boolean> => {
  try {
    const token = await getFCMToken();
    
    if (!token) {
      console.warn("FCM 토큰을 가져올 수 없어 저장하지 않습니다.");
      return false;
    }

    const response = await authFetch<ApiResponse<unknown>>(
      "/rest-api/v1/fcm",
      { fcmToken: token },
      "POST"
    );

    console.log("FCM 토큰 저장 응답:", response);
    return isSuccess(response);
  } catch (err) {
    console.error("FCM 토큰 저장 중 오류 발생:", err);
    return false;
  }
};

// FCM 토큰 삭제 API
export const deleteFCMTokenApi = async (
  authFetch: AuthFetch
): Promise<boolean> => {
  try {
    const response = await authFetch<ApiResponse<unknown>>(
      "/rest-api/v1/fcm",
      undefined,
      "DELETE"
    );

    console.log("FCM 토큰 삭제 응답:", response);
    return isSuccess(response);
  } catch (err) {
    console.error("FCM 토큰 삭제 중 오류 발생:", err);
    return false;
  }
};
