"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import BottomTab from "@/components/navigation/BottomTab";
import { PageBackground } from "@/components/common/PageBackground";

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

  const layout = (
    <div
      className={`relative flex h-screen flex-col overflow-hidden ${isHomePage || isAnalyticsPage || isMyPage || isTeamManagePage ? "" : "bg-[#F9FAFB]"}`}
      style={
        isHomePage
          ? {
              // eslint-disable-next-line no-restricted-syntax
              background:
                "linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 228, 224, 0.3) 100%)",
            }
          : undefined
      }
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
    return (
      <PageBackground
        topColor="rgb(255, 255, 255)"
        bottomColor="rgba(255, 228, 224, 0.3)"
      >
        {layout}
      </PageBackground>
    );
  }

  return layout;
}
