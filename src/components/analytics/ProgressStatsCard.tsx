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
      opacity?: number;
    }
  | {
      variant: "message";
      message: ReactNode;
      opacity?: number;
    };

function StatCard(props: StatCardProps) {
  const opacity = props.opacity ?? 100;
  const base =
    "flex h-[108px] flex-col items-start gap-3 rounded-xl p-4 min-w-0";

  if (props.variant === "message") {
    return (
      <div className={base} style={{ backgroundColor: `rgba(255, 255, 255, ${opacity / 100})` }}>
        <p className="text-sm font-medium leading-[150%] tracking-[-0.28px] text-[var(--gray-500,#A0A9B1)] whitespace-pre-line">
          {props.message}
        </p>
      </div>
    );
  }

  return (
    <div className={base} style={{ backgroundColor: `rgba(255, 255, 255, ${opacity / 100})` }}>
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
  
  const getOpacity = () => {
    switch (status) {
      case "NONE":
        return 100;
      case "HARD":
        return 70;
      case "OK":
        return 50;
      case "GOOD":
        return 50;
      default:
        return 100;
    }
  };
  
  const opacity = getOpacity();

  const leftCard = isEmpty ? (
    <StatCard variant="message" message={`최근 일주일 동안은\n루프가 설정되지\n않았어요`} opacity={opacity} />
  ) : (
    <StatCard
      label="일주일 동안"
      value={`${data.weekLoopCount}/${data.totalLoopCount}개`}
      opacity={opacity}
    />
  );

  const rightCard = (
    <StatCard label="최근 10일 동안" value={`${data.tenDayProgress}%`} opacity={opacity} />
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
