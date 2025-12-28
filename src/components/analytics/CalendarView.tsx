"use client";

import { useMemo, useState, useCallback } from "react";
import dayjs, { type Dayjs } from "dayjs";
import type { ReportStatus } from "@/types/report";

type CalendarViewType = "week" | "month";

type CalendarViewProps = {
  dateProgressMap: Record<string, number>; // 날짜별 진행률 맵 (YYYY-MM-DD: 0-100)
  weekAverageProgress: number;
  status?: ReportStatus;
  onViewTypeChange?: (viewType: CalendarViewType) => void;
};

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];

// inclusive range
function generateCalendarDays(startDate: Dayjs, endDate: Dayjs): Dayjs[] {
  const days: Dayjs[] = [];
  let current = startDate;
  while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
    days.push(current);
    current = current.add(1, "day");
  }
  return days;
}

const formatDateKey = (date: Dayjs) => date.format("YYYY-MM-DD");

function inRange(dateStr: string, startStr: string, endStr: string) {
  // YYYY-MM-DD 포맷이면 문자열 비교로도 날짜 순서 유지
  return dateStr >= startStr && dateStr <= endStr;
}

export function CalendarView({ dateProgressMap, weekAverageProgress, status, onViewTypeChange }: CalendarViewProps) {
  const [viewType, setViewType] = useState<CalendarViewType>("week");
  const [visibleMonth, setVisibleMonth] = useState(dayjs());

  const handleViewTypeChange = (newViewType: CalendarViewType) => {
    setViewType(newViewType);
    onViewTypeChange?.(newViewType);
  };

  const today = useMemo(() => dayjs(), []);

  // 현재 뷰의 시작/끝(필터 범위) + 표시할 dates를 한 번에 계산
  const { dates, rangeStartKey, rangeEndKey } = useMemo(() => {
    if (viewType === "week") {
      const startOfWeek = today.startOf("week");
      const endOfWeek = startOfWeek.add(6, "day");
      const ds = generateCalendarDays(startOfWeek, endOfWeek);

      return {
        dates: ds,
        rangeStartKey: formatDateKey(startOfWeek),
        rangeEndKey: formatDateKey(endOfWeek),
      };
    }

    // month
    const startOfMonth = visibleMonth.startOf("month");
    const endOfMonth = visibleMonth.endOf("month");
    const startOfCalendar = startOfMonth.startOf("week");
    const endOfCalendar = endOfMonth.endOf("week");
    const ds = generateCalendarDays(startOfCalendar, endOfCalendar);

    return {
      dates: ds,
      rangeStartKey: formatDateKey(startOfMonth),
      rangeEndKey: formatDateKey(endOfMonth),
    };
  }, [viewType, visibleMonth, today]);

  // 날짜별 진행률 가져오기
  const getProgress = useCallback(
    (date: Dayjs) => {
      const dateKey = formatDateKey(date);
      return dateProgressMap[dateKey] ?? 0;
    },
    [dateProgressMap]
  );

  const isCurrentMonth = useCallback(
    (date: Dayjs) => date.isSame(visibleMonth, "month"),
    [visibleMonth]
  );

  const isToday = useCallback((date: Dayjs) => date.isSame(today, "day"), [today]);

  const handleChangeMonth = (offset: number) => {
    setVisibleMonth((prev) => prev.add(offset, "month"));
  };

  // 원형 진행률 컴포넌트
  const CircularProgress = ({ progress, size = 32 }: { progress: number; size?: number }) => {
    const radius = (size - 4) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        {/* 배경 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E5E5"
          strokeWidth="2"
        />
        {/* 진행률 원 */}
        {progress > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#FF543F"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        )}
      </svg>
    );
  };

  // 공통 날짜 셀 렌더 함수
  const renderDateCell = (date: Dayjs, options?: { dimOutOfMonth?: boolean; showTodayStyle?: boolean }) => {
    const dateKey = formatDateKey(date);
    const progress = getProgress(date);
    const day = date.date();

    const dimOutOfMonth = options?.dimOutOfMonth ?? false;
    const showTodayStyle = options?.showTodayStyle ?? false;

    const currentMonth = dimOutOfMonth ? isCurrentMonth(date) : true;
    const todayFlag = showTodayStyle ? isToday(date) : false;

    const textColor = dimOutOfMonth && !currentMonth
      ? "text-[#B7BAC7]"
      : todayFlag
        ? "text-[#2C2C2C]"
        : "text-[#8F8A87]";

    // 진행률이 0이면 원형 진행률 없이 숫자만 표시
    if (progress === 0) {
      return (
        <div key={dateKey} className="flex h-8 w-8 items-center justify-center mx-auto">
          <span className={`text-xs ${textColor}`}>
            {day}
          </span>
        </div>
      );
    }

    // 진행률이 0보다 크면 원형 진행률과 함께 표시
    return (
      <div key={dateKey} className="relative flex items-center justify-center mx-auto" style={{ width: 32, height: 32 }}>
        <CircularProgress progress={progress} size={32} />
        <span className={`absolute text-xs ${textColor}`}>
          {day}
        </span>
      </div>
    );
  };

  const getOpacity = () => {
    if (!status) return 100;
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

  return (
    <div className="-mx-6 px-10 w-[calc(100%+48px)]">
      <div className="rounded-xl px-4 py-6" style={{ backgroundColor: `rgba(255, 255, 255, ${opacity / 100})` }}>
        {/* 주간/월간 토글 */}
        <div className="mb-4 flex items-start gap-[10px] rounded-[86px] bg-[var(--gray-200,#F0F2F3)] p-1.5">
          <button
            type="button"
            onClick={() => handleViewTypeChange("week")}
            className={`flex-1 px-4 py-2 transition ${
              viewType === "week" 
                ? "rounded-[86px] bg-[var(--gray-600,#737980)] text-xs font-semibold leading-[140%] tracking-[-0.24px] text-[var(--gray-white,#FFF)]" 
                : "text-xs font-semibold leading-[140%] tracking-[-0.24px] text-[var(--gray-400,#C6CCD1)]"
            }`}
          >
            주간
          </button>
          <button
            type="button"
            onClick={() => handleViewTypeChange("month")}
            className={`flex-1 px-4 py-2 transition ${
              viewType === "month" 
                ? "rounded-[86px] bg-[var(--gray-600,#737980)] text-xs font-semibold leading-[140%] tracking-[-0.24px] text-[var(--gray-white,#FFF)]" 
                : "text-xs font-semibold leading-[140%] tracking-[-0.24px] text-[var(--gray-400,#C6CCD1)]"
            }`}
          >
            월간
          </button>
        </div>

        {viewType === "month" && (
          <>
            {/* 요일 헤더 */}
            <div className="mb-3 grid grid-cols-7 gap-4">
              {DAY_NAMES.map((day, index) => (
                <div key={`${index}-${day}`} className="flex items-center justify-center">
                  <span className={`text-xs font-semibold leading-[140%] tracking-[-0.24px] text-center ${
                    index === 0 ? "text-[var(--primary-main,#FF543F)]" : "text-[var(--gray-800,#3A3D40)]"
                  }`}>
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-4 text-sm font-medium">
              {dates.map((date) => renderDateCell(date, { dimOutOfMonth: true, showTodayStyle: true }))}
            </div>
          </>
        )}

          {viewType === "week" && (
            <>
              <p className="mb-4 ml-3 text-base font-semibold leading-[150%] tracking-[-0.32px] text-[var(--gray-800,#3A3D40)]">
                {status === "NONE" 
                  ? "최근 7일간 루프가 설정되지 않았어요"
                  : `일주일동안 평균 ${weekAverageProgress}% 루프를 채웠어요!`}
              </p>
              <div className="flex gap-4">
               {dates.map((date) => renderDateCell(date))}
              </div>
            </>
          )}
      </div>
    </div>
  );
}
