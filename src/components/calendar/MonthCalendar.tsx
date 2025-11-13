import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];

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

  const days: Dayjs[] = [];
  let current = startOfCalendar;
  while (current.isBefore(endOfCalendar) || current.isSame(endOfCalendar, "day")) {
    days.push(current);
    current = current.add(1, "day");
  }

  return (
    <section className="w-full max-w-[420px] rounded-[30px] border border-[#F4F4F6] bg-white px-6 pb-6 pt-5">
      <header className="flex items-center justify-center gap-4 text-[#7E828F]">
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

      <div className="mt-5 grid grid-cols-7 text-center text-sm font-medium text-[#B7BAC7]">
        {DAY_NAMES.map((day, index) => (
          <span
            key={`${index}-${day}`}
            className={index === 0 ? "text-[#FF7765]" : undefined}
          >
            {day}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-y-4 text-sm font-medium">
        {days.map((date) => {
          const isCurrentMonth = date.isSame(visibleMonth, "month");
          const isSelected = date.isSame(selectedDate, "day");
          const isToday = date.isSame(today, "day");

          return (
            <button
              key={date.toString()}
              type="button"
              onClick={() => onSelectDate(date)}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center justify-self-center rounded-full transition-all",
                isSelected
                  ? "bg-[#FF7765] text-white shadow-[0px_8px_18px_rgba(255,119,101,0.32)]"
                  : isCurrentMonth
                    ? "text-[#3B3B45] hover:bg-[#FFE5DF]"
                    : "text-[#D4D6E0]"
              )}
            >
              {isToday && !isSelected ? (
                <span className="absolute -z-[1] h-9 w-9 rounded-full border border-dashed border-[#FFB7AB]" />
              ) : null}
              <span>{date.date()}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}