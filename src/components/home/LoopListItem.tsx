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
    <li className="rounded-xl px-4 py-3 flex items-center justify-between bg-white">
      <div>
        <p className="font-medium">{item.title}</p>
        <p className="text-sm text-gray-500">
          {item.totalChecklists}개 중 {item.completedChecklists}개 완료
        </p>
      </div>
      {/* 원형 진행률 표시기 */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="transform -rotate-90 w-12 h-12">
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
    </li>
  );
}

