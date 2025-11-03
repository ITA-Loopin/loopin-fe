import type { ReactNode } from "react";
import BottomTab from "@/components/navigation/BottomTab";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#F9FAFB]">
      <div className="flex-1 pb-24 pt-6">{children}</div>
      <BottomTab />
    </div>
  );
}
