import { IconButton } from "@/components/common/IconButton";
import { cn } from "@/lib/utils";
import {
  DAY_LABELS,
  DAY_OPTIONS,
  DayOption,
  REPEAT_OPTIONS,
  WEEKDAY_OPTIONS,
} from "./constants";

type ScheduleSelectorProps = {
  scheduleType: string;
  isWeeklyDropdownOpen: boolean;
  daysOfWeek: string[];
  onSelectSchedule: (value: string) => void;
  onToggleDay: (day: DayOption) => void;
};

export function ScheduleSelector({
  scheduleType,
  isWeeklyDropdownOpen,
  daysOfWeek,
  onSelectSchedule,
  onToggleDay,
}: ScheduleSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[#676A79]">반복 주기</p>

      <div className="grid grid-cols-2 gap-2">
        {REPEAT_OPTIONS.slice(0, 2).map((option) => {
          const isActive = scheduleType === option.value;

          if (option.value === "WEEKLY") {
            return (
              <div key={option.value} className="relative">
                <button
                  type="button"
                  onClick={() => onSelectSchedule(option.value)}
                  className={cn(
                    "flex w-full items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-[#FFADA1] bg-[#FFF4F2] text-[#FF7765]"
                      : "border-[#F0F2F3] bg-[#F0F2F3] text-[#8D91A1]"
                  )}
                >
                  {option.label}
                </button>
                <IconButton
                  src="/addloopsheet/addloopsheet_dropdown.svg"
                  alt="요일 선택"
                  width={14}
                  height={14}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectSchedule(option.value);
                  }}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 transition-transform",
                    isActive && isWeeklyDropdownOpen ? "rotate-180" : ""
                  )}
                />
              </div>
            );
          }

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectSchedule(option.value)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                isActive
                  ? "border-[#FFADA1] bg-[#FFF4F2] text-[#FF7765]"
                  : "border-[#F0F2F3] bg-[#F0F2F3] text-[#8D91A1]"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {scheduleType === "WEEKLY" && isWeeklyDropdownOpen && (
        <div className="grid grid-cols-8 gap-2">
          {DAY_OPTIONS.map((day) => {
            const isEveryday = day === "EVERYDAY";
            const isEverydaySelected = daysOfWeek.length === WEEKDAY_OPTIONS.length;
            const isSelected = isEveryday
              ? isEverydaySelected
              : !isEverydaySelected && daysOfWeek.includes(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => onToggleDay(day)}
                className={cn(
                  "rounded-xl border px-2 py-2 text-sm font-semibold tracking-[-0.02em] leading-[1.5]",
                  isSelected
                    ? "border-[#FFADA1] bg-[#FFF4F2] text-[#FF7765]"
                    : "border-[#F0F2F3] bg-[#F0F2F3] text-[#8D91A1]"
                )}
              >
                {DAY_LABELS[day]}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {REPEAT_OPTIONS.slice(2).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelectSchedule(option.value)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
              scheduleType === option.value
                ? "border-[#FFADA1] bg-[#FFF4F2] text-[#FF7765]"
                : "border-[#F0F2F3] bg-[#F0F2F3] text-[#8D91A1]"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}


