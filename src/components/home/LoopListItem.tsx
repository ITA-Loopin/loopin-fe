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
        className="flex items-center justify-between rounded-xl bg-white px-4 py-3 transition-transform duration-150 hover:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#FF7765]/40"
      >
        <div>
          <p className="font-medium text-[#2C2C2C]">{item.title}</p>
          <p className="text-sm text-gray-500">
            {item.totalChecklists}개 중 {item.completedChecklists}개 완료
          </p>
        </div>
        {/* 원형 진행률 표시기 */}
        <div className="relative flex h-12 w-12 items-center justify-center">
          <svg className="h-12 w-12 -rotate-90">
            {/* 배경 원 (연한 회색) */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="#E5E5E5"
              strokeWidth="4"
            />
            {/* 진행률 원 (산호색) */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="#FF543F"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </Link>
    </li>
  );
}

