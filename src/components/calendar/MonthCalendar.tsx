import { useMemo, useState, useRef } from "react";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { DayButton } from "./DayButton";

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * 캘린더에 표시할 날짜 배열을 생성하는 함수
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @returns Dayjs 객체 배열
 */
function generateCalendarDays(startDate: Dayjs, endDate: Dayjs): Dayjs[] {
  const days: Dayjs[] = [];
  let current = startDate;
  while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
    days.push(current);
    current = current.add(1, "day");
  }
  return days;
}

type MonthCalendarProps = {
  visibleMonth: Dayjs;
  selectedDate: Dayjs;
  onSelectDate: (date: Dayjs) => void;
  onChangeMonth: (offset: number) => void;
  minDate?: Dayjs;
};

export function MonthCalendar({
  visibleMonth,
  selectedDate,
  onSelectDate,
  onChangeMonth,
  minDate,
}: MonthCalendarProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onChangeMonth(1); // 다음 달
    }
    if (isRightSwipe) {
      onChangeMonth(-1); // 이전 달
    }
  };

  const { monthLabel, days } = useMemo(() => {
    const monthLabel = visibleMonth.format("YYYY년 M월");
    const startOfMonth = visibleMonth.startOf("month");
    const endOfMonth = visibleMonth.endOf("month");
    // 일요일 시작으로 고정 (DAY_NAMES와 일치)
    const startOfCalendar = startOfMonth.subtract(startOfMonth.day(), "day");
    const endOfCalendar = endOfMonth.add(6 - endOfMonth.day(), "day");
    const days = generateCalendarDays(startOfCalendar, endOfCalendar);
    return { monthLabel, days };
  }, [visibleMonth]);

  return (
    <section 
      className="flex flex-col items-center gap-[24px] pb-6 transition-opacity duration-300 ease-in-out"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 달력 헤더 */}
      <header className="grid grid-cols-[auto_auto_auto] items-center gap-[10px] justify-center mt-6 w-full">
        <button
          type="button"
          onClick={() => onChangeMonth(-1)}
          className="flex w-[25px] h-[25px] py-[9px] px-[10px] items-center gap-[10px] shrink-0 rounded-[12.5px] bg-[var(--gray-white)]"
          aria-label="이전 달"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="6" height="8" viewBox="0 0 6 8" fill="none" >
            <path d="M4.75928 0.5L0.759277 4L4.75928 7.5" stroke="#3A3D40" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="text-center">
          <p className="text-body-1-b text-[var(--gray-800)]">
            {monthLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChangeMonth(1)}
          className="flex w-[25px] h-[25px] py-[9px] px-[10px] items-center gap-[10px] shrink-0 rounded-[12.5px] bg-[var(--gray-white)]"
          aria-label="다음 달"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="6" height="8" viewBox="0 0 6 8" fill="none" className="-scale-x-100">
            <path d="M4.75928 0.5L0.759277 4L4.75928 7.5" stroke="#3A3D40" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      {/* 겉 레이아웃 */}
      <div className="flex flex-col flex-shrink items-start w-full p-4 gap-[10px] rounded-[10px] bg-[var(--gray-white)]">
        {/* 안 레이아웃 - 요일과 날짜를 함께 감싸는 grid */}
        <div 
          key={visibleMonth.format("YYYY-MM")}
          className="grid w-full gap-y-6 gap-x-[25px] grid-cols-7 auto-rows-[21px] pb-[6px] transition-opacity duration-300 ease-in-out"
        >
          {/* 요일 */}
          {DAY_NAMES.map((day, index) => (
            <span
              key={index}
              className={`text-center text-body-2-sb ${
                index === 0 
                  ? "text-[var(--primary-main)]" 
                  : "text-[var(--gray-800)]"
              }`}
            >
              {day}
            </span>
          ))}
          
          {/* 날짜 */}
          {days.map((date) => {
            const isCurrentMonth = date.isSame(visibleMonth, "month");
            const isSelected = date.isSame(selectedDate, "day");
            const isDisabled = minDate ? date.isBefore(minDate, "day") : false;

            return (
              <DayButton
                key={date.format("YYYY-MM-DD")}
                date={date}
                isCurrentMonth={isCurrentMonth}
                isSelected={isSelected}
                isDisabled={isDisabled}
                onSelectDate={onSelectDate}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}