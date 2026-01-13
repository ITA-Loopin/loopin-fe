"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import BottomTab from "@/components/navigation/BottomTab";

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/home";
  const isAnalyticsPage = pathname === "/analytics";
  const isMyPage = pathname === "/my-page";

  return (
    <div
      className={`relative flex h-screen flex-col overflow-hidden ${isHomePage || isAnalyticsPage || isMyPage ? "" : "bg-[#F9FAFB]"}`}
    >
      <div
        className={`${isHomePage ? "flex-auto min-h-0" : "flex-1"} pb-24 w-full overflow-y-auto overflow-x-hidden ${isAnalyticsPage ? "bg-transparent" : ""}`}
      >
        {children}
      </div>
      <BottomTab />
    </div>
  );
}
