"use client";

import type { RecommendationSchedule } from "../types";
import { formatSchedule } from "../utils";

type RecommendationCardProps = {
  recommendation: RecommendationSchedule;
  index: number;
  onSelect: (recommendation: RecommendationSchedule) => void;
};

export function RecommendationCard({
  recommendation,
  index,
  onSelect,
  chatRoomLoopSelect,
}: RecommendationCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 mb-4 shadow-sm">
      <div className="space-y-2">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#FF5A45]">추천{index}</p>
          <h3 className="text-lg font-bold text-[#2C2C2C]">
            {recommendation.title}
          </h3>
          <p className="text-sm text-[#2C2C2C]">{recommendation.content}</p>
        </div>

        <div className="rounded-lg bg-[#F8F8F9] p-3">
          <p className="mb-1 text-xs text-[#A0A9B1]">반복주기 및 기간</p>
          <p className="text-sm text-[#2C2C2C]">
            {formatSchedule(recommendation)}
          </p>
        </div>

        {/* 체크리스트 */}
        {recommendation.checklists?.length ? (
          <div className="rounded-lg bg-[#F8F8F9] p-3">
            <p className="mb-1 text-xs text-[#A0A9B1]">체크리스트</p>
            <ul className="space-y-1">
              {recommendation.checklists.map((item) => (
                <li key={item} className="text-sm text-[#2C2C2C]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!chatRoomLoopSelect && (
          <button
            type="button"
            onClick={() => onSelect(recommendation)}
            className="mt-1 w-full rounded-sm bg-[#FFE4E0] py-1 text-sm font-semibold text-[#FF543F]"
          >
            선택하기
          </button>
        )}
      </div>
    </div>
  );
}

export default RecommendationCard;
