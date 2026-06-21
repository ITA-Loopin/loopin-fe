"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import dayjs from "dayjs";
import "dayjs/locale/ko";

// 전역 dayjs locale 설정
dayjs.locale("ko");
import { PushNotificationToast } from "@/components/notification/PushNotificationToast";
import { useFirebaseServiceWorker } from "@/hooks/useFirebaseServiceWorker";

const ROOT_PATHS = ["/home"];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});

function NativeBackHandler() {
  const lastBackPressRef = useRef(0);
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  const handleNativeBack = useCallback(() => {
    const currentPath = window.location.pathname;
    const isRootPage = ROOT_PATHS.some(
      (root) => currentPath === root || currentPath === root + "/"
    );

    if (!isRootPage) {
      window.history.back();
      return;
    }

    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      // 2초 내 재시도 → 앱 종료
      (window as any).AndroidBridge?.closeApp?.();
      return;
    }

    lastBackPressRef.current = now;
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setShowToast(false), 2000);
  }, []);

  useEffect(() => {
    window.addEventListener("interceptNativeBack", handleNativeBack);
    return () => {
      window.removeEventListener("interceptNativeBack", handleNativeBack);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [handleNativeBack]);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-[156px] left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/80 px-6 py-3">
      <p className="whitespace-nowrap text-sm text-white">
        한 번 더 누르면 종료합니다
      </p>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  useFirebaseServiceWorker();
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PushNotificationToast />
        <NativeBackHandler />
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
