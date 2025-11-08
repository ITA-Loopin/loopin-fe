"use client";

import type { RecommendationSchedule } from "../types";
import { formatSchedule } from "../utils";

type RecommendationCardProps = {
  recommendation: RecommendationSchedule;
  onSelect: (recommendation: RecommendationSchedule) => void;
};

export function RecommendationCard({
  recommendation,
  onSelect,
}: RecommendationCardProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-[#FFE3DE] bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-base font-semibold text-[#FF5A45]">
          {recommendation.title}
        </p>
        <p className="text-sm text-[#564D48]">{recommendation.content}</p>
      </div>
      <div className="rounded-xl bg-[#FFF6F4] p-3 text-xs text-[#564D48]">
        <p className="font-medium text-[#FF5A45]">일정</p>
        <p className="mt-1">{formatSchedule(recommendation)}</p>
      </div>
      {recommendation.checklists?.length ? (
        <div className="rounded-xl bg-[#FFF6F4] p-3 text-xs text-[#564D48]">
          <p className="font-medium text-[#FF5A45]">체크리스트</p>
          <ul className="mt-1 space-y-1">
            {recommendation.checklists.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-[3px] inline-block h-1.5 w-1.5 rounded-full bg-[#FF5A45]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => onSelect(recommendation)}
        className="w-full rounded-lg bg-[#FF5A45] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ff432a]"
      >
        선택하기
      </button>
    </div>
  );
}

export default RecommendationCard;

