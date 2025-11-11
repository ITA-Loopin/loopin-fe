import type { ReactNode } from "react";
import BottomTab from "@/components/navigation/BottomTab";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[100svh] flex-col bg-white">
      <main className="flex flex-1 flex-col">{children}</main>
      <BottomTab />
    </div>
  );
}
