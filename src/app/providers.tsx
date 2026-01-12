"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import dayjs from "dayjs";
import "dayjs/locale/ko";

// 전역 dayjs locale 설정
dayjs.locale("ko");

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
