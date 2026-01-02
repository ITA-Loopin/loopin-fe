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
  const baseButtonStyles =
    "flex h-[38px] w-full items-center justify-center gap-[10px] px-[42px] py-[9px] text-sm font-semibold transition-colors";
  const activeButtonStyles =
    "rounded-[5px] bg-[#FFE4E0] leading-[150%] tracking-[-0.28px] text-[#FF543F]";
  const inactiveButtonStyles =
    "rounded-[5px] bg-[#F0F2F3] leading-[150%] tracking-[-0.28px] text-[#C6CCD1]";
  const buttonRowStyles = "flex w-full items-start gap-2";

  const renderScheduleButton = (option: (typeof REPEAT_OPTIONS)[number]) => {
    const isActive = scheduleType === option.value;
    const isWeekly = option.value === "WEEKLY";

    return (
      <div key={option.value} className="relative flex-1">
        <button
          type="button"
          onClick={() => onSelectSchedule(option.value)}
          className={cn(
            baseButtonStyles,
            isActive ? activeButtonStyles : inactiveButtonStyles
          )}
        >
          {option.label}
        </button>
        {isWeekly && (
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
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <p className="text-xs font-medium leading-[140%] tracking-[-0.24px] text-[#A0A9B1]">
        반복 주기
      </p>

      {/* 첫 번째 줄: 매주, 매달 */}
      <div className={buttonRowStyles}>
        {REPEAT_OPTIONS.slice(0, 2).map(renderScheduleButton)}
      </div>

      {/* 매주 선택 시 요일 선택 영역 */}
      {scheduleType === "WEEKLY" && isWeeklyDropdownOpen && (
        <div className="flex w-full items-center justify-between gap-1">
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
                  "flex h-[40px] flex-1 flex-col items-center justify-center gap-[10px] px-1 py-2 text-sm font-semibold rounded-[5px]",
                  isSelected ? activeButtonStyles : inactiveButtonStyles
                )}
              >
                {DAY_LABELS[day]}
              </button>
            );
          })}
        </div>
      )}

      {/* 두 번째 줄: 매년, 안함 */}
      <div className={buttonRowStyles}>
        {REPEAT_OPTIONS.slice(2).map(renderScheduleButton)}
      </div>
    </div>
  );
}


