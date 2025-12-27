"use client";

import type { ReportMessages } from "./reportMessages";
import type { LoopReportData } from "./LoopReport";

type ProgressStatsCardProps = {
  messages: ReportMessages;
  data: LoopReportData;
};

type StatCardProps = {
  label: string;
  value: string | number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex flex-1 flex-col items-start gap-4 rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-[#8F8A87]">{label}</p>
      <p className="text-3xl font-semibold text-[#2C2C2C]">{value}</p>
    </div>
  );
}

export function ProgressStatsCard({
  messages,
  data,
}: ProgressStatsCardProps) {
  return (
    <div className="space-y-3 w-full">
      {/* 두 개의 작은 카드 - 나란히 배치 */}
      <div className="flex items-start gap-8 -mx-6 px-10 w-[calc(100%+48px)]">
        <StatCard
          label="일주일 동안"
          value={`${data.weekLoopCount}/${data.totalLoopCount}개`}
        />
        <StatCard
          label="최근 10일 동안"
          value={`${data.tenDayProgress}%`}
        />
      </div>
    </div>
  );
}

