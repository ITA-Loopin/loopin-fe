"use client";

import type { LoopReportData, ReportStatus } from "./LoopReport";

type ProgressStatsCardProps = {
  status: ReportStatus;
  data: LoopReportData;
};

type StatCardProps = {
  label: string;
  value: string | number;
  isSmallText?: boolean;
};

function StatCard({ label, value, isSmallText = false }: StatCardProps) {
  return (
    <div className="flex flex-1 flex-col items-start gap-4 rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-[#8F8A87]">{label}</p>
      <p className={isSmallText ? "text-xs text-[#2C2C2C]" : "text-3xl font-semibold text-[#2C2C2C]"}>{value}</p>
    </div>
  );
}

export function ProgressStatsCard({
  status,
  data,
}: ProgressStatsCardProps) {
  const isEmpty = status === "EMPTY";

  return (
    <div className="space-y-3 w-full">
      {/* 두 개의 작은 카드 - 나란히 배치 */}
      <div className="flex items-stretch gap-8 -mx-6 px-10 w-[calc(100%+48px)]">
        {isEmpty ? (
          <>
            <StatCard
              label="최근 일주일 동안은"
              value="루프가 설정되지 않았어요"
              isSmallText
            />
            <StatCard
              label="최근 10일 동안"
              value="0%"
            />
          </>
        ) : (
          <>
            <StatCard
              label="일주일 동안"
              value={`${data.weekLoopCount}/${data.totalLoopCount}개`}
            />
            <StatCard
              label="최근 10일 동안"
              value={`${data.tenDayProgress}%`}
            />
          </>
        )}
      </div>
    </div>
  );
}

