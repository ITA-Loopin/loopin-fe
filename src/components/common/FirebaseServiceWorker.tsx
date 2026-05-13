"use client";

import { useEffect, useState, useCallback } from "react";

interface ForegroundNotification {
  id: number;
  title: string;
  body: string;
}

let notificationId = 0;

/**
 * Firebase 서비스 워커 등록 + 포그라운드 알림 표시 컴포넌트
 */
export function FirebaseServiceWorker() {
  const [notifications, setNotifications] = useState<ForegroundNotification[]>([]);

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // 기존 서비스 워커가 있으면 먼저 해제
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        if (registration.scope.includes("firebase-messaging-sw")) {
          registration.unregister();
        }
      });
    });

    // 서비스 워커 등록
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js", { scope: "/" })
      .then((registration) => {
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
      });

    // 서비스 워커 컨트롤러 변경 감지
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  // 서비스 워커에서 전달받은 포그라운드 푸시 메시지 수신
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== "PUSH_NOTIFICATION") return;

      const { title, body } = event.data;
      const id = ++notificationId;
      setNotifications((prev) => [
        ...prev,
        { id, title: title || "Loopin 알림", body: body || "" },
      ]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 z-[9999] flex w-full max-w-[460px] -translate-x-1/2 flex-col gap-2 px-4">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="animate-in slide-in-from-top-2 fade-in flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg duration-300"
          onClick={() => dismissNotification(n.id)}
          role="alert"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C10.343 2 9 3.343 9 5v1.17A6.001 6.001 0 0 0 6 12v4l-2 2v1h16v-1l-2-2v-4a6.001 6.001 0 0 0-3-5.17V5c0-1.657-1.343-3-3-3Zm0 20a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z"
                fill="#EF4444"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">{n.title}</p>
            {n.body && (
              <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">{n.body}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissNotification(n.id);
            }}
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
