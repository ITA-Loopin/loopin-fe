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
  const isTeamCreatePage = pathname === "/teamloop/create";

  const isPlannerChat = /^\/planner\/[^/]+$/.test(pathname ?? "");
  const isTeamChat = /^\/team\/[^/]+\/chat$/.test(pathname ?? "");
  const isTeamActivity = /^\/team\/[^/]+\/activity$/.test(pathname ?? "");
  const hideBottomTab = isPlannerChat || isTeamChat || isTeamActivity;

  const layout = (
    <div
      className={`relative flex h-screen flex-col overflow-hidden ${isHomePage || isAnalyticsPage || isMyPage || isTeamManagePage ? "" : isTeamCreatePage ? "bg-gray-white" : "bg-gray-100"}`}
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

  if (isHomePage) {
    const decoration = (
      <>
        <div className="absolute right-0 top-0 h-[162.286px] w-[360.827px] rotate-[30.835deg] rounded-full bg-primary-300 opacity-50 blur-[67px]" />
        <div className="absolute right-0 top-0 h-[170.615px] w-[379.346px] rotate-[7.014deg] rounded-full bg-sub-mint opacity-20 blur-[67px]" />
        <div className="absolute bottom-0 right-0 h-[170.615px] w-[379.346px] -rotate-[42.799deg] rounded-full bg-sub-mint opacity-20 blur-[67px]" />
        <div className="absolute left-0 top-[60%] h-[317.653px] w-[209px] rotate-[89.667deg] rounded-full bg-primary-300 opacity-[0.15] blur-[67px]" />
      </>
    );

    return (
      <PageBackground background={HOME_GRADIENT} decoration={decoration}>
        {layout}
      </PageBackground>
    );
  }

  return layout;
}
