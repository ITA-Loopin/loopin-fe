"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BottomTabItem = {
  key: string;
  label: string;
  href: string;
  icon: string;
};

const TAB_ITEMS: BottomTabItem[] = [
  {
    key: "ai-planner",
    label: "AI 플래너",
    href: "/planner",
    icon: "/bottomTab/BottomTab_AI.svg",
  },
  {
    key: "calendar",
    label: "루프 캘린더",
    href: "/calendar",
    icon: "/bottomTab/BottomTab_calender.svg",
  },
  {
    key: "home",
    label: "홈",
    href: "/home",
    icon: "/bottomTab/BottomTab_home.svg",
  },
  {
    key: "analytics",
    label: "루프 리포트",
    href: "/analytics",
    icon: "/bottomTab/BottomTab_graph.svg",
  },
  {
    key: "teamloop",
    label: "팀 루프",
    href: "/teamloop",
    icon: "/bottomTab/BottomTab_party.svg",
  },
];

export function BottomTab() {
  const pathname = usePathname();

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-6"
      style={{
        bottom: `calc(24px)`,
      }}
    >
      <div className="pointer-events-auto relative z-10 flex h-[70px] w-full max-w-[420px] items-center justify-between rounded-[38px] border border-white/40 bg-white/90 px-6 shadow-[0px_16px_32px_rgba(32,32,32,0.16)] backdrop-blur-md">
        {TAB_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(`${item.href}/`)) ||
            (item.href === "/calendar" && pathname.startsWith("/loops/"));

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`relative flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors ${
                item.key === "calendar" ? "calendar-icon-trigger" : ""
              }`}
            >
              <div
                className={`relative h-5 w-5 transition-opacity ${
                  isActive ? "opacity-100" : "opacity-80"
                } ${
                  isActive
                    ? "bg-[var(--primary-main,#FF543F)]"
                    : "bg-[var(--gray-300)]"
                }`}
                style={{
                  maskImage: `url(${item.icon})`,
                  WebkitMaskImage: `url(${item.icon})`,
                }}
              />
              <span
                className={`text-center text-[8px] font-bold leading-[150%] tracking-[-0.32px] transition-colors ${
                  isActive ? "text-[var(--primary-main)]" : "text-[var(--gray-300)]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomTab;
