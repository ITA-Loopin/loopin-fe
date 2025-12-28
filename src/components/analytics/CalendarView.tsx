"use client";

import { useMemo, useState, useCallback } from "react";
import dayjs, { type Dayjs } from "dayjs";

type CalendarViewType = "week" | "month";

type CalendarViewProps = {
  completedDates: string[]; // YYYY-MM-DD
  weekAverageProgress: number;
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

export function CalendarView({ completedDates, weekAverageProgress, onViewTypeChange }: CalendarViewProps) {
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

  // 현재 뷰 범위에 해당하는 완료 날짜 Set
  const completedDatesSet = useMemo(() => {
    const filtered = completedDates.filter((d) => inRange(d, rangeStartKey, rangeEndKey));
    return new Set(filtered);
  }, [completedDates, rangeStartKey, rangeEndKey]);

  const isCompleted = useCallback(
    (date: Dayjs) => completedDatesSet.has(formatDateKey(date)),
    [completedDatesSet]
  );

  const isCurrentMonth = useCallback(
    (date: Dayjs) => date.isSame(visibleMonth, "month"),
    [visibleMonth]
  );

  const isToday = useCallback((date: Dayjs) => date.isSame(today, "day"), [today]);

  const handleChangeMonth = (offset: number) => {
    setVisibleMonth((prev) => prev.add(offset, "month"));
  };

  // 공통 날짜 셀 렌더 함수
  const renderDateCell = (date: Dayjs, options?: { dimOutOfMonth?: boolean; showTodayStyle?: boolean }) => {
    const dateKey = formatDateKey(date);
    const completed = isCompleted(date);
    const day = date.date();

    const dimOutOfMonth = options?.dimOutOfMonth ?? false;
    const showTodayStyle = options?.showTodayStyle ?? false;

    const currentMonth = dimOutOfMonth ? isCurrentMonth(date) : true;
    const todayFlag = showTodayStyle ? isToday(date) : false;

    const className = `flex h-8 w-8 items-center justify-center rounded-full text-xs ${
      dimOutOfMonth && !currentMonth
        ? "text-[#B7BAC7]"
        : completed
          ? "border-2 border-[#FF543F] text-[#2C2C2C]"
          : todayFlag
            ? "text-[#2C2C2C]"
            : "text-[#8F8A87]"
    }`;

    return (
      <div key={dateKey} className={`${className} mx-auto`}>
        {day}
      </div>
    );
  };

  return (
    <div className="-mx-6 px-10 w-[calc(100%+48px)]">
      <div className="rounded-xl bg-white px-4 py-6 shadow-sm">
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
            <div className="mb-3 grid grid-cols-7 text-sm font-medium text-[#B7BAC7]">
              {DAY_NAMES.map((day, index) => (
                <div key={`${index}-${day}`} className="flex h-8 w-8 items-center justify-center mx-auto">
                  <span className={index === 0 ? "text-[#FF7765]" : undefined}>
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 text-sm font-medium">
              {dates.map((date) => renderDateCell(date, { dimOutOfMonth: true, showTodayStyle: true }))}
            </div>
          </>
        )}

          {viewType === "week" && (
            <>
              <p className="mb-4 text-sm font-semibold text-[#2C2C2C]">
                일주일동안 평균 {weekAverageProgress}% 루프를 채웠어요!
              </p>
              <div className="flex justify-between">
               {dates.map((date) => renderDateCell(date))}
              </div>
            </>
          )}
      </div>
    </div>
  );
}
