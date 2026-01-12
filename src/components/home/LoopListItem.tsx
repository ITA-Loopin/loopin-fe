import Link from "next/link";
import type { LoopItem } from "./types";

type LoopListItemProps = {
  item: LoopItem;
};

export function LoopListItem({ item }: LoopListItemProps) {
  const progress =
    item.totalChecklists > 0
      ? Math.round((item.completedChecklists / item.totalChecklists) * 100)
      : item.completed
      ? 100
      : 0;

  // SVG 원형 진행률 표시기 (radius = 20, circumference ≈ 125.66)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <li>
      <Link
        href={`/loops/${item.id}`}
        className="flex flex-col items-start gap-[10px] self-stretch py-3 px-4 rounded-[10px] bg-[var(--gray-white)]"
      >
        {/* 안 레이아웃 */}
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-body-1-sb text-[var(--gray-800)]">{item.title}</p>
            {item.totalChecklists > 0 && (
              <p className="text-body-2-m text-[var(--gray-500)]">
                {item.totalChecklists}개 중 {item.completedChecklists}개 완료
              </p>
            )}
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
                stroke="var(--gray-200)"
                strokeWidth="4.5"
              />
              {/* 진행률 원 (산호색) */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="var(--primary-500)"
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

