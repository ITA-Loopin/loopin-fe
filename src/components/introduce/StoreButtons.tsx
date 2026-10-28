"use client";

import { useSyncExternalStore } from "react";
import { buttonVariants } from "@/components/common/Button";
import { cn } from "@/lib/utils";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  detectMobileOs,
  type MobileOs,
} from "./storeLinks";

const STORES = [
  { os: "ios", label: "App Store에서 다운로드", href: APP_STORE_URL },
  { os: "android", label: "Google Play에서 다운로드", href: PLAY_STORE_URL },
] as const;

// UA는 바뀌지 않으므로 구독할 이벤트가 없다.
const subscribeNoop = () => () => {};

/**
 * 스토어 다운로드 버튼. 서버에서는 두 버튼을 모두 그리고(SEO·PC),
 * 모바일이면 해당 OS 버튼을 앞에 강조해 보여준다.
 */
export function StoreButtons({ className }: { className?: string }) {
  const os = useSyncExternalStore<MobileOs>(
    subscribeNoop,
    () => detectMobileOs(navigator.userAgent, navigator.maxTouchPoints),
    () => null,
  );

  const ordered = os
    ? [
        ...STORES.filter((store) => store.os === os),
        ...STORES.filter((store) => store.os !== os),
      ]
    : STORES;

  const buttons = ordered.map((store) => {
    const isPrimary = os === null || store.os === os;
    return (
      <a
        key={store.os}
        href={store.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({
            variant: isPrimary ? "primary" : "outline",
            size: "lg",
          }),
          "w-full sm:w-auto sm:min-w-[220px]",
        )}
      >
        {store.label}
      </a>
    );
  });

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      {buttons}
    </div>
  );
}
