"use client";

import Image from "next/image";
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
    label: "AI PLANNER",
    href: "/planner",
    icon: "/bottomTab/BottomTab_AI.svg",
  },
  {
    key: "calendar",
    label: "CALENDAR",
    href: "/calendar",
    icon: "/bottomTab/BottomTab_calender.svg",
  },
  {
    key: "home",
    label: "HOME",
    href: "/home",
    icon: "/bottomTab/BottomTab_home.svg",
  },
  {
    key: "analytics",
    label: "REPORT",
    href: "/analytics",
    icon: "/bottomTab/BottomTab_graph.svg",
  },
  {
    key: "teamloop",
    label: "TEAM LOOP",
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
              className="flex h-full flex-1 items-center justify-center text-xs font-semibold transition-colors"
            >
              {isActive ? (
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF5A45]">
                  {item.label}
                </span>
              ) : (
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  className={`h-6 w-6 transition-opacity ${
                    pathname === item.href ? "opacity-100" : "opacity-80"
                  }`}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomTab;
