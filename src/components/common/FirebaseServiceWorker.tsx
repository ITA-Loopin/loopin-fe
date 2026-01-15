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

    // 기존 서비스 워커가 있으면 먼저 해제
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        if (registration.scope.includes("firebase-messaging-sw")) {
          registration.unregister().then(() => {
            console.log("기존 Firebase 서비스 워커 해제됨");
          });
        }
      });
    });

    // 서비스 워커 등록
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js", {
        scope: "/",
      })
      .then((registration) => {
        console.log("Firebase 서비스 워커 등록 성공:", registration.scope);
        
        // 서비스 워커 업데이트 확인
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("새로운 서비스 워커가 설치되었습니다.");
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("Firebase 서비스 워커 등록 실패:", error);
        // 서비스 워커 등록 실패해도 FCM은 클라이언트 측에서 작동할 수 있음
      });

    // 서비스 워커 컨트롤러 변경 감지
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      console.log("서비스 워커가 업데이트되었습니다. 페이지를 새로고침합니다.");
      window.location.reload();
    });
  }, []);

  return null;
}
