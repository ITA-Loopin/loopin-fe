import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  Messaging,
  onMessage,
} from "firebase/messaging";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAlcaUrp2UGYeaFxbVlPMf9wvAYJntxRtk",
  authDomain: "loopin-474713.firebaseapp.com",
  projectId: "loopin-474713",
  storageBucket: "loopin-474713.firebasestorage.app",
  messagingSenderId: "761645347613",
  appId: "1:761645347613:web:59f8017b1b861e6e9d27f4",
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export const initializeFirebase = (): FirebaseApp => {
  if (typeof window === "undefined") {
    throw new Error("Firebase는 클라이언트 사이드에서만 사용할 수 있습니다.");
  }

  if (app) {
    return app;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    app = initializeApp(firebaseConfig);
  }

  return app;
};

// Messaging 인스턴스 가져오기
export const getFirebaseMessaging = (): Messaging | null => {
  if (typeof window === "undefined") {
    return null;
  }

  if (messaging) {
    return messaging;
  }

  try {
    const app = initializeFirebase();
    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error("Firebase Messaging 초기화 실패:", error);
    return null;
  }
};

// FCM 토큰 가져오기
export const getFCMToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const messagingInstance = getFirebaseMessaging();
    if (!messagingInstance) {
      console.error("Messaging 인스턴스를 가져올 수 없습니다.");
      return null;
    }

    // VAPID 키는 Firebase Console에서 생성한 키를 사용합니다
    // 여기서는 기본값으로 설정하지만, 실제로는 환경변수로 관리하는 것이 좋습니다
    const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY || "";

    if (!vapidKey) {
      console.warn(
        "VAPID 키가 설정되지 않았습니다. FCM 토큰을 가져올 수 없습니다."
      );
      return null;
    }

    const token = await getToken(messagingInstance, { vapidKey });

    if (token) {
      console.log("FCM 토큰 가져오기 성공:", token);
      return token;
    } else {
      console.warn(
        "FCM 토큰을 가져올 수 없습니다. 알림 권한이 필요할 수 있습니다."
      );
      return null;
    }
  } catch (error) {
    console.error("FCM 토큰 가져오기 실패:", error);
    return null;
  }
};

// 포그라운드 메시지 수신 핸들러
export const onForegroundMessage = (
  callback: (payload: unknown) => void
): (() => void) | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const messagingInstance = getFirebaseMessaging();
    if (!messagingInstance) {
      return null;
    }

    return onMessage(messagingInstance, callback);
  } catch (error) {
    console.error("포그라운드 메시지 핸들러 등록 실패:", error);
    return null;
  }
};
