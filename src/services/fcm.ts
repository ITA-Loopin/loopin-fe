import { api } from "@/lib/http";
import { getFCMToken } from "@/lib/firebase";

// FCM 토큰 저장 요청 타입
interface SaveFCMTokenRequest {
  fcmToken: string;
}

// 네이티브 WebView 내 실행 여부 확인
function isNativeWebView(): boolean {
  return (
    typeof window !== "undefined" &&
    !!(window as any).ReactNativeWebView
  );
}

// 네이티브 FCM 토큰 가져오기
function getNativeFCMToken(): string | null {
  if (typeof window !== "undefined" && (window as any).__NATIVE_FCM_TOKEN__) {
    return (window as any).__NATIVE_FCM_TOKEN__;
  }
  return null;
}

// FCM 토큰 저장 API
export const saveFCMTokenApi = async (): Promise<boolean> => {
  try {
    let token: string | null = null;

    if (isNativeWebView()) {
      // 네이티브 WebView: 네이티브 FCM 토큰만 사용 (웹 토큰으로 폴백하지 않음)
      token = getNativeFCMToken();
      if (!token) {
        // 네이티브 토큰이 아직 inject 안 됨 - 저장 건너뜀
        console.log("네이티브 FCM 토큰 대기 중, 저장 건너뜀");
        return false;
      }
    } else {
      // 웹 브라우저: 웹 FCM 토큰 사용
      token = await getFCMToken();
    }

    if (!token) {
      console.warn("FCM 토큰을 가져올 수 없어 저장하지 않습니다.");
      return false;
    }

    await api<void>(
      "/rest-api/v1/fcm",
      { method: "POST", json: { fcmToken: token } }
    );
    return true;
  } catch (err) {
    console.error("FCM 토큰 저장 중 오류 발생:", err);
    return false;
  }
};

// 네이티브 FCM 토큰 리프레시 리스너 등록
export function setupNativeFCMTokenListener() {
  if (typeof window === "undefined" || !isNativeWebView()) {
    return;
  }

  (window as any).__onNativeFCMToken = async (token: string) => {
    try {
      (window as any).__NATIVE_FCM_TOKEN__ = token;
      await saveFCMTokenApi();
    } catch (err) {
      console.error("네이티브 FCM 토큰 재등록 실패:", err);
    }
  };
}

// FCM 토큰 삭제 API
export const deleteFCMTokenApi = async (): Promise<boolean> => {
  try {
    await api<void>(
      "/rest-api/v1/fcm",
      { method: "DELETE" }
    );
    return true;
  } catch (err) {
    console.error("FCM 토큰 삭제 중 오류 발생:", err);
    return false;
  }
};
