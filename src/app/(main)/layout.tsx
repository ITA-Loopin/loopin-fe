"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import BottomTab from "@/components/navigation/BottomTab";

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/home";
  const isAnalyticsPage = pathname === "/analytics";
  const isMyPage = pathname === "/my-page";
  const isTeamManagePage = pathname?.includes("/manage");

  return (
    <div
      className={`relative flex h-screen flex-col overflow-hidden ${isHomePage || isAnalyticsPage || isMyPage || isTeamManagePage ? "" : "bg-[#F9FAFB]"}`}
      style={isHomePage ? {
        background: "linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 228, 224, 0.3) 100%)",
      } : undefined}
    >
      <div
        className={`flex-1 overflow-y-auto pb-24 w-full overflow-x-hidden ${isAnalyticsPage ? "bg-transparent" : isTeamManagePage ? "bg-[var(--gray-white)]" : ""}`}
      >
        {children}
      </div>
      <BottomTab />
    </div>
  );
}
