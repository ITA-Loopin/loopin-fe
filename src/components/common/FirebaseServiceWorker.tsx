"use client";

import { useEffect } from "react";

/**
 * Firebase 서비스 워커 등록 컴포넌트
 * 이 컴포넌트는 앱이 마운트될 때 서비스 워커를 등록합니다.
 */
export function FirebaseServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("서비스 워커를 지원하지 않는 브라우저입니다.");
      return;
    }

    // 서비스 워커 등록
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("Firebase 서비스 워커 등록 성공:", registration.scope);
      })
      .catch((error) => {
        console.error("Firebase 서비스 워커 등록 실패:", error);
      });

    // 서비스 워커 업데이트 확인
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("서비스 워커가 업데이트되었습니다.");
      window.location.reload();
    });
  }, []);

  return null;
}
