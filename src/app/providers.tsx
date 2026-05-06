"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import dayjs from "dayjs";
import "dayjs/locale/ko";

// 전역 dayjs locale 설정
dayjs.locale("ko");
import { FirebaseServiceWorker } from "@/components/common/FirebaseServiceWorker";

function NativeBackHandler() {
  useEffect(() => {
    const handleNativeBack = () => {
      window.history.back();
    };

    window.addEventListener("interceptNativeBack", handleNativeBack);
    return () => {
      window.removeEventListener("interceptNativeBack", handleNativeBack);
    };
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <FirebaseServiceWorker />
      <NativeBackHandler />
      {children}
    </Provider>
  );
}
