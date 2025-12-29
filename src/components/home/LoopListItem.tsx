import Link from "next/link";
import type { LoopItem } from "./types";

type LoopListItemProps = {
  item: LoopItem;
};

export function LoopListItem({ item }: LoopListItemProps) {
  const progress =
    item.totalChecklists > 0
      ? Math.round((item.completedChecklists / item.totalChecklists) * 100)
      : 0;

  // SVG 원형 진행률 표시기 (radius = 20, circumference ≈ 125.66)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <li>
      <Link
        href={`/loops/${item.id}`}
        className="flex flex-col items-start gap-[10px] self-stretch py-3 px-4 rounded-[10px] bg-[var(--gray-white,#FFF)]"
      >
        {/* 안 레이아웃 */}
        <div className="flex w-full max-w-[500px] items-center justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold leading-[150%] tracking-[-0.32px] text-[var(--gray-800,#3A3D40)]">{item.title}</p>
            <p className="text-sm font-medium leading-[150%] tracking-[-0.28px] text-[var(--gray-500,#A0A9B1)]">
              {item.totalChecklists}개 중 {item.completedChecklists}개 완료
            </p>
          </div>
          {/* 원형 진행률 표시기 */}
          <div className="relative flex h-9 w-9 items-center justify-center">
            <svg className="h-9 w-9 -rotate-90" viewBox="0 0 48 48">
              {/* 배경 원 (연한 회색) */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="#F0F2F3"
                strokeWidth="4.5"
              />
              {/* 진행률 원 (산호색) */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="#FF7765"
                strokeWidth="4.5"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </Link>
    </li>
  );
}

