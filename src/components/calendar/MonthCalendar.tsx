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

/**
 * 날짜의 상태를 판단하여 객체로 반환하는 함수
 * @param date 판단할 날짜
 * @param visibleMonth 현재 표시 중인 월
 * @param selectedDate 선택된 날짜
 * @param today 오늘 날짜
 * @returns 날짜 상태 객체
 */
function getDateState(
  date: Dayjs,
  visibleMonth: Dayjs,
  selectedDate: Dayjs,
  today: Dayjs
) {
  return {
    isCurrentMonth: date.isSame(visibleMonth, "month"),
    isSelected: date.isSame(selectedDate, "day"),
    isToday: date.isSame(today, "day"),
  };
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
  const monthLabel = visibleMonth.format("YYYY년 M월");
  const startOfMonth = visibleMonth.startOf("month");
  const endOfMonth = visibleMonth.endOf("month");
  const startOfCalendar = startOfMonth.startOf("week");
  const endOfCalendar = endOfMonth.endOf("week");
  const today = dayjs();
  const days = generateCalendarDays(startOfCalendar, endOfCalendar);

  return (
    <section className="flex flex-col items-center gap-[24px] self-stretch w-full px-[10px] pb-6">
      {/* 달력 헤더 */}
      <header className="flex items-center justify-between w-[150px] text-[#7E828F]">
        <button
          type="button"
          onClick={() => onChangeMonth(-1)}
          className="flex w-[25px] h-[25px] py-[9px] px-[10px] items-center gap-[10px] shrink-0 rounded-[12.5px] bg-[var(--gray-white,#FFF)]"
          aria-label="이전 달"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-base font-bold leading-[150%] tracking-[-0.32px] text-[var(--gray-800,#3A3D40)]">
            {monthLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChangeMonth(1)}
          className="flex w-[25px] h-[25px] py-[9px] px-[10px] items-center gap-[10px] shrink-0 rounded-[12.5px] bg-[var(--gray-white,#FFF)]"
          aria-label="다음 달"
        >
          ›
        </button>
      </header>

      {/* 겉 레이아웃 */}
      <div className="flex flex-col items-start w-full max-w-[328px] sm:max-w-[500px] p-3 sm:p-4 gap-[10px] rounded-[10px] bg-[var(--gray-white,#FFF)]">
        {/* 안 레이아웃 - 요일과 날짜를 함께 감싸는 grid */}
        <div className="grid text-sm font-medium w-full max-w-[295px] sm:max-w-[500px] gap-y-4 sm:gap-y-6 gap-x-4 sm:gap-x-[25px] grid-cols-7 auto-rows-[21px] pb-4">
          {/* 요일 */}
          {DAY_NAMES.map((day, index) => (
            <span
              key={`${index}-${day}`}
              className={`text-center text-sm font-semibold leading-[150%] tracking-[-0.28px] ${
                index === 0 
                  ? "text-[#FF7765]" 
                  : "text-[var(--gray-800,#3A3D40)]"
              }`}
            >
              {day}
            </span>
          ))}
          
          {/* 날짜 */}
          {days.map((date) => {
            const { isCurrentMonth, isSelected, isToday } = getDateState(
              date,
              visibleMonth,
              selectedDate,
              today
            );
            const isDisabled = minDate ? date.isBefore(minDate, "day") : false;

            return (
              <DayButton
                key={date.toString()}
                date={date}
                isCurrentMonth={isCurrentMonth}
                isSelected={isSelected}
                isToday={isToday}
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