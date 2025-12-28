"use client";

import type { LoopReportData, ReportStatus } from "@/types/report";
import type { ReactNode } from "react";

type ProgressStatsCardProps = {
  status: ReportStatus;
  data: LoopReportData;
};

type StatCardProps =
  | {
      variant?: "metric";
      label: string;
      value: ReactNode;
    }
  | {
      variant: "message";
      message: ReactNode;
    };

function StatCard(props: StatCardProps) {
  const base =
    "flex h-[108px] flex-col items-start gap-3 rounded-xl bg-white p-4 shadow-sm min-w-0";

  if (props.variant === "message") {
    return (
      <div className={base}>
        <p className="text-sm font-medium leading-[150%] tracking-[-0.28px] text-[var(--gray-500,#A0A9B1)] whitespace-pre-line">
          {props.message}
        </p>
      </div>
    );
  }

  return (
    <div className={base}>
      <p className="text-sm font-medium leading-[150%] tracking-[-0.28px] text-[var(--gray-700,#4D5155)]">
        {props.label}
      </p>
      <p className="text-[42px] font-extrabold leading-[37px] tracking-[-0.84px] uppercase text-[var(--gray-800,#3A3D40)]">
        {props.value}
      </p>
    </div>
  );
}

export function ProgressStatsCard({ status, data }: ProgressStatsCardProps) {
  const isEmpty = status === "NONE";

  const leftCard = isEmpty ? (
    <StatCard variant="message" message={`최근 일주일 동안은\n루프가 설정되지\n않았어요`} />
  ) : (
    <StatCard
      label="일주일 동안"
      value={`${data.weekLoopCount}/${data.totalLoopCount}개`}
    />
  );

  const rightCard = (
    <StatCard label="최근 10일 동안" value={`${data.tenDayProgress}%`} />
  );

  return (
    <div className="-mx-6 px-10 w-[calc(100%+48px)]">
      <div className="grid grid-cols-2 gap-4">
        {leftCard}
        {rightCard}
      </div>
    </div>
  );
}
