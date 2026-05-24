"use client";

import type { RecommendationSchedule } from "../types";
import { formatSchedule } from "../utils";

type RecommendationCardProps = {
  recommendation: RecommendationSchedule;
  index: number;
  onSelect: (recommendation: RecommendationSchedule) => void;
  chatRoomLoopSelect: boolean;
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
          {/* eslint-disable-next-line no-restricted-syntax */}
          <p className="text-xs font-medium text-[#FF5A45]">추천{index}</p>
          { }
          <h3 className="text-lg font-bold text-gray-800">
            {recommendation.title}
          </h3>
          { }
          <p className="text-sm text-gray-800">{recommendation.content}</p>
        </div>

        { }
        <div className="rounded-lg bg-gray-100 p-3">
          { }
          <p className="mb-1 text-xs text-gray-500">반복주기 및 기간</p>
          { }
          <p className="text-sm text-gray-800">
            {formatSchedule(recommendation)}
          </p>
        </div>

        {/* 체크리스트 */}
        {recommendation.checklists?.length ? (
          <div className="rounded-lg bg-gray-100 p-3">
            { }
            <p className="mb-1 text-xs text-gray-500">체크리스트</p>
            <ul className="space-y-1">
              {recommendation.checklists.map((item) => (
                <li key={item} className="text-sm text-gray-800">
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
             
            className="mt-1 w-full rounded-sm bg-primary-100 py-1 text-sm font-semibold text-primary-main"
          >
            선택하기
          </button>
        )}
      </div>
    </div>
  );
}

export default RecommendationCard;
