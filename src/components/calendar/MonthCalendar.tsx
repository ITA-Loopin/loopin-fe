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
};

export function MonthCalendar({
  visibleMonth,
  selectedDate,
  onSelectDate,
  onChangeMonth,
}: MonthCalendarProps) {
  const monthLabel = visibleMonth.format("YYYY년 M월");
  const startOfMonth = visibleMonth.startOf("month");
  const endOfMonth = visibleMonth.endOf("month");
  const startOfCalendar = startOfMonth.startOf("week");
  const endOfCalendar = endOfMonth.endOf("week");
  const today = dayjs();
  const days = generateCalendarDays(startOfCalendar, endOfCalendar);

  return (
    <section className="flex flex-col items-center gap-[24px] self-stretch w-full max-w-[420px] rounded-[30px] border border-[#F4F4F6] bg-white px-6 pb-6 pt-5">
      <header className="flex items-center justify-between w-[150px] text-[#7E828F]">
        <button
          type="button"
          onClick={() => onChangeMonth(-1)}
          className="grid h-7 w-7 place-items-center text-base font-semibold transition-colors hover:text-[#4F525E]"
          aria-label="이전 달"
        >
          ‹
        </button>
        <div className="text-center text-[#2C2C2C]">
          <p className="text-base font-semibold">{monthLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => onChangeMonth(1)}
          className="grid h-7 w-7 place-items-center text-base font-semibold transition-colors hover:text-[#4F525E]"
          aria-label="다음 달"
        >
          ›
        </button>
      </header>

      <div 
        className="grid text-center text-sm font-medium text-[#B7BAC7]"
        style={{
          width: '295px',
          columnGap: '25px',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))'
        }}
      >
        {DAY_NAMES.map((day, index) => (
          <span
            key={`${index}-${day}`}
            className={index === 0 ? "text-[#FF7765]" : undefined}
          >
            {day}
          </span>
        ))}
      </div>

      <div 
        className="grid text-sm font-medium"
        style={{
          width: '295px',
          height: '246px',
          rowGap: '24px',
          columnGap: '25px',
          gridTemplateRows: '21px 21px 21px 21px 21px minmax(0, 1fr)',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))'
        }}
      >
        {days.map((date) => {
          const { isCurrentMonth, isSelected, isToday } = getDateState(
            date,
            visibleMonth,
            selectedDate,
            today
          );

          return (
            <DayButton
              key={date.toString()}
              date={date}
              isCurrentMonth={isCurrentMonth}
              isSelected={isSelected}
              isToday={isToday}
              onSelectDate={onSelectDate}
            />
          );
        })}
      </div>
    </section>
  );
}