"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import BottomTab from "@/components/navigation/BottomTab";

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/home";
  
  return (
    <div 
      className={`relative flex min-h-screen flex-col ${isHomePage ? "" : "bg-[#F9FAFB]"}`}
    >
      <div className={`${isHomePage ? "flex-auto" : "flex-1"} pb-24 pt-6 w-full`}>{children}</div>
      <BottomTab />
    </div>
  );
}
