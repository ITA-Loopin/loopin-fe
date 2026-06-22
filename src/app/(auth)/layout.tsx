"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import BottomTab from "@/components/navigation/BottomTab";
import { PageBackground } from "@/components/common/PageBackground";

// home 페이지 그라데이션. safe-area-inset 영역엔 시작/끝 색을 단색으로 연장.
const HOME_GRADIENT = `linear-gradient(
  to bottom,
  rgba(255, 255, 255, 1) 0%,
  rgba(255, 255, 255, 1) env(safe-area-inset-top),
  rgba(255, 228, 224, 0.3) calc(100% - env(safe-area-inset-bottom)),
  rgba(255, 228, 224, 0.3) 100%
)`;

// gray-100 단색. PageBackground로 깔아 safe-area 영역까지 동일 색 연장.
// eslint-disable-next-line no-restricted-syntax
const GRAY_100_BACKGROUND = "#F8F8F9";

export default function AuthLayout({
  children,
  header,
}: {
  children: ReactNode;
  header: ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/home";
  const isAnalyticsPage = pathname === "/analytics";
  const isMyPage = pathname === "/my-page";
  const isTeamManagePage = pathname?.includes("/manage");

  const isPlannerChat = /^\/planner\/[^/]+$/.test(pathname ?? "");
  const isTeamChat = /^\/team\/[^/]+\/chat$/.test(pathname ?? "");
  const isTeamActivity = /^\/team\/[^/]+\/activity$/.test(pathname ?? "");
  const hideBottomTab = isPlannerChat || isTeamChat || isTeamActivity;

  // 자체 배경을 처리하는 페이지(analytics: 상태별 그라데이션, my-page/team-manage: 흰색)는
  // PageBackground 없이 통과. 그 외 회색 톤 페이지는 gray-100을 깔아 safe-area까지 연장.
  const pageBackground = isHomePage
    ? HOME_GRADIENT
    : isAnalyticsPage || isMyPage || isTeamManagePage
      ? null
      : GRAY_100_BACKGROUND;

  const layout = (
    <div
      className={`relative flex h-screen flex-col overflow-hidden ${isHomePage || isAnalyticsPage || isMyPage || isTeamManagePage ? "" : "bg-gray-100"}`}
    >
      {header}
      <div
        className={`flex-1 overflow-y-auto ${hideBottomTab ? "" : "pb-24"} w-full overflow-x-hidden ${isAnalyticsPage ? "bg-transparent" : isTeamManagePage ? "bg-gray-white" : ""}`}
      >
        {children}
      </div>
      {!hideBottomTab && <BottomTab />}
    </div>
  );

  if (pageBackground) {
    return <PageBackground background={pageBackground}>{layout}</PageBackground>;
  }

  return layout;
}
